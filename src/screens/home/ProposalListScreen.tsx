import React, { useContext, useEffect, useState } from 'react';
import { View, Image, FlatList, Alert } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useIsFocused } from '@react-navigation/core';
import { ThemeContext } from 'styled-components/native';
import FilterButton from '~/components/button/FilterButton';
import ProposalCard from '~/components/proposal/ProposalCard';
import {
    Enum_Proposal_Status,
    Enum_Proposal_Type,
    MemberRole,
    Proposal,
    useGetMemberRolesLazyQuery,
    useGetMemberRolesQuery,
    useGetProposalsConnectionLazyQuery,
    useGetProposalsConnectionQuery,
} from '~/graphql/generated/generated';
import { MainNavProps } from '~/navigation/types/MainStackParams';
import globalStyle from '~/styles/global';
import { ProposalFilterType } from '~/types/filterType';
import { ProposalContext } from '~/contexts/ProposalContext';
import ActionCreators from '~/state/actions';
import LocalStorage from '~/utils/LocalStorage';
import ListFooterButton from '~/components/button/ListFooterButton';
import { LocalStorageProposalProps } from '~/utils/LocalStorage/LocalStorageTypes';
import getString from '~/utils/locales/STRINGS';
import _ from 'lodash';

const FETCH_INIT_LIMIT = 5;
const FETCH_MORE_LIMIT = 5;

function renderTitle(type: 'MY' | 'TEMP' | 'JOIN') {
    if (type === 'MY') {
        return getString('내가 작성한 제안');
    }
    if (type === 'TEMP') {
        return getString('임시저장 제안');
    }
    if (type === 'JOIN') {
        return getString('내가 참여한 제안');
    }
}

function dateToStringDate(date: Date): string {
    return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
}

function convertProposalToLocalProps(item: Proposal): LocalStorageProposalProps {
    return {
        id: item.id,
        name: item.name,
        description: item.description || '',
        type: item.type,
        fundingFee: item.fundingAmount ? Number(item.fundingAmount) : undefined,
        startDate: item.votePeriod?.begin ? dateToStringDate(item.votePeriod.begin) : undefined,
        endDate: item.votePeriod?.end ? dateToStringDate(item.votePeriod.end) : undefined,
        status: item.status,
        timestamp: Date.now(),
    };
}

