import React, { useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
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
    GetPostsQuery,
    GetPostsDocument
} from '~/graphql/generated/generated';
import Authentication from './authentication';
import Voting from './voting';
import VoteResult from './result';
import PendingVote from './pendingVote';
import { ProposalContext } from '~/contexts/ProposalContext';
import { AuthContext } from '~/contexts/AuthContext';
import getString from '~/utils/locales/STRINGS';

interface Props {
    setIndex: (index: number) => void;
    onLayout: (h: number) => void;
}

const VoteScreen = (props: Props) => {
    const { onLayout } = props;
    const dispatch = useDispatch();
    const { proposal, isJoined, joinProposal } = useContext(ProposalContext);
    const { user, isGuest, getVoteSequence } = useContext(AuthContext);

    const [checked, setChecked] = useState(false);
    const [nodeAuth, setNodeAuth] = useState(false);
    const [isVoted, setIsVoted] = useState<Post>();
    const [otherVotes, setOtherVotes] = useState<Post[]>([]);
    const [voteComplete, setVoteComplete] = useState(false);
    const [validatorLogin, setValidatorLogin] = useState<ValidatorLogin>();
    const [validatorVote, setValidatorVote] = useState<ValidatorVote>();
    const [voteActivity, setVoteActivity] = useState<Activity>();

    const [submitVote] = useCreatePostMutation();
    const [updateVote] = useUpdatePostMutation();
    const [getPost, { data: voteResponseQueryData, refetch, loading }] = useGetPostsLazyQuery({
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        onCompleted: (data) => {
            setChecked(true);
        }
    });

    const { data: userData } = useMyMembersQuery();

    useEffect(() => {
        if (proposal) {
            const activityVote = proposal.activities?.find((activity) => activity?.type === Enum_Activity_Type.Poll);
            if (activityVote && userData?.myMembers) {
                setVoteActivity(activityVote as Activity);

                getPost({
                    variables: {
                        where: {
                            writer_in: userData.myMembers.members?.map((m) => m?.id),
                            activity: activityVote.id,
                        },
                    },
                });
            }
        }
    }, [proposal, userData]);

    useEffect(() => {
        if (voteResponseQueryData && voteResponseQueryData.posts) {
            const finded = voteResponseQueryData.posts.find((post) => user?.memberId && post?.writer?.id === user.memberId);
            if (finded) {
                setIsVoted(finded as Post);
                setVoteComplete(true);
                setNodeAuth(true);
            }
            setOtherVotes(
                voteResponseQueryData.posts.filter((post) => user?.memberId && post?.writer?.id !== user.memberId) as Post[],
            );
        }
    }, [voteResponseQueryData]);

    const runVote = async (vote: VOTE_SELECT): Promise<boolean> => {
        try {
            if (isGuest) {
                return false;
            }

            if (!proposal?.proposalId) {
                dispatch(
                    ActionCreators.snackBarVisibility({
                        visibility: true,
                        text: getString('Proposal 정보가 잘못 입력되었습니다&#46;'),
                    }),
                );
                return false;
            }
            if (!validatorLogin || !validatorVote) {
                dispatch(
                    ActionCreators.snackBarVisibility({
                        visibility: true,
                        text: getString('투표 준비 중 오류가 발생했습니다&#46;'),
                    }),
                );
                return false;
            }

            const voteLinkData = makeVoteLinkData(
                proposal?.proposalId,
                validatorLogin,
                validatorVote,
                vote,
                getVoteSequence());

            openProposalVoteLink(voteLinkData).catch((err) => {
                dispatch(
                    ActionCreators.snackBarVisibility({
                        visibility: true,
                        text: getString('지갑 실행 중 오류가 발생했습니다&#46;'),
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
                                writer: user?.memberId,
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
                    update(cache, { data }) {
                        const post = data?.createPost?.post;
                        if (!post) {
                            return;
                        }

                        const cacheReads = cache.readQuery<GetPostsQuery>({
                            query: GetPostsDocument,
                            variables: {
                                where: {
                                    writer_in: userData?.myMembers?.members?.map((m) => m?.id),
                                    activity: voteActivity?.id,
                                },
                            },
                        });

                        const posts = cacheReads && cacheReads.posts ? [post, ...cacheReads.posts] : [post];

                        cache.writeQuery({
                            query: GetPostsDocument,
                            variables: {
                                where: {
                                    writer_in: userData?.myMembers?.members?.map((m) => m?.id),
                                    activity: voteActivity?.id,
                                },
                            },
                            data: { posts }
                        });
                    }
                });
            }

            setVoteComplete(true);
            return true;
        } catch (err) {
            console.log('runVote catch exception: ', err);
            dispatch(
                ActionCreators.snackBarVisibility({
                    visibility: true,
                    text: getString('투표 처리 중 오류가 발생했습니다&#46;'),
                }),
            );
            return false;
        }
    };

    useEffect(() => {
        console.log(`checked=${checked}  loading=${loading}`);
    }, [checked, loading]);

    if (!checked || loading) {
        return <ActivityIndicator size="large" />
    }
    if (proposal?.status === Enum_Proposal_Status.PendingVote) {
        return (
            <View onLayout={(event) => {
                onLayout(event.nativeEvent.layout.height);
            }}>
                <PendingVote
                    onChangeStatus={() => {
                        console.log('detect vote fee paid');
                    }}
                />
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
                <Voting
                    runVote={runVote}
                    onChangeVote={() => {
                        setNodeAuth(false);
                        setVoteComplete(false);
                    }}
                    isVoted={isVoted}
                    otherVotes={otherVotes}
                    voteComplete={voteComplete}
                />
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
