import React, { useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useDispatch } from 'react-redux';
import { ValidatorLogin, ValidatorVote, makeVoteLinkData, VOTE_SELECT } from '~/utils/voterautil';
import { openProposalVoteLink } from '~/utils/linkutil';
import ActionCreators from '~/state/actions';
import {
    Activity,
    Enum_Activity_Type,
    Enum_Post_Type,
    Enum_Proposal_Status,
    Post,
    useCreatePostMutation,
    useGetPostsLazyQuery,
    useUpdatePostMutation,
    useMyMembersQuery,
    Enum_Post_Status,
} from '~/graphql/generated/generated';
import Authentication from './authentication';
import Voting from './voting';
import VoteResult from './result';
import PendingVote from './pendingVote';
import { ProposalContext } from '~/contexts/ProposalContext';
import { AuthContext } from '~/contexts/AuthContext';

interface Props {
    setIndex: (index: number) => void;
    onLayout: (h: number) => void;
}

const VoteScreen = (props: Props) => {
    const { onLayout } = props;
    const dispatch = useDispatch();
    const { proposal, isJoined, joinProposal } = useContext(ProposalContext);
    const { user, isGuest } = useContext(AuthContext);

    const [nodeAuth, setNodeAuth] = useState(true);
    const [isVoted, setIsVoted] = useState<Post>();
    const [otherVotes, setOtherVotes] = useState<Post[]>([]);
    const [validatorLogin, setValidatorLogin] = useState<ValidatorLogin>();
    const [validatorVote, setValidatorVote] = useState<ValidatorVote>();
    const [voteActivity, setVoteActivity] = useState<Activity>();

    const [submitVote] = useCreatePostMutation();
    const [updateVote] = useUpdatePostMutation();
    const [getPost, { data: voteResponseQueryData, refetch }] = useGetPostsLazyQuery({
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
    });

    const { data: userData } = useMyMembersQuery();

    useEffect(() => {
        if (proposal) {
            const voteActivity = proposal.activities?.find((activity) => activity?.type === Enum_Activity_Type.Poll);
            if (voteActivity && userData?.myMembers) {
                setVoteActivity(voteActivity as Activity);

                getPost({
                    variables: {
                        where: {
                            writer_in: userData.myMembers.members?.map((m) => m?.id),
                            activity: voteActivity.id,
                        },
                    },
                });
            }
        }
    }, [proposal, userData]);

    useEffect(() => {
        if (voteResponseQueryData && voteResponseQueryData.posts) {
            if (voteResponseQueryData.posts) {
                const finded = voteResponseQueryData.posts.find((post) => post?.writer?.id === user?.memberId);
                if (finded) {
                    setIsVoted(finded as Post);
                }
                setOtherVotes(
                    voteResponseQueryData.posts.filter((post) => post?.writer?.id !== user?.memberId) as Post[],
                );
            }
        }
    }, [voteResponseQueryData]);

    const runVote = async (vote: VOTE_SELECT) => {
        try {
            if (isGuest) {
                return;
            }

            if (!proposal?.proposalId) {
                dispatch(
                    ActionCreators.snackBarVisibility({
                        visibility: true,
                        text: 'Proposal 정보가 잘못 입력되었습니다.',
                    }),
                );
                return;
            }
            if (!validatorLogin || !validatorVote) {
                dispatch(
                    ActionCreators.snackBarVisibility({
                        visibility: true,
                        text: '투표 준비 중 오류가 발생했습니다',
                    }),
                );
                return;
            }

            const voteLinkData = makeVoteLinkData(proposal?.proposalId, validatorLogin, validatorVote, vote, 100);
            openProposalVoteLink(voteLinkData).catch((err) => {
                dispatch(
                    ActionCreators.snackBarVisibility({
                        visibility: true,
                        text: '지갑 실행 중 오류가 발생했습니다',
                    }),
                );
            });

            if (!isJoined) await joinProposal();

            if (isVoted) {
                await updateVote({
                    variables: {
                        input: {
                            where: {
                                id: isVoted.id,
                            },
                            data: {
                                content: voteActivity?.poll?.questions?.map((q) => ({
                                    __typename: 'ComponentPostSingleChoiceAnswer',
                                    selection: [{ value: vote }],
                                    sequence: 0,
                                    question: q?.id,
                                })),
                            },
                        },
                    },
                });
            } else {
                await submitVote({
                    variables: {
                        input: {
                            data: {
                                activity: voteActivity?.id,
                                type: Enum_Post_Type.PollResponse,
                                writer: user?.memberId,
                                status: Enum_Post_Status.Open,
                                content: voteActivity?.poll?.questions?.map((q) => ({
                                    __typename: 'ComponentPostSingleChoiceAnswer',
                                    selection: [{ value: vote }],
                                    sequence: 0,
                                    question: q?.id,
                                })),
                            },
                        },
                    },
                });
            }

            if (refetch) refetch();
        } catch (err) {
            console.log('runVote catch exception: ', err);
            dispatch(
                ActionCreators.snackBarVisibility({
                    visibility: true,
                    text: '투표 처리 중 오류가 발생했습니다',
                }),
            );
        }
    };

    if (proposal?.status === Enum_Proposal_Status.PendingVote) {
        return (
            <View onLayout={(event) => onLayout(event.nativeEvent.layout.height)}>
                <PendingVote />
            </View>
        );
    }

    return (
        <View
            onLayout={(event) => {
                onLayout(event.nativeEvent.layout.height + 50);
            }}
        >
            {proposal?.status === Enum_Proposal_Status.Closed ? (
                <VoteResult status={proposal?.status} data={proposal} />
            ) : nodeAuth || isGuest ? (
                <Voting runVote={runVote} isVoted={isVoted} otherVotes={otherVotes} />
            ) : (
                <Authentication
                    onNodeAuthComplete={(loginData, voteData) => {
                        setValidatorLogin(loginData);
                        setValidatorVote(voteData);
                        setNodeAuth(true);
                    }}
                />
            )}
        </View>
    );
};

export default VoteScreen;
