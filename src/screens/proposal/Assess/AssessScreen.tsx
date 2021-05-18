import React, { useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthContext } from '~/contexts/AuthContext';
import { ProposalContext } from '~/contexts/ProposalContext';
import {
    Activity,
    Enum_Activity_Type,
    Enum_Post_Status,
    Enum_Post_Type,
    Enum_Proposal_Status,
    SummarizeResponse,
    useCreatePostMutation,
    useGetActivityLazyQuery,
    useGetPostsLazyQuery,
    useMyMembersQuery
} from '~/graphql/generated/generated';
import Evaluating, { AssessResult } from './evaluating';
import PendingAssess from './pendingAssess';
import EvaluationResult from './result';

interface Props {
    // proposalId: string;
    assessResultData: SummarizeResponse;
    onLayout: (h: number) => void;
    refetchAssess: () => void;
    onChangeStatus: () => void;
}

const AssessScreen: React.FC<Props> = (props) => {
    const { assessResultData, onLayout, refetchAssess } = props;
    const { proposal, isJoined, joinProposal } = useContext(ProposalContext);
    const { user } = useContext(AuthContext);
    const [didEvaluation, setDidEvaluation] = useState(false);
    const [assessActivity, setAssessActivity] = useState<Activity>();
    const [submitAssess, { data: postData, error }] = useCreatePostMutation();
    const [getActivity, { data: activityQueryData }] = useGetActivityLazyQuery();

    const [getPost, { data: assessResponseQueryData, loading: postLoading }] = useGetPostsLazyQuery({
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
    });

    const { data: userData, loading: userLoading } = useMyMembersQuery({
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
    });

    useEffect(() => {
        if (proposal) {
            const assessActivity = proposal.activities?.find(
                (activity) => activity?.type === Enum_Activity_Type.Survey,
            );
            if (assessActivity && userData?.myMembers) {
                getActivity({ variables: { id: assessActivity.id } });
                getPost({
                    variables: {
                        where: {
                            writer_in: userData.myMembers.members?.map((m) => m?.id),
                            activity: assessActivity.id,
                        },
                    },
                });
            }

            // setAssessActivity(assessActivity as Activity);
        }
    }, [proposal, userData]);

    useEffect(() => {
        if (assessResponseQueryData && assessResponseQueryData.posts) {
            const finded = assessResponseQueryData.posts.find((post) => post?.writer?.id === user?.memberId);
            if (finded) {
                setDidEvaluation(true);
            }
        }
    }, [assessResponseQueryData]);

    useEffect(() => {
        if (activityQueryData?.activity) {
            console.log('assessActivity : ', activityQueryData.activity);
            setAssessActivity(activityQueryData.activity as Activity);
        }
    }, [activityQueryData]);

    const submitResponse = async (data: AssessResult[]) => {
        try {
            if (!isJoined) await joinProposal();
            await submitAssess({
                variables: {
                    input: {
                        data: {
                            activity: assessActivity?.id,
                            type: Enum_Post_Type.SurveyResponse,
                            writer: user?.memberId,
                            status: Enum_Post_Status.Open,
                            content: assessActivity?.survey?.questions?.map((q) => {
                                if (q?.sequence !== undefined)
                                    return {
                                        __typename: 'ComponentPostScaleAnswer',
                                        value: data[q?.sequence].value,
                                        sequence: data[q?.sequence].key,
                                        question: q.id,
                                    };
                            }),
                        },
                    },
                },
            });
            refetchAssess();
            setDidEvaluation(true);
        } catch (e) {
            console.log('Create Assess error : ', e);
        }
    };

    if (proposal?.status === Enum_Proposal_Status.PendingAssess) {
        return (
            <View onLayout={(event) => onLayout(event.nativeEvent.layout.height)}>
                <PendingAssess onChangeStatus={props.onChangeStatus} />
            </View>
        );
    }

    if (userLoading || postLoading) {
        return (
            <View onLayout={(event) => onLayout(event.nativeEvent.layout.height)}>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    return (
        <View onLayout={(event) => onLayout(event.nativeEvent.layout.height + 50)}>
            {didEvaluation ? (
                <EvaluationResult assessResultData={assessResultData} />
            ) : (
                <Evaluating onEvaluating={submitResponse} />
            )}
        </View>
    );
};

export default AssessScreen;
