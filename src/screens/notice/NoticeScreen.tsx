import React, { useContext, useState, useEffect, useRef } from 'react';
import { View, Image, FlatList } from 'react-native';
import { Button, Icon, Text } from 'react-native-elements';
import globalStyle from '~/styles/global';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainNavProps } from '~/navigation/types/MainStackParams';
import { Enum_Post_Status, Enum_Post_Type, Post, useGetCommentPostsQuery } from '~/graphql/generated/generated';
import NoticeCard from '~/components/notice/NoticeCard';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import ListFooterButton from '~/components/button/ListFooterButton';
import { ProposalContext } from '~/contexts/ProposalContext';
import { AuthContext } from '~/contexts/AuthContext';
import getString from '~/utils/locales/STRINGS';

const FETCH_MORE_LIMIT = 5;
// const HEADER_BG_WIDTH = Dimensions.get('window').width;

const NoticeScreen = ({ navigation, route }: MainNavProps<'Notice'>) => {
    const scrollViewRef = useRef<FlatList<any>>(null);
    const insets = useSafeAreaInsets();
    const { proposal, isReported } = useContext(ProposalContext);
    const { user } = useContext(AuthContext);

    const [noticeData, setNoticeData] = useState<Post[]>([]);
    const [isCreator, setIsCreator] = useState(true);

    const { data: noticeQueryData } = useGetCommentPostsQuery({
        variables: {
            where: { activity: route.params.id, type: Enum_Post_Type.BoardArticle, status: Enum_Post_Status.Open },
            sort: 'createdAt:desc',
            limit: FETCH_MORE_LIMIT,
        },
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
    });

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            title: getString('공지사항'),
            headerTitleStyle: { ...globalStyle.headerTitle, color: 'white' },
            headerLeft: () => (
                <Button
                    onPress={() => navigation.goBack()}
                    icon={<Image source={require('@assets/icons/header/arrowWhiteBack.png')} />}
                    type="clear"
                />
            ),
            headerRight: () =>
                isCreator ? (
                    <Button
                        onPress={() => navigation.navigate('CreateNotice', { id: route.params.id })}
                        icon={<Icon name="add" color={'white'} />}
                        type="clear"
                    />
                ) : null,
            headerBackground: () => (
                <Image
                    style={{ height: 55 + insets.top, width: '100%' }}
                    source={require('@assets/images/header/bg.png')}
                />
            ),
        });
    }, [navigation, route, isCreator]);

    useEffect(() => {
        if (proposal) {
            setIsCreator(proposal.creator?.id === user?.memberId);
        }
    }, [proposal]);

    useEffect(() => {
        if (noticeQueryData?.listPosts) {
            setNoticeData(noticeQueryData.listPosts.filter(post => post && !isReported(post.id)) as Post[]);
        } else {
            setNoticeData([]);
        }
    }, [noticeQueryData]);

    const renderNotices = ({ item }: { item: Post }) => {
        return (
            <NoticeCard
                noticeAId={route.params.id}
                noticeData={item}
            />
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'rgb(242,244,250)' }}>
            <FocusAwareStatusBar barStyle="light-content" />

            <FlatList
                ref={scrollViewRef}
                data={noticeData}
                renderItem={renderNotices}
                contentContainerStyle={{ paddingBottom: 86 }}
                ListHeaderComponent={
                    <View
                        style={{
                            height: 53,
                            backgroundColor: 'white',
                            borderTopLeftRadius: 25,
                            borderTopRightRadius: 25,
                            justifyContent: 'center',
                            paddingHorizontal: 22,
                        }}
                    >
                        <Text style={globalStyle.ltext}>{`공지글 ${noticeData?.length}`}</Text>
                    </View>
                }
                ListFooterComponent={<ListFooterButton onPress={() => console.log('click')} />}
            />
        </View>
    );
};

export default NoticeScreen;
