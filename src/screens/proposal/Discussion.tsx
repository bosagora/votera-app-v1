import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useDispatch } from 'react-redux';
import FilterButton from '~/components/button/FilterButton';
import { OpinionFilterType } from '~/types/filterType';
import { Text } from 'react-native-elements';
import MultilineInput from '~/components/input/MultiLineInput';
import OpinionCard from '~/components/opinion/OpinionCard';
import {
    Enum_Post_Status,
    Enum_Post_Type,
    GetCommentPostsDocument,
    Post,
    useCreateInteractionMutation,
    useCreatePostMutation,
    useGetCommentPostsQuery,
} from '~/graphql/generated/generated';
import ActionCreators from '~/state/actions';
import globalStyle from '~/styles/global';
import ShortButton from '~/components/button/ShortButton';
import { useCreateFollow } from '~/graphql/hooks/Follow';
import { AuthContext } from '~/contexts/AuthContext';
import { ProposalContext } from '~/contexts/ProposalContext';
import push from '~/services/FcmService';
import { ThemeContext } from 'styled-components/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import getString from '~/utils/locales/STRINGS';
import _ from 'lodash';

const FETCH_MORE_LIMIT = 5;
interface DiscussionProps {
    id: string;
    onLayout: (h: number) => void;
    moveToNotice: () => void;
}

const Discussion = (props: DiscussionProps) => {
    const { id, moveToNotice, onLayout } = props;
    const { user, feedAddress, isGuest } = useContext(AuthContext);
    const themeContext = useContext(ThemeContext);
    const { isJoined, joinProposal, isReported } = useContext(ProposalContext);
    const dispatch = useDispatch();

    const [text, setText] = useState('');
    const [commentsData, setCommentsData] = useState<Post[]>();
    // TODO: filter 버튼을 통해 변경할 경우 , filter state 가 변경됩니다.
    const [filter, setFilter] = useState<OpinionFilterType>(OpinionFilterType.LATEST);

    const [createCommentMutation] = useCreatePostMutation();
    const [createLikeMutation] = useCreateInteractionMutation();
    const createFollow = useCreateFollow();

    const { data: commentsQueryData } = useGetCommentPostsQuery({
        variables: {
            where: { activity: id, type: Enum_Post_Type.CommentOnActivity, status: Enum_Post_Status.Open },
            sort: 'createdAt:desc',
            limit: FETCH_MORE_LIMIT,
        },
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
    });

    useEffect(() => {
        if (commentsQueryData?.listPosts) {
            if (filter === OpinionFilterType.LATEST) {
                const sorted = _.sortBy(commentsQueryData.listPosts, ['createdAt']).reverse();
                // const sorted = commentsQueryData.posts.sort((a, b) => b?.createdAt - a?.createdAt);
                setCommentsData(sorted as Post[]);
            } else {
                const sorted = _.sortBy(commentsQueryData.listPosts, [
                    function (o) {
                        return o?.interactions?.length;
                    },
                ]).reverse();
                setCommentsData(sorted as Post[]);
            }
        }
    }, [commentsQueryData, filter]);

    const createComment = async () => {
        try {
            if (isGuest) {
                dispatch(
                    ActionCreators.snackBarVisibility({
                        visibility: true,
                        text: '둘러보기 중에는 사용할 수 없습니다',
                    }),
                );
                return;
            }
            // dispatch(ActionCreators.loadingAniModal({ visibility: true }));
            if (!isJoined) await joinProposal();

            if (!text) return;

            const createdComment = await createCommentMutation({
                variables: {
                    input: {
                        data: {
                            type: Enum_Post_Type.CommentOnActivity,
                            activity: id,
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
                            where: { activity: id, type: Enum_Post_Type.CommentOnActivity, status: Enum_Post_Status.Open },
                            sort: 'createdAt:desc',
                            limit: FETCH_MORE_LIMIT,
                        },
                    });

                    const listPosts = [createPost.post, ...cacheReads?.listPosts];

                    cache.writeQuery({
                        query: GetCommentPostsDocument,
                        variables: {
                            where: { activity: id, type: Enum_Post_Type.CommentOnActivity, status: Enum_Post_Status.Open },
                            sort: 'createdAt:desc',
                            limit: FETCH_MORE_LIMIT,
                        },
                        data: { listPosts },
                    });
                },
            });
            // console.log('createdComment >>> ', createdComment);
            if (!isJoined && feedAddress) {
                const pushData = await push.useGetCurrentPushLocalStorage();
                await createFollow(
                    feedAddress,
                    [createdComment.data?.createPost?.post?.activity?.proposal?.id!],
                    pushData?.id,
                    pushData?.enablePush,
                ).catch(console.log);
            }
            dispatch(ActionCreators.snackBarVisibility({ visibility: true, text: '글이 등록 되었습니다.' }));
            setText('');
            // if (commentRefetch) commentRefetch();
        } catch (err) {
            console.log(err);
        } finally {
            // dispatch(ActionCreators.loadingAniModal({ visibility: false }));
        }
    };

    function renderFilterView() {
        return (
            <View style={{ alignItems: 'flex-start', paddingTop: 12 }}>
                <FilterButton filterType={OpinionFilterType} currentFilter={filter} setFilter={setFilter} />
            </View>
        );
    }

    return (
        <KeyboardAwareScrollView style={{ flex: 1 }} scrollEnabled={false}>
            <View onLayout={(event) => onLayout(event.nativeEvent.layout.height)}>
                <View style={[globalStyle.flexRowBetween, { marginBottom: 20 }]}>
                    <Text style={[globalStyle.gbtext, { lineHeight: 20, fontSize: 12 }]}>{user?.nodename}</Text>
                    <ShortButton
                        title={getString('공지보기')}
                        titleStyle={{ fontSize: 10 }}
                        buttonStyle={{
                            backgroundColor: 'transparent',
                            width: 61,
                            height: 26,
                            padding: 0,
                            borderRadius: 6,
                        }}
                        onPress={moveToNotice}
                    />
                </View>
                <MultilineInput
                    onlyRead={false}
                    value={text}
                    onChangeText={setText}
                    placeholder={getString('이곳에 자유롭게 글을 남겨주세요')}
                    placeholderTextColor={themeContext.color.disabled}
                    onPress={() => createComment()}
                />
                {renderFilterView()}
                {commentsData?.filter((comment) => !isReported(comment.id)).map((comment) => {
                    const isLiked = comment.interactions?.find((it) => it?.actor?.id === user?.memberId);
                    return (
                        <OpinionCard
                            key={'comment_' + comment.id}
                            activityId={id}
                            postId={comment.id}
                            created={comment.createdAt}
                            description={comment.content?.find(e => true)?.text || ''}
                            nickname={comment.writer?.username || 'nickname'}
                            replyCount={comment.childPosts?.length || 0}
                            likeCount={comment.interactions?.length || 0}
                            isLiked={!!isLiked}
                        />
                    );
                })}
            </View>
        </KeyboardAwareScrollView>
    );
};

export default Discussion;
