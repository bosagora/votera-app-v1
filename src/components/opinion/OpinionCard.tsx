/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Text, Divider, Icon, Button } from 'react-native-elements';

import { useDispatch } from 'react-redux';
import MultilineInput from '~/components/input/MultiLineInput';
import CommentCard from '~/components/opinion/CommentCard';
import {
    Enum_Post_Status,
    Enum_Post_Type,
    GetCommentPostsDocument,
    Post,
    useCreatePostMutation,
    useGetCommentPostsQuery,
} from '~/graphql/generated/generated';
import ActionCreators from '~/state/actions';
import globalStyle from '~/styles/global';
import { sinceCalc } from '~/utils/time';
import { AuthContext } from '~/contexts/AuthContext';
import CommentButton from '../button/CommentButton';
import CommentLikeButton from '../button/CommentLikeButton';
import { ProposalContext } from '~/contexts/ProposalContext';
import { debounce, isArguments } from 'lodash';
import { useInteraction } from '~/graphql/hooks/Interactions';
import { useCreateFollow } from '~/graphql/hooks/Follow';
import push from '~/services/FcmService';
import getString from '~/utils/locales/STRINGS';

interface OpinionCardProps {
    postId: string;
    activityId: string;
    nickname: string;
    description: string;
    created: Date;
    replyCount: number;
    likeCount: number;
    isLiked: boolean;
}

const styles = StyleSheet.create({
    contents: {
        backgroundColor: 'white',
        paddingTop: 35,
    },
});

interface ReplyProps {
    activityId: string;
    postId: string;
    closeReply: () => void;
}
const Reply = (props: ReplyProps) => {
    const dispatch = useDispatch();
    const { user, isGuest, feedAddress } = useContext(AuthContext);
    const { isJoined, joinProposal, isReported } = useContext(ProposalContext);
    const { activityId, postId, closeReply } = props;
    const [text, setText] = useState('');
    const [replyData, setReplyData] = useState<Post[]>();

    const [createCommentMutation] = useCreatePostMutation();
    const createFollow = useCreateFollow();

    const { data: replyQueryData, loading } = useGetCommentPostsQuery({
        variables: {
            where: { activity: activityId, parentPost: postId, type: Enum_Post_Type.CommentOnPost, status: Enum_Post_Status.Open },
            sort: 'createdAt:desc',
        },
    });

    useEffect(() => {
        if (replyQueryData?.listPosts) {
            setReplyData(replyQueryData.listPosts.filter(post => post && !isReported(post.id)) as Post[]);
        } else {
            setReplyData([]);
        }
    }, [replyQueryData]);

    const createReComment = async () => {
        try {
            // dispatch(ActionCreators.loadingAniModal({ visibility: true }));
            if (isGuest) {
                dispatch(
                    ActionCreators.snackBarVisibility({
                        visibility: true,
                        text: '둘러보기 중에는 사용할 수 없습니다',
                    }),
                );
                return;
            }

            if (!text) return;
            if (!isJoined) await joinProposal();

            const createdComment = await createCommentMutation({
                variables: {
                    input: {
                        data: {
                            type: Enum_Post_Type.CommentOnPost,
                            activity: activityId,
                            parentPost: postId,
                            status: Enum_Post_Status.Open,
                            content: [
                                {
                                    __typename: 'ComponentPostCommentOnActivity',
                                    text,
                                },
                            ],
                            writer: user?.memberId,
                        },
                    },
                },
                update(cache, { data: { createPost } }) {
                    const cacheReads = cache.readQuery({
                        query: GetCommentPostsDocument,
                        variables: {
                            where: { activity: activityId, parentPost: postId, type: Enum_Post_Type.CommentOnPost, status: Enum_Post_Status.Open },
                            sort: 'createdAt:desc',
                        },
                    });

                    const listPosts = [createPost.post, ...cacheReads?.listPosts];

                    cache.writeQuery({
                        query: GetCommentPostsDocument,
                        variables: {
                            where: { activity: activityId, parentPost: postId, type: Enum_Post_Type.CommentOnPost, status: Enum_Post_Status.Open },
                            sort: 'createdAt:desc',
                        },
                        data: { listPosts },
                    });

                    const parentReads = cache.readQuery({
                        query: GetCommentPostsDocument,
                        variables: {
                            where: { activity: activityId, type: Enum_Post_Type.CommentOnActivity, status: Enum_Post_Status.Open },
                            sort: 'createdAt:desc',
                        },
                    });
                    const parents = [...parentReads?.listPosts];
                    const parentPostIndex = parents.findIndex((post) => post.id === postId);

                    if (~parentPostIndex) {
                        parents.splice(parentPostIndex, 1, {
                            ...parents[parentPostIndex],
                            childPosts: listPosts,
                        });
                        cache.writeQuery({
                            query: GetCommentPostsDocument,
                            variables: {
                                where: { activity: activityId, type: Enum_Post_Type.CommentOnActivity, status: Enum_Post_Status.Open },
                                sort: 'createdAt:desc',
                            },
                            data: {
                                listPosts: parents,
                            },
                        });
                    }
                },
            });
            if (!isJoined && feedAddress) {
                const pushData = await push.useGetCurrentPushLocalStorage();
                await createFollow(
                    feedAddress,
                    [createdComment.data?.createPost?.post?.activity?.proposal?.id!],
                    pushData?.id,
                    pushData?.enablePush,
                ).catch(console.log);
            }
            dispatch(
                ActionCreators.snackBarVisibility({ visibility: true, text: getString('글이 등록 되었습니다&#46;') }),
            );
            setText('');
            // if (commentRefetch) commentRefetch();
        } catch (err) {
            console.log(err);
        } finally {
            // dispatch(ActionCreators.loadingAniModal({ visibility: false }));
        }
    };

    if (loading) return <ActivityIndicator style={{ marginVertical: 10 }} />;

    return (
        <>
            <Text style={{ fontFamily: 'RobotoRegular', fontSize: 13 }}>
                {getString('N개 답글').replace('N', replyData?.length.toString() || '0')}
            </Text>
            {replyData?.map((reply) => {
                const status = isReported(reply.id) ? 'REPORTED' : reply.status || Enum_Post_Status.Open;
                return <CommentCard
                    key={'reply_' + reply.id}
                    activityId={reply.activity?.id || ''}
                    postId={reply.id}
                    created={reply.createdAt}
                    description={reply.content?.find(e => true)?.text || ''}
                    nickname={reply.writer?.username || 'nickname'}
                    status={status}
                />;
            })}
            <MultilineInput
                componentStyle={{ marginTop: 30 }}
                onlyRead={false}
                value={text}
                onChangeText={setText}
                placeholder={getString('이곳에 답글을 남겨주세요')}
                onPress={() => createReComment()}
            />
            <Button
                onPress={closeReply}
                icon={<Icon name="expand-less" />}
                buttonStyle={{ marginVertical: 10 }}
                type="clear"
            />
        </>
    );
};

