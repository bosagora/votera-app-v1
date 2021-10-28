import React, { useContext, useEffect, useState } from 'react';
import { View, TouchableOpacity, Dimensions } from 'react-native';
import styled, { ThemeContext } from 'styled-components/native';
import MultilineInput from '../input/MultiLineInput';
import { Button, Icon, Text, Image } from 'react-native-elements';
import globalStyle from '~/styles/global';
import { getImageSize, ISize } from '~/utils/image';
import DownloadComponent from '../ui/Download';
import {
    Enum_Post_Status,
    Enum_Post_Type,
    GetCommentPostsDocument,
    Post,
    UploadFile,
    useCreatePostMutation,
    useGetCommentPostsLazyQuery,
} from '~/graphql/generated/generated';
import { useDispatch } from 'react-redux';
import ActionCreators from '~/state/actions';
import moment from 'moment';
import CommentCard from '../opinion/CommentCard';
import { AuthContext } from '~/contexts/AuthContext';
import { ProposalContext } from '~/contexts/ProposalContext';
import { downloadFile } from '~/utils/file';
import getString from '~/utils/locales/STRINGS';
import ShortButton from '../button/ShortButton';

interface NoticeCardProps {
    noticeData: Post;
    noticeAId: string;
}

const RegularButton = styled.View`
    height: 26px;
    padding-horizontal: 10px;
    border-radius: 6px;
    border-width: 1px;
    border-color: rgb(222, 212, 248);
    justify-content: center;
    align-items: center;
`;

const NoticeContainer = styled.View`
    padding: 23px;
    border-bottom-width: 3px;
    border-bottom-color: 'rgb(242,244,250)';
    background-color: white;
`;

const FETCH_MORE_LIMIT = 5;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface NoticeImgsProps {
    size: ISize;
    url: string;
}

