import React, { useEffect, useState, useContext } from 'react';
import { BackHandler, RefreshControl, ScrollView, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '~/contexts/AuthContext';
import { ProposalContext } from '~/contexts/ProposalContext';
import ProposalCard from '~/components/proposal/ProposalCard';
import ProposalTop from '~/components/proposal/ProposalTop';
import ProposalsHeader from '~/components/proposal/ProposalHeader';
import { Proposal, useGetProposalsLazyQuery, useGetProposalsQuery } from '~/graphql/generated/generated';
import { MainNavProps } from '~/navigation/types/MainStackParams';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import { ProposalFilterType } from '~/types/filterType';
import { isCloseToBottom } from '~/utils';
import ActionCreators from '~/state/actions';

const FETCH_INIT_LIMIT = 5;
const FETCH_MORE_LIMIT = 5;

const HomeScreen = ({ navigation, route }: MainNavProps<'Home'>) => {
    const { where } = route.params;
    const dispatch = useDispatch();
    const { user, isGuest } = useContext(AuthContext);
    const { fetchProposal } = useContext(ProposalContext);

    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [topProposal, setTopProposal] = useState<Proposal>();
    // TODO: filter 버튼을 통해 변경할 경우 , filter state 가 변경됩니다.
    const [filter, setFilter] = useState<ProposalFilterType>(ProposalFilterType.LATEST);
    const [isStopFetchMore, setStopFetchMore] = useState(false);
    const [pullRefresh, setPullRefresh] = useState(false);

    const [getProposals, { data: resProposalsData, fetchMore, refetch, loading }] = useGetProposalsLazyQuery({
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        notifyOnNetworkStatusChange: true,
    });

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                if (route.name === '프로젝트' || route.name === '오픈예정') {
                    dispatch(ActionCreators.snackBarVisibility({ visibility: false }));
                    BackHandler.exitApp();
                    return true;
                }
                return false;
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, []),
    );

    useEffect(() => {
        if (resProposalsData) {
            const [topProposal, ...otherProposals] = resProposalsData.proposals as Proposal[];
            setProposals(otherProposals);
            setTopProposal(topProposal);
            setPullRefresh(false);
        }
    }, [resProposalsData, loading]);

    useEffect(() => {
        if (filter) {
            const sort = filter === ProposalFilterType.LATEST ? 'createdAt:desc' : 'memberCount:desc';
            getProposals({
                variables: {
                    sort,
                    limit: FETCH_INIT_LIMIT,
                    where,
                },
            });
        }
    }, [filter]);

    function renderProposalTop(item: Proposal) {
        const { name, description, status, assessPeriod, votePeriod, type, proposalId } = item;
        if (!proposalId) return null;
        return (
            <ProposalTop
                title={name}
                description={description || ''}
                type={type}
                status={status}
                assessPeriod={assessPeriod!}
                votePeriod={votePeriod!}
                topImage={require('@assets/images/header/bgLong.png')}
                onPress={() => {
                    fetchProposal(proposalId);
                    navigation.navigate('ProposalDetail', { id: proposalId });
                }}
            />
        );
    }

    function renderProposals({ item }: { item: Proposal }) {
        const { name, description, status, assessPeriod, votePeriod, type, proposalId } = item;
        if (!proposalId) return null;

        return (
            <ProposalCard
                key={'proposalCard_' + item.id}
                title={name}
                description={description || ''}
                type={type}
                status={status}
                assessPeriod={assessPeriod!}
                votePeriod={votePeriod!}
                onPress={() => {
                    fetchProposal(proposalId);
                    navigation.navigate('ProposalDetail', { id: proposalId });
                }}
            />
        );
    }

    return (
        <>
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor="white" />
            <ScrollView
                onScroll={({ nativeEvent }) => {
                    if (isCloseToBottom(nativeEvent) && !isStopFetchMore && !loading) {
                        const currentLength = proposals.length || 0;

                        if (fetchMore) {
                            fetchMore({
                                variables: { limit: FETCH_MORE_LIMIT, start: currentLength },
                            })
                                .then((fetchMoreResult) => {
                                    const length = fetchMoreResult.data.proposals?.length || 0;
                                    if (length < 1) setStopFetchMore(true);
                                })
                                .catch(console.log);
                        }
                    }
                }}
                scrollEventThrottle={500}
                refreshControl={
                    <RefreshControl
                        refreshing={pullRefresh}
                        onRefresh={() => {
                            if (refetch) refetch();
                            setPullRefresh(true);
                        }}
                    />
                }
            >
                {topProposal && renderProposalTop(topProposal)}
                <ProposalsHeader
                    username={isGuest || !user ? 'Guest' : user.username || ''}
                    currentFilter={filter}
                    setFilter={setFilter}
                />
                <View style={{ backgroundColor: 'white', paddingHorizontal: 22 }}>
                    {proposals.map((proposal) => {
                        return renderProposals({ item: proposal });
                    })}
                </View>
            </ScrollView>
        </>
    );
};

export default HomeScreen;