const OpinionCard = (props: OpinionCardProps): JSX.Element => {
    const { nickname, description, created, activityId, postId, replyCount, likeCount, isLiked } = props;
    const { user, isGuest } = useContext(AuthContext);
    const { reportPost } = useContext(ProposalContext);
    const dispatch = useDispatch();
    const [showReply, setShowReply] = useState(false);
    const [localIsLiked, setLocalIsLiked] = useState(isLiked);
    const [localLikeCount, setLocalLikeCount] = useState(likeCount);
    const { runToggleLike } = useInteraction();

    const toggleLike = () => {
        if (isGuest) {
            dispatch(
                ActionCreators.snackBarVisibility({
                    visibility: true,
                    text: '둘러보기 중에는 사용할 수 없습니다',
                }),
            );
            return;
        }
        setLocalLikeCount(localIsLiked ? localLikeCount - 1 : localLikeCount + 1);
        setLocalIsLiked(!localIsLiked);
        handler(!localIsLiked);
    };

    const handler = useCallback(
        debounce((toValue: boolean) => {
            runToggleLike({ isLike: toValue, memberId: user?.memberId, postId });
        }, 1000),
        [],
    );

    const report = () => {
        if (isGuest) {
            dispatch(ActionCreators.snackBarVisibility({
                visibility: true,
                text: '둘러보기 중에는 사용할 수 없습니다'
            }));
            return;
        }

        Alert.alert('이 게시물을 신고하시겠습니까?',
            '신고할 경우, 이 게시물은 회원님께 숨김 처리 됩니다. 신고가 누적되면 다른 참여자들에게도 숨김처리가 될 예정입니다.',
            [{
                text: '취소',
                onPress: () => {
                    console.log('cancel pressed');
                },
                style: 'cancel',
            }, {
                text: '신고',
                onPress: () => {
                    reportPost(activityId, postId)
                        .then((succeeded) => {
                            // 여기 오기 rendering 되어서 없어질 듯
                            if (!succeeded) {
                                dispatch(ActionCreators.snackBarVisibility({
                                    visibility: true,
                                    text: '신고 처리 중 오류가 발생했습니다'
                                }));
                            }
                        })
                        .catch((err) => {
                            console.log('catch exception while reportActivity : ', err);
                            dispatch(ActionCreators.snackBarVisibility({
                                visibility: true,
                                text: '신고 처리 중 오류가 발생했습니다'
                            }));
                        });
                    },
                }]
            );
    }

    return (
        <View style={styles.contents}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 11 }}>
                <Text style={[globalStyle.gbtext, { fontSize: 10 }]}>{nickname}</Text>
                <View style={globalStyle.flexRowBetween}>
                    <Text style={{ fontSize: 10 }}>{sinceCalc(created)}</Text>
                    <View
                        style={{
                            marginLeft: 9,
                            borderLeftWidth: 1,
                            borderColor: 'rgb(220, 217, 227)',
                            width: 11,
                            height: 11,
                        }}
                    />
                    <TouchableOpacity
                        onPress={() => {
                            report();
                        }}
                    >
                        <Text style={{ fontSize: 10 }}>{getString('신고')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ paddingBottom: 18 }}>
                <Text style={{ fontSize: 13, lineHeight: 21 }}>{description}</Text>
            </View>
            <View style={{ flexDirection: 'row', paddingBottom: 35 }}>
                <CommentButton
                    commentCount={replyCount}
                    onPress={() => {
                        setShowReply(!showReply);
                    }}
                />
                <CommentLikeButton
                    buttonStyle={{ marginLeft: 6.5 }}
                    likeCount={localLikeCount}
                    onPress={() => {
                        toggleLike();
                    }}
                    isLiked={localIsLiked}
                />
            </View>
            {showReply ? (
                <Reply postId={postId} activityId={activityId} closeReply={() => setShowReply(false)} />
            ) : null}
            <Divider style={{ height: 3, backgroundColor: 'rgb(242,244,250)' }} />
        </View>
    );
};

export default OpinionCard;