const NoticeCard = (props: NoticeCardProps) => {
    const dispatch = useDispatch();
    const themeContext = useContext(ThemeContext);
    const { user, isGuest } = useContext(AuthContext);
    const { isJoined, joinProposal, isReported } = useContext(ProposalContext);

    const { noticeData, noticeAId } = props;
    const [text, setText] = useState<string>('');
    const [expanded, setExpanded] = useState(false);

    const [replyCount, setReplyCount] = useState(noticeData.childPosts?.length);
    const [comments, setComments] = useState<Post[]>([]);
    const [noticeImgs, setNoticeImgs] = useState<NoticeImgsProps[]>([]);
    const [noticeFiles, setNoticeFiles] = useState<UploadFile[]>([]);
    const [isStopFetchMore, setStopFetchMore] = useState(false);

    const [createCommentMutation] = useCreatePostMutation();

    const [getNoticeComments, { data: noticeCommentsQuery, loading, fetchMore, refetch }] = useGetCommentPostsLazyQuery(
        {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first',
        },
    );

    useEffect(() => {
        if (noticeCommentsQuery?.listPosts) {
            setComments(noticeCommentsQuery.listPosts.filter((post) => post && !isReported(post.id)) as Post[]);
        } else {
            setComments([]);
        }
    }, [noticeCommentsQuery]);

    useEffect(() => {
        if (noticeData.attachment) {
            let imgs: NoticeImgsProps[] = [];
            let files: UploadFile[] = [];

            noticeData.attachment.forEach((c) => {
                if (!c) {
                    return;
                }

                if (c.mime.indexOf('image') !== -1 && c.url) {
                    getImageSize(c?.url).then((imageSize) => {
                        if (imageSize.width > SCREEN_WIDTH - 46) {
                            const imageRatio = (SCREEN_WIDTH - 46) / imageSize.width;
                            imgs.push({
                                url: c.url,
                                size: { width: SCREEN_WIDTH - 46, height: imageSize.height * imageRatio },
                            });
                        } else {
                            imgs.push({ url: c.url, size: { ...imageSize } });
                        }
                    });
                } else {
                    files.push(c);
                }
            });
            setNoticeFiles(files);
            setNoticeImgs(imgs);
            // getImageSize(data.logo.url).then((_logoImageSize) => {
            //     if (_logoImageSize.width > SCREEN_WIDTH - 46) {
            //         const imageRatio = (SCREEN_WIDTH - 46) / _logoImageSize.width;
            //         setLogoImageSize({ width: SCREEN_WIDTH - 46, height: _logoImageSize.height * imageRatio });
            //     } else {
            //         setLogoImageSize(_logoImageSize);
            //     }
            // });
        }
        // if (data.mainImage.url) {
        //     getImageSize(data.mainImage.url).then((_mainImageSize) => {
        //         if (_mainImageSize.width > SCREEN_WIDTH - 46) {
        //             const imageRatio = (SCREEN_WIDTH - 46) / _mainImageSize.width;
        //             setMainImageSize({ width: SCREEN_WIDTH - 46, height: _mainImageSize.height * imageRatio });
        //         } else {
        //             setMainImageSize(_mainImageSize);
        //         }
        //     });
        // }
    }, [noticeData]);

    useEffect(() => {
        if (expanded) {
            getNoticeComments({
                variables: {
                    where: {
                        type: Enum_Post_Type.CommentOnPost,
                        parentPost: noticeData.id,
                        status: Enum_Post_Status.Open,
                    },
                    sort: 'createdAt:desc',

                    limit: FETCH_MORE_LIMIT,
                },
            });
            if (noticeData.attachment?.length) {
                noticeData.attachment.map((a) => console.log('mime : ', a?.mime));
            }
            // if (props.noticeData.attachment?.) {
            //     getImageSize(props.mainImage.url).then((result) => {
            //         if (result.width > SCREEN_WIDTH - 46) {
            //             const imageRatio = (SCREEN_WIDTH - 46) / result.width;
            //             setImageSize({ width: SCREEN_WIDTH - 46, height: result.height * imageRatio });
            //         } else {
            //             setImageSize(result);
            //         }
            //     });
            // }
        }
    }, [expanded]);

    const createComment = async () => {
        try {
            if (isGuest) {
                dispatch(
                    ActionCreators.snackBarVisibility({
                        visibility: true,
                        text: getString('둘러보기 중에는 사용할 수 없습니다'),
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
                            activity: noticeAId,
                            parentPost: noticeData.id,
                            status: Enum_Post_Status.Open,
                            content: [
                                {
                                    __typename: 'ComponentPostCommentOnPost',
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
                            where: {
                                type: Enum_Post_Type.CommentOnPost,
                                parentPost: noticeData.id,
                                status: Enum_Post_Status.Open,
                            },
                            sort: 'createdAt:desc',
                        },
                    });

                    const listPosts = cacheReads ? [createPost.post, ...cacheReads?.listPosts] : [createPost.post];

                    cache.writeQuery({
                        query: GetCommentPostsDocument,
                        variables: {
                            where: {
                                type: Enum_Post_Type.CommentOnPost,
                                parentPost: noticeData.id,
                                status: Enum_Post_Status.Open,
                            },
                            sort: 'createdAt:desc',
                        },
                        data: { listPosts },
                    });
                    setReplyCount((replyCount || 0) + 1);
                },
            });
            /*
            if (!isJoined) {
                const pushData = await push.getCurrentPushLocalStorage();
                await createFollow(
                    feedAddress,
                    [createdComment.data?.createPost?.post?.activity?.proposal?.id!],
                    pushData?.id,
                    pushData?.enablePush,
                ).catch(console.log);
            }
            */
            dispatch(
                ActionCreators.snackBarVisibility({ visibility: true, text: getString('글이 등록 되었습니다&#46;') }),
            );
            setText('');
        } catch (err) {
            console.log(err);
        } finally {
            // dispatch(ActionCreators.loadingAniModal({ visibility: false }));
        }
    };

    const renderFetchMoreButton = () => {
        if (isStopFetchMore || !replyCount || replyCount < 5) return null;
        return (
            <Button
                title={getString('더보기')}
                onPress={() => {
                    if (fetchMore) {
                        const currentLength = comments?.length || 0;
                        fetchMore({
                            variables: { limit: FETCH_MORE_LIMIT, start: currentLength },
                        })
                            .then((fetchMoreResult) => {
                                const length = fetchMoreResult.data.listPosts?.length || 0;
                                if (length < 1) setStopFetchMore(true);
                            })
                            .catch(console.log);
                    }
                }}
                buttonStyle={{ marginVertical: 10 }}
            />
        );
    };

    return (
        <NoticeContainer>
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[globalStyle.mtext, { flex: 1, fontSize: 16 }]}>{noticeData.content[0].title}</Text>
                    <RegularButton>
                        <Text style={[globalStyle.btext, { fontSize: 12, color: themeContext.color.primary }]}>
                            {getString('답글 N').replace('N', replyCount?.toString() || '0')}
                        </Text>
                    </RegularButton>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18 }}>
                    <Text style={[globalStyle.gmtext, { fontSize: 11, color: 'black', lineHeight: 15 }]}>
                        {noticeData.writer?.username || 'username'}
                    </Text>
                    <Text style={[globalStyle.rltext, { fontSize: 12, marginLeft: 12 }]}>
                        {moment(noticeData.createdAt).format('YYYY.MM.DD')}
                    </Text>
                    {/** TODO */}
                    {/* <View style={{ height: 9, width: 1, backgroundColor: 'rgb(220,217,227)', marginHorizontal: 10 }} /> */}
                    {/* <RLText style={{ fontSize: 12 }}>조회수</RLText> */}
                </View>
            </TouchableOpacity>
            {expanded && (
                <View style={{ paddingVertical: 30 }}>
                    <Text style={[globalStyle.ltext, { color: 'black' }]}>{noticeData.content[0].text}</Text>
                    <View>
                        {noticeImgs.map((noticeImg) => (
                            <Image style={{ ...noticeImg.size }} source={{ uri: noticeImg.url }} />
                        ))}
                    </View>
                    <View style={{ marginTop: 20 }}>
                        {noticeFiles.map((file: UploadFile, index) => {
                            return (
                                <DownloadComponent
                                    key={'file_' + index}
                                    label={file?.name || 'filename'}
                                    onPress={() =>
                                        downloadFile(file?.url, file?.name).then(() => {
                                            dispatch(
                                                ActionCreators.snackBarVisibility({
                                                    visibility: true,
                                                    text: getString('다운로드가 완료 되었습니다'),
                                                }),
                                            );
                                        })
                                    }
                                />
                            );
                        })}
                    </View>
                    <View style={{ marginVertical: 28 }}>
                        <View style={globalStyle.flexRowBetween}>
                            <Text>
                                {getString('N개 답글').replace('N', replyCount?.toString() || '0')}
                            </Text>
                            <ShortButton
                                title={getString('새로고침')}
                                titleStyle={{ fontSize: 10 }}
                                buttonStyle={{
                                    backgroundColor: 'transparent',
                                    width: 61,
                                    height: 26,
                                    padding: 0,
                                    borderRadius: 6,
                                    marginRight: 5,
                                }}
                                onPress={() => {
                                    if (refetch) refetch();
                                }}
                            />
                        </View>
                        {comments
                            ?.filter((comment) => comment && !isReported(comment.id))
                            .map((recomment: Post) => {
                                const status = isReported(recomment.id)
                                    ? 'REPORTED'
                                    : recomment.status || Enum_Post_Status.Open;
                                return (
                                    <CommentCard
                                        key={'noticeComment_' + recomment.id}
                                        activityId={recomment.activity?.id || ''}
                                        postId={recomment.id}
                                        created={recomment.createdAt}
                                        description={recomment.content?.find((e) => true)?.text || ''}
                                        nickname={recomment.writer?.username || 'username'}
                                        status={status}
                                    />
                                );
                            })}
                    </View>
                    {renderFetchMoreButton()}

                    <MultilineInput
                        onlyRead={false}
                        value={text}
                        onChangeText={setText}
                        placeholder={getString('이곳에 자유롭게 글을 남겨주세요')}
                        onPress={() => createComment()}
                    />

                    <Button
                        onPress={() => setExpanded(false)}
                        icon={<Icon name="expand-less" />}
                        buttonStyle={{ marginTop: 30 }}
                        type="clear"
                    />
                </View>
            )}
        </NoticeContainer>
    );
};

export default NoticeCard;
