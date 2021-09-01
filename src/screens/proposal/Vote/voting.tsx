import React, { useContext, useState, useEffect } from 'react';
import styled, { ThemeContext } from 'styled-components/native';
import { useDispatch } from 'react-redux';
import { View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Text } from 'react-native-elements';
import globalStyle from '~/styles/global';
import ActionCreators from '~/state/actions';
import ProposalCard from '~/components/proposal/ProposalCard';
import { Post, Proposal, useGetProposalsQuery } from '~/graphql/generated/generated';
import ShortButton from '~/components/button/ShortButton';
import { AuthContext } from '~/contexts/AuthContext';
import { ProposalContext } from '~/contexts/ProposalContext';
import { VOTE_SELECT } from '~/utils/voterautil';
import VoteItem, { getVoteString } from '~/components/vote/VoteItem';
import VoteItemGroup from '~/components/vote/VoteItemGroup';
import VoteHistoryComponent from './voteHIstoryComponent';
import getString from '~/utils/locales/STRINGS';

interface Props {
    runVote: (vote: VOTE_SELECT) => Promise<boolean>;
    onChangeVote: () => void;
    isVoted?: Post;
    otherVotes?: Post[];
    voteComplete: boolean;
}

const Container = styled.View`
    padding-top: 41px;
    align-items: center;
`;

const Voting = (props: Props) => {
    const { isVoted, otherVotes } = props;
    const { proposal, fetchProposal } = useContext(ProposalContext);
    const { user, isGuest } = useContext(AuthContext);
    const navigation = useNavigation();
    const themeContext = useContext(ThemeContext);
    const dispatch = useDispatch();

    const [vote, setVote] = useState<VOTE_SELECT | undefined>(undefined);
    const [oldVote, setOldVote] = useState<VOTE_SELECT>();
    const [isSelected, setIsSelected] = useState(false);
    const [voteComplete, setVoteComplete] = useState(props.voteComplete);
    const [otherProposals, setOtherProposals] = useState<Proposal[]>([]);

    const { data: resProposalsData } = useGetProposalsQuery({
        variables: {
            sort: 'createdAt:desc',
            limit: 5,
        },
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
    });

    useEffect(() => {
        if (resProposalsData && resProposalsData.proposals?.length) {
            setOtherProposals(resProposalsData.proposals.filter((p) => p?.id !== proposal?.id) as Proposal[]);
        }
    }, [resProposalsData]);

    useEffect(() => {
        if (isVoted !== undefined) {
            const value = isVoted.content[0]?.single[0]?.value;
            if (typeof value === 'number') {
                setOldVote(value);
                setVote(value);
            }
        }
    }, [isVoted]);

    useEffect(() => {
        if (oldVote) {
            if (oldVote !== vote) {
                setIsSelected(true);
            } else {
                setIsSelected(false);
            }
        } else {
            if (vote) setIsSelected(true);
        }
    }, [vote]);

    const renderOtherProposals = ({ item }: { item: Proposal }) => {
        const { name, description, status, assessPeriod, votePeriod, type, proposalId } = item;
        return (
            <ProposalCard
                key={'otherProposal_' + item.id}
                title={name}
                description={description || ''}
                type={type}
                status={status}
                assessPeriod={assessPeriod!}
                votePeriod={votePeriod!}
                onPress={() => {
                    if (!proposalId) {
                        dispatch(
                            ActionCreators.snackBarVisibility({
                                visibility: true,
                                text: getString('제안서 정보에 오류가 있습니다'),
                            }),
                        );
                        navigation.goBack();
                    } else {
                        fetchProposal(proposalId);
                        navigation.navigate('ProposalDetail', { id: proposalId });
                    }
                }}
            />
        );
    };

    const selectStr = getString('투표 완료');

    return (
        <Container>
            {voteComplete ? (
                <>
                    <Text style={[globalStyle.btext, { color: themeContext.color.primary, marginTop: 18 }]}>
                        {getString('노드 {nodename} 으로').replace('{nodename}', user?.nodename || '')}
                    </Text>
                    <Text
                        style={[globalStyle.btext, { color: themeContext.color.primary, marginTop: 5 }]}
                    >{selectStr}</Text>

                    <ShortButton
                        title={getString('수정하기')}
                        buttonStyle={{ marginTop: 17 }}
                        onPress={() => {
                            setVoteComplete(false);
                            props.onChangeVote();
                        }}
                        filled
                    />

                    <View style={{ width: '100%', height: 1, backgroundColor: 'rgb(235,234,239)', marginTop: 38 }} />
                    <View style={{ width: '100%' }}>
                        {otherProposals.map((op) => renderOtherProposals({ item: op }))}
                    </View>
                </>
            ) : (
                <>
                    <Text style={[globalStyle.btext, { fontSize: 17, color: themeContext.color.primary }]}>
                        {getString('노드 ${nodename} 인증!').replace('${nodename}', user?.nodename || '')}
                    </Text>
                    <Text style={{ marginTop: 13 }}>{getString('제안에 대한 투표를 진행해주세요&#46;')}</Text>
                    <VoteItemGroup onPress={(type: VOTE_SELECT) => setVote(type)} vote={vote} />
                    <Button
                        onPress={() => {
                            if (isGuest) {
                                dispatch(
                                    ActionCreators.snackBarVisibility({
                                        visibility: true,
                                        text: getString('둘러보기 중에는 사용할 수 없습니다'),
                                    }),
                                );
                            } else {
                                if (typeof vote === 'number') {
                                    props.runVote(vote)
                                        .then((result) => {
                                            if (result) setVoteComplete(true);
                                        })
                                        .catch((err) => {
                                            dispatch(ActionCreators.snackBarVisibility({
                                                visibility: true,
                                                text: getString('투표 처리 중 오류가 발생했습니다&#46;')
                                            }));
                                        });
                                } else {
                                    setVoteComplete(true);
                                }
                            }
                        }}
                        buttonStyle={{ marginTop: 100 }}
                        title={isVoted !== undefined ? getString('수정하기') : getString('투표하기')}
                        titleStyle={[
                            globalStyle.btext,
                            {
                                fontSize: 20,
                                color: isSelected ? themeContext.color.primary : themeContext.color.disabled,
                                marginLeft: 6,
                            },
                        ]}
                        icon={
                            <Image
                                style={{
                                    tintColor: isSelected ? themeContext.color.primary : themeContext.color.disabled,
                                }}
                                source={require('@assets/icons/checkIcon.png')}
                            />
                        }
                        type="clear"
                        disabled={!isSelected}
                    />
                    {otherVotes?.length ? (
                        <View
                            style={{
                                width: '100%',
                                borderTopWidth: 3,
                                borderTopColor: themeContext.color.gray,
                                paddingTop: 30,
                                marginTop: 30,
                            }}
                        >
                            <Text>내 투표 기록</Text>
                            {otherVotes?.map((ov) => (
                                <VoteHistoryComponent
                                    key={'voteHistory_' + ov.id}
                                    type={ov.content[0]?.single[0]?.value}
                                    name={ov.writer?.username || ''}
                                    time={ov.updatedAt}
                                />
                            ))}
                        </View>
                    ) : null}
                </>
            )}
        </Container>
    );
};

export default Voting;