const ProposalListScreen = ({ navigation, route }: MainNavProps<'ProposalList'>) => {
    const { type, query } = route.params;
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();
    const dispatch = useDispatch();
    const [proposals, setProposals] = useState<Proposal[]>();
    const [proposalCount, setProposalCount] = useState<number>();
    // TODO: filter 버튼을 통해 변경할 경우 , filter state 가 변경됩니다.
    const [filter, setFilter] = useState<ProposalFilterType>(ProposalFilterType.LATEST);
    const { fetchProposal } = useContext(ProposalContext);

    const [
        getMyProposals,
        { data: resProposalsConnectionData, fetchMore: myTypeFetchMore },
    ] = useGetProposalsConnectionLazyQuery({ fetchPolicy: 'no-cache' });
    const [getJoinProposals, { data: resMemberRolesData, fetchMore: joinTypeFetchMore }] = useGetMemberRolesLazyQuery({
        fetchPolicy: 'no-cache',
    });

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            title: renderTitle(type),
            headerTitleStyle: { ...globalStyle.headerTitle, color: 'white' },
            headerLeft: () => (
                <Button
                    onPress={() => navigation.goBack()}
                    icon={<Image source={require('@assets/icons/header/arrowWhiteBack.png')} />}
                    type="clear"
                />
            ),
            headerBackground: () => (
                <Image
                    style={{ height: 55 + insets.top, width: '100%' }}
                    source={require('@assets/images/header/bg.png')}
                />
            ),
        });
    }, [navigation]);

    useEffect(() => {
        if (isFocused && type === 'TEMP') {
            LocalStorage.getTemporaryProposals().then((tempDatas) => {
                const parsing = tempDatas.map((temp) => {
                    const item: Proposal = {
                        id: temp.id || '',
                        _id: temp.id || '',
                        name: temp.name,
                        description: temp.description,
                        type: temp.type as Enum_Proposal_Type,
                        status: temp.status as Enum_Proposal_Status,
                        fundingAmount: temp.fundingFee,
                        votePeriod: {
                            id: 'testVotePeriod',
                            _id: 'testVotePeriod',
                            begin: temp.startDate ? new Date(temp.startDate) : undefined,
                            end: temp.endDate ? new Date(temp.endDate) : undefined,
                        },
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };
                    return item;
                });
                setProposals(parsing);
                setProposalCount(parsing.length);
            });
        }
    }, [isFocused, type]);

    useEffect(() => {
        if (filter) {
            const sort = filter === ProposalFilterType.LATEST ? 'createdAt:desc' : 'member_count:desc';
            if (type === 'JOIN') {
                getJoinProposals({
                    variables: {
                        sort,
                        limit: FETCH_INIT_LIMIT,
                        where: query,
                    },
                });
            } else if (type === 'MY') {
                getMyProposals({
                    variables: {
                        sort,
                        limit: FETCH_INIT_LIMIT,
                        where: query,
                    },
                });
            }
        }
    }, [filter, type]);

    useEffect(() => {
        if (type === 'JOIN' && resMemberRolesData?.memberRolesConnection?.values) {
            const exported = resMemberRolesData?.memberRolesConnection.values.map((memberRole) => {
                return memberRole?.proposal as Proposal;
            });
            const filtered = _.uniqBy(exported, 'id');
            setProposals(filtered);
            setProposalCount(filtered.length || 0);
        }
    }, [resMemberRolesData]);

    useEffect(() => {
        if (type === 'MY' && resProposalsConnectionData?.proposalsConnection?.values) {
            setProposals(resProposalsConnectionData?.proposalsConnection?.values as Proposal[]);
            setProposalCount(resProposalsConnectionData.proposalsConnection.aggregate?.count || 0);
        }
    }, [resProposalsConnectionData]);

    function renderCountBar(type: 'MY' | 'TEMP' | 'JOIN') {
        if (type === 'MY') {
            return (
                <View style={{ paddingHorizontal: 20, paddingTop: 30, backgroundColor: 'white' }}>
                    <Text style={{ ...globalStyle.ltext, fontSize: 10 }}>
                        {getString('작성완료 제안 N').replace('N', proposalCount?.toString() || '0')}
                    </Text>
                </View>
            );
        }
        if (type === 'TEMP') {
            return (
                <View style={{ paddingHorizontal: 20, paddingTop: 30, backgroundColor: 'white' }}>
                    <Text style={{ ...globalStyle.ltext, fontSize: 10 }}>
                        {getString('작성중인 제안 N').replace('N', proposalCount?.toString() || '0')}
                    </Text>
                </View>
            );
        }
        if (type === 'JOIN') {
            return (
                <View
                    style={[
                        globalStyle.flexRowBetween,
                        {
                            paddingHorizontal: 20,
                            paddingTop: 30,
                            backgroundColor: 'white',
                        },
                    ]}
                >
                    <Text style={{ ...globalStyle.ltext, fontSize: 10 }}>
                        {getString('참여한 제안 N').replace('N', proposalCount?.toString() || '0')}
                    </Text>
                    <FilterButton filterType={ProposalFilterType} currentFilter={filter} setFilter={setFilter} />
                </View>
            );
        }
    }
    function renderProposals({ item }: { item: Proposal }) {
        const { name, description, status, assessPeriod, votePeriod, proposalId } = item;
        if (type !== 'TEMP' && !proposalId) return null;

        return (
            <View style={{ paddingHorizontal: 22, backgroundColor: 'white' }}>
                <ProposalCard
                    title={name}
                    description={description || ''}
                    type={item.type}
                    status={status}
                    assessPeriod={assessPeriod!}
                    votePeriod={votePeriod!}
                    onPress={() => {
                        if (type === 'TEMP') {
                            //TODO 임시저장데이터 파라미터로 넘겨주기
                            navigation.navigate('CreateScreens', {
                                screen: 'CreateProposal',
                                params: { saveData: convertProposalToLocalProps(item) },
                            });
                        } else {
                            if (item.proposalId) {
                                fetchProposal(item.proposalId);
                                navigation.navigate('ProposalDetail', { id: item.proposalId });
                            } else {
                                dispatch(
                                    ActionCreators.snackBarVisibility({
                                        visibility: true,
                                        text: '제안서 ID가 부여되지 않았습니다',
                                    }),
                                );
                            }
                        }
                    }}
                    onDelete={() => {
                        Alert.alert(getString('임시제안 삭제'), getString(`작성중인 제안서를 삭제하시겠습니까`), [
                            {
                                text: 'Cancel',
                                onPress: () => {
                                    console.log('cancel pressed');
                                },
                                style: 'cancel',
                            },
                            {
                                text: 'OK',
                                onPress: () => {
                                    try {
                                        LocalStorage.deleteTemporaryProposal(item.id);
                                        const filtered = proposals?.filter((proposal) => proposal.id !== item.id);
                                        setProposals(filtered);
                                        setProposalCount(filtered?.length);
                                    } catch (err) {
                                        console.log('catch exception while delete : ', err);
                                        dispatch(
                                            ActionCreators.snackBarVisibility({
                                                visibility: true,
                                                text: getString('삭제하는 중에 오류가 발생했습니다'),
                                            }),
                                        );
                                    }
                                },
                            },
                        ]);
                    }}
                />
            </View>
        );
    }

    return (
        <FlatList
            style={{ flex: 1 }}
            onScrollEndDrag={() => {
                if (myTypeFetchMore) {
                    if (type === 'MY') {
                        myTypeFetchMore({
                            variables: {
                                limit: FETCH_MORE_LIMIT,
                                start: proposals?.length,
                            },
                        })
                            .then(({ data }) => {
                                const moreProposals: Proposal[] = data.proposalsConnection?.values as Proposal[];
                                setProposals([...(proposals || []), ...moreProposals]);
                            })
                            .catch(console.log);
                    }
                    if (type === 'JOIN') {
                        if (joinTypeFetchMore)
                            joinTypeFetchMore({
                                variables: {
                                    limit: FETCH_MORE_LIMIT,
                                    start: proposals?.length,
                                },
                            })
                                .then(({ data }) => {
                                    const moreMemberRoles = data.memberRolesConnection?.values as MemberRole[];
                                    const moreProposals = moreMemberRoles.map((role) => role?.proposal as Proposal);
                                    setProposals([...(proposals || []), ...moreProposals]);
                                })
                                .catch(console.log);
                    }
                }
            }}
            ListHeaderComponent={renderCountBar(type)}
            data={proposals}
            renderItem={renderProposals}
            ListFooterComponent={<ListFooterButton onPress={() => console.log('click')} />}
        />
    );
};

export default ProposalListScreen;
