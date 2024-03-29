import React, { useState, useEffect, useContext } from 'react';
import { View, Image } from 'react-native';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { Button, Icon, Text } from 'react-native-elements';
import globalStyle from '~/styles/global';
import { MainNavProps } from '~/navigation/types/MainStackParams';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FeedCard from '~/components/feed/FeedCard';
import { getFeed, getNavigationType } from '~/utils/feed/feedUtils';
import { FlatList } from 'react-native-gesture-handler';
import { Feeds, useGetFeedsConnectionQuery, useGetFeedsQuery } from '~/graphql/generated/generated';
// import { useNotificationsSubscription } from '~/graphql/hooks/Subscriptions';
import { useUpdateFeed } from '~/graphql/hooks/Feed';
import { FeedFilterType } from '~/types/filterType';
import FilterButton from '~/components/button/FilterButton';
import { AuthContext } from '~/contexts/AuthContext';
import getString from '~/utils/locales/STRINGS';

const Feed = ({ route, navigation }: MainNavProps<'Feed'>) => {
    const insets = useSafeAreaInsets();

    const { feedAddress, myMemberIds, user } = useContext(AuthContext);
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerTitleAlign: 'center',
            headerTitle: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={require('@assets/images/votera/voteraLogoWhite.png')} />
                    <Text style={[globalStyle.btext, { color: 'white', fontSize: 16, paddingLeft: 7 }]}>{getString('알림')}</Text>
                </View>
            ),
            headerLeft: () => (
                <Button
                    onPress={() => navigation.goBack()}
                    icon={<Image source={require('@assets/icons/header/arrowWhiteBack.png')} />}
                    type="clear"
                />
            ),
            headerBackground: () => (
                <Image
                    style={{
                        height: 55 + insets.top,
                        width: '100%',
                    }}
                    source={require('@assets/images/header/bg.png')}
                />
            ),
        });
    });

    const [feeds, setFeeds] = useState<Feeds[]>();
    const [feedCount, setFeedCount] = useState<number>();
    const [feedTotalCount, setFeedTotalCount] = useState<number>();
    // filter 버튼을 통해 변경할 경우 , filter state 가 변경됩니다.
    const [filter, setFilter] = useState<FeedFilterType>(FeedFilterType.LATEST);
    const [feedQuery, setFeedQuery] = useState<any>({ target: feedAddress });
    const updateFeed = useUpdateFeed();
    // const [mutateUpdateFeed, { data: updatedFeedData }] = useUpdateFeedMutation();
    const { data: feedsData, fetchMore: fetchMoreUseGetNotificationsQuery } = useGetFeedsQuery({
        skip: !feedAddress,
        variables: {
            sort: 'createdAt:desc',
            limit: 5,
            where: feedQuery,
        },
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
    });
    const { data: noReadFeedsConnectionData, refetch: refetchFeedConnection } = useGetFeedsConnectionQuery({
        skip: !feedAddress,
        variables: {
            where: {
                target: feedAddress,
                isRead: false,
            },
        },
    });
    const { data: totalFeedsConnectionData } = useGetFeedsConnectionQuery({
        skip: !feedAddress,
        variables: {
            where: {
                target: feedAddress,
            },
        },
    });
    // const { loading, error, data: subResponse } = useNotificationsSubscription({
    //     variables: {
    //         input: {
    //             berId: feedAddress,
    //         },
    //     },
    // });

    useEffect(() => {
        if (filter && feedAddress) {
            console.log('🚀 ~ filter<FeedFilter>', filter);
            let query: { target: string; isRead?: boolean } = { target: feedAddress || '' };

            if (filter === FeedFilterType.READ) {
                query = { target: feedAddress || '', isRead: true };
            }
            if (filter === FeedFilterType.NO_READ) {
                query = { target: feedAddress || '', isRead: false };
            }
            setFeedQuery(query);
        }
    }, [filter]);

    useEffect(() => {
        if (feedsData) {
            setFeeds((feedsData?.feeds as Feeds[]) || []);
        }
    }, [feedsData]);

    useEffect(() => {
        if (noReadFeedsConnectionData) {
            const { count: noReadCount } = noReadFeedsConnectionData.feedsConnection?.aggregate!;
            setFeedCount(noReadCount || 0);
        }
    }, [noReadFeedsConnectionData]);
    useEffect(() => {
        if (totalFeedsConnectionData) {
            const { count: totalCount } = totalFeedsConnectionData.feedsConnection?.aggregate!;
            setFeedTotalCount(totalCount || 0);
        }
    }, [totalFeedsConnectionData]);

    function renderFeedCard({ item }: { item: Feeds }) {
        const { id, type, content, navigation: navigationParams, createdAt, isRead } = item;

        const { feedContent } = getFeed(type, content);
        let newIsRead = item.isRead!;

        return (
            <FeedCard
                id={id}
                content={feedContent || getString('오류')}
                date={createdAt}
                isRead={newIsRead}
                onPress={() => {
                    getNavigationType(type, navigationParams, navigation);
                    newIsRead ||
                        updateFeed(id)
                            .then((result) => {
                                if (result && result?.data?.updateFeed?.feed) {
                                    if (refetchFeedConnection) refetchFeedConnection();
                                }
                            })
                            .catch(console.log);
                    item.isRead = true;
                }}
            />
        );
    }

    return (
        <>
            <KeyboardAwareFlatList
                enableResetScrollToCoords={false}
                onScrollEndDrag={() => {
                    fetchMoreUseGetNotificationsQuery &&
                        fetchMoreUseGetNotificationsQuery({
                            variables: {
                                limit: 5,
                                start: feeds?.length,
                            },
                        }).then(({ data }) => {
                            const moreFeeds = data.feeds;
                            setFeeds(feeds?.length === 0 ? [...moreFeeds] : [...feeds, ...moreFeeds]);
                        });
                }}
                style={{
                    flex: 1,
                    backgroundColor: 'white',
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    top: 0,
                    paddingVertical: 29,
                    paddingHorizontal: 23,
                }}
                ListHeaderComponent={
                    <View style={[globalStyle.flexRowBetween, { paddingBottom: 2 }]}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ fontSize: 13, fontFamily: 'NotoSansCJKkrLight' }}>{getString('새알림')}</Text>
                            <Text style={{ fontSize: 13, fontFamily: 'NotoSansCJKkrLight', paddingLeft: 10 }}>
                                {feedCount || 0}/{feedTotalCount || 0}
                            </Text>
                        </View>
                        <FilterButton filterType={FeedFilterType} currentFilter={filter} setFilter={setFilter} />
                    </View>
                }
                keyExtractor={(item, index) => 'feed_' + index}
                data={feeds}
                renderItem={renderFeedCard}
            />
        </>
    );
};

export default Feed;
