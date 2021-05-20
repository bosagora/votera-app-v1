import React, { useState, useEffect, useContext } from 'react';
import { View, ImageBackground, TouchableOpacity, Image, Dimensions } from 'react-native';
// import { ImagePicker, DocumentPicker, TextInput } from '~/components/InputBox';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ImagePicker from '~/components/input/ImagePicker';
import { ImagePickerResult } from 'expo-image-picker';
import DocumentPicker from '~/components/input/DocumentPicker';
import { DocumentResult } from 'expo-document-picker';
import ActionCreators from '~/state/actions';
import { useDispatch } from 'react-redux';
import { Button, Input, Text } from 'react-native-elements';
import globalStyle from '~/styles/global';
import ShortButton from '~/components/button/ShortButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TextInputComponent from '~/components/input/SingleLineInput';
import { ThemeContext } from 'styled-components/native';
import { loadUriAsFile } from '~/graphql/client';
import {
    Enum_Post_Status,
    Enum_Post_Type,
    GetCommentPostsDocument,
    useCreatePostMutation,
    useUploadFileMutation,
} from '~/graphql/generated/generated';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import { MainNavProps } from '~/navigation/types/MainStackParams';
import { AuthContext } from '~/contexts/AuthContext';

const TITLE_MAX_LENGTH = 100;
// const HEADER_BG_WIDTH = Dimensions.get('window').width;

const RowWrapper = (props: any) => {
    return (
        <View style={{ marginTop: 10 }}>
            <View style={globalStyle.flexRowBetween}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[globalStyle.mtext, { fontSize: 13, marginVertical: 15, color: 'black' }]}>
                        {props.label}
                    </Text>
                    {props.mandatory && (
                        <View style={{ width: 3, height: 3, backgroundColor: 'rgb(240,109,63)', marginLeft: 11 }} />
                    )}
                </View>
                <Text style={[globalStyle.ltext, { fontSize: 12 }]}>{props.subTitle}</Text>
            </View>
            {props.children}
        </View>
    );
};

const CreateNoticeScreen = ({ navigation, route }: MainNavProps<'CreateNotice'>) => {
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const themeContext = useContext(ThemeContext);
    const { user } = useContext(AuthContext);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [mainImage, setMainImage] = useState<ImagePickerResult>();
    const [uploadFiles, setUploadFiles] = useState<DocumentResult[]>([]);

    const [uploadAttachment] = useUploadFileMutation();
    const [createNotice] = useCreatePostMutation();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: '공지사항 작성',
            headerTitleStyle: { ...globalStyle.headerTitle, color: 'white' },
            headerLeft: () => (
                <Button
                    onPress={() => navigation.goBack()}
                    icon={<Image source={require('@assets/icons/header/arrowWhiteBack.png')} />}
                    type="clear"
                />
            ),
            headerRight: () => (
                <ShortButton
                    title="등록"
                    titleStyle={[globalStyle.btext, { fontSize: 14, color: 'white' }]}
                    buttonStyle={{
                        backgroundColor: 'transparent',
                        width: 63,
                        height: 32,
                        padding: 0,
                        borderRadius: 47,
                        borderColor: 'white',
                    }}
                    onPress={() => runCreateNotice()}
                />
            ),
            headerBackground: () => (
                <Image
                    style={{ height: 55 + insets.top, width: '100%' }}
                    source={require('@assets/images/header/bg.png')}
                />
            ),
        });
    }, [navigation, title, description, mainImage, uploadFiles, route.params]);

    // useEffect(() => {
    //     if(data && data.createNotice) {
    //         dispatch(ActionCreators.loadingAniModal({ visibility: false }));
    //         navigation.pop();
    //     }
    // }, [data]);

    const runCreateNotice = async () => {
        try {
            let uploadedMainImageUrl: any[] | undefined = undefined;
            let uploadedFileUrl: any[] | undefined = undefined;
            let uploadedAttachmentUrls: (string | undefined)[] = [];
            if (!title || !description) return;

            dispatch(ActionCreators.loadingAniModal({ visibility: true }));

            if (mainImage && !mainImage.cancelled) {
                const result = await loadUriAsFile(mainImage?.uri);

                const uploaded = await uploadAttachment({ variables: { file: result } });
                uploadedAttachmentUrls.push(uploaded.data?.upload.id);
            }
            if (uploadFiles) {
                const uploadFilePromises = uploadFiles
                    .filter((file) => file.type !== 'cancel' && file?.uri)
                    .map(async (uploadFile) => {
                        if (uploadFile.type === 'cancel' || !uploadFile?.uri) {
                            return undefined;
                        }

                        const result = await loadUriAsFile(uploadFile.uri, uploadFile.name);
                        const uploaded = await uploadAttachment({ variables: { file: result } });
                        return uploaded.data?.upload.id;
                    });
                uploadedFileUrl = await Promise.all(uploadFilePromises);
                uploadedAttachmentUrls.push(...uploadedFileUrl);
            }
            await createNotice({
                variables: {
                    input: {
                        data: {
                            type: Enum_Post_Type.BoardArticle,
                            activity: route.params.id,
                            attachment: uploadedAttachmentUrls as string[],
                            status: Enum_Post_Status.Open,
                            content: [
                                {
                                    __typename: 'ComponentPostArticle',
                                    title,
                                    text: description,
                                },
                            ],
                            writer: user?.memberId,
                        },
                    },
                },
                update(cache, { data: { createPost } }) {
                    const cacheReads =
                        cache.readQuery({
                            query: GetCommentPostsDocument,
                            variables: {
                                where: {
                                    activity: route.params.id,
                                    type: Enum_Post_Type.BoardArticle,
                                    status: Enum_Post_Status.Open,
                                },
                                sort: 'createdAt:desc',
                            },
                        }) || [];

                    const listPosts = cacheReads?.listPosts
                        ? [createPost.post, ...cacheReads?.listPosts]
                        : [createPost.post];

                    cache.writeQuery({
                        query: GetCommentPostsDocument,
                        variables: {
                            where: {
                                activity: route.params.id,
                                type: Enum_Post_Type.BoardArticle,
                                status: Enum_Post_Status.Open,
                            },
                            sort: 'createdAt:desc',
                        },
                        data: { listPosts },
                    });
                },
            });
            dispatch(ActionCreators.loadingAniModal({ visibility: false }));
            navigation.pop();
        } catch (e) {
            console.log('CreateNotice error : ', e);
            dispatch(ActionCreators.loadingAniModal({ visibility: false }));
        }
    };

    return (
        <>
            <FocusAwareStatusBar barStyle="light-content" />
            <KeyboardAwareScrollView style={{ flex: 1 }} enableResetScrollToCoords={false}>
                <View
                    style={{
                        backgroundColor: 'white',
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                        paddingHorizontal: 23,
                        paddingBottom: 100,
                    }}
                >
                    <RowWrapper label="공지사항 제목" mandatory={true}>
                        <TextInputComponent
                            onChangeText={(text: string) => setTitle(text)}
                            value={title}
                            koreanInput
                            placeholder="공지사항 제목을 입력해주세요."
                            maxLength={TITLE_MAX_LENGTH}
                        />
                        {/* <TextInput placeholder='' onChangeText={(text: string) => setTitle(text)} /> */}
                    </RowWrapper>

                    <RowWrapper label="공지사항 내용" mandatory={true}>
                        <Input
                            value={description}
                            textAlignVertical="top"
                            placeholder="공지사항 내용을 입력해주세요."
                            multiline={true}
                            style={{ textAlignVertical: 'top', height: 255, paddingTop: 15, lineHeight: 23 }}
                            inputContainerStyle={{ borderBottomWidth: 0 }}
                            inputStyle={{
                                color: themeContext.color.textBlack,
                                fontSize: 14,
                                fontFamily: 'NotoSansCJKkrRegular',
                            }}
                            containerStyle={{
                                borderWidth: 2,
                                borderColor: 'rgb(235,234,239)',
                                backgroundColor: 'rgb(252,251,255)',
                                borderRadius: 5,
                            }}
                            onChangeText={(text: string) => setDescription(text)}
                            renderErrorMessage={false}
                            allowFontScaling={false}
                            autoCorrect={false}
                        />
                        {/* <TextInput textAlignVertical='top' placeholder='공지사항 내용을 입력해주세요' multiline={true} style={{ textAlignVertical: 'top', height: 255, paddingTop: 15, lineHeight: 23 }} onChangeText={(text: string) => setDescription(text)} /> */}
                    </RowWrapper>

                    <RowWrapper label="대표 이미지" subTitle="png와 jpg파일 1M이하로 등록">
                        <ImagePicker
                            onChangeImage={(image) => setMainImage(image)}
                            value={mainImage}
                            placeholder={'대표 이미지를 등록해주세요'}
                        />
                    </RowWrapper>

                    <RowWrapper label="자료 업로드" subTitle="png, jpg, pdf 파일 10M이하로 5개까지 등록">
                        <DocumentPicker
                            onChangeFiles={(files) => setUploadFiles(files)}
                            value={uploadFiles}
                            placeholder={'자료를 등록해주세요'}
                        />
                    </RowWrapper>
                </View>
            </KeyboardAwareScrollView>
        </>
    );
};

export default CreateNoticeScreen;
