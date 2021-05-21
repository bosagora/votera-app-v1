import React, { useState, useEffect, useContext } from 'react';
import { View, Image, Platform } from 'react-native';
import { useIsFocused } from '@react-navigation/core';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ThemeContext } from 'styled-components/native';
import { useDispatch } from 'react-redux';
import { Button, Text, Input } from 'react-native-elements';
import { ImagePickerResult } from 'expo-image-picker';
import { DocumentResult } from 'expo-document-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import moment from 'moment';
import globalStyle from '~/styles/global';
import ActionCreators from '~/state/actions';
import RadioButton from '~/components/button/radio';
import TextInputComponent from '~/components/input/SingleLineInput';
import DatePicker, { Day } from '~/components/input/DatePicker';
import ImagePicker from '~/components/input/ImagePicker';
import DocumentPicker from '~/components/input/DocumentPicker';
import ShortButton from '~/components/button/ShortButton';
import { CreateNavProps } from '~/navigation/types/CreateStackParams';
import {
    Enum_Proposal_Status,
    Enum_Proposal_Type,
    GetProposalsDocument,
    GetProposalsQuery,
    ProposalInput,
    useGetProposalsQuery,
    useCreateProposalMutation,
    useUploadFileMutation,
} from '~/graphql/generated/generated';
import { loadUriAsFile } from '~/graphql/client';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import { useCreateFollow } from '~/graphql/hooks/Follow';
import LocalStorage, { LocalStorageProposalProps } from '~/utils/LocalStorage';
import { AuthContext } from '~/contexts/AuthContext';
import { ProposalContext } from '~/contexts/ProposalContext';
import { OpenWhere, ProjectWhere } from '~/graphql/hooks/Proposals';
import push from '~/services/FcmService';
import { ValidatorLogin, getAmountAsBoaString } from '~/utils/voterautil';
import { getProposalFeeRatio } from '~/utils/agoraconf';
import getString from '~/utils/locales/STRINGS';

interface RowProps {
    label: string;
    subTitle?: string;
    mandatory?: boolean;
}

const TITLE_MAX_LENGTH = 100;
// const HEADER_BG_WIDTH = Dimensions.get('window').width;

function convertStringToDay(startDate?: string, endDate?: string): Day {
    const day: Day = {};
    if (startDate) {
        const dtStart = new Date(startDate);
        day.startDate = {
            dateString: startDate,
            day: dtStart.getDate(),
            month: dtStart.getMonth() + 1,
            year: dtStart.getFullYear(),
            timestamp: dtStart.getTime(),
        };
    }
    if (endDate) {
        const edStart = new Date(endDate);
        day.endDate = {
            dateString: endDate,
            day: edStart.getDate(),
            month: edStart.getMonth() + 1,
            year: edStart.getFullYear(),
            timestamp: edStart.getTime(),
        };
    }
    return day;
}

const RowWrapper: React.FC<RowProps> = (props) => {
    const themeContext = useContext(ThemeContext);
    return (
        <View style={{ marginTop: 10 }}>
            <View style={globalStyle.flexRowBetween}>
                <View style={globalStyle.flexRowAlignCenter}>
                    <Text
                        style={[
                            globalStyle.mtext,
                            { fontSize: 11, marginVertical: Platform.OS === 'android' ? 0 : 15, color: 'black' },
                        ]}
                    >
                        {props.label}
                    </Text>
                    {props.mandatory && (
                        <View
                            style={{
                                width: 3,
                                height: 3,
                                backgroundColor: themeContext.color.disagree,
                                marginLeft: 11,
                            }}
                        />
                    )}
                </View>
                <Text style={[globalStyle.ltext, { fontSize: 10 }]}>{props.subTitle}</Text>
            </View>
            {props.children}
        </View>
    );
};

const CreateProposal = ({ route, navigation }: CreateNavProps<'CreateProposal'>) => {
    const dispatch = useDispatch();
    const { user, isGuest, getVoterCard, isValidVoterCard, feedAddress } = useContext(AuthContext);
    const { fetchProposal } = useContext(ProposalContext);
    const themeContext = useContext(ThemeContext);
    const insets = useSafeAreaInsets();
    const createFollow = useCreateFollow();
    const isFocused = useIsFocused();
    const [validatorLogin, setValidatorLogin] = useState<ValidatorLogin | null>();

    const [proposalType, setProposalType] = useState<Enum_Proposal_Type>(Enum_Proposal_Type.Business);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState<Day>({});
    const [logoImage, setLogoImage] = useState<ImagePickerResult>();
    const [mainImage, setMainImage] = useState<ImagePickerResult>();
    const [uploadFiles, setUploadFiles] = useState<DocumentResult[]>([]);
    const [boa, setBoa] = useState<number>();
    const [loadFromSaveData, setLoadFromSaveData] = useState(false);
    const [createError, setCreateError] = useState<{ errorName: string } | undefined>();
    const [createProposal] = useCreateProposalMutation();
    const [uploadAttachment] = useUploadFileMutation();

    const resetData = () => {
        setTitle('');
        setDescription('');
        setProposalType(Enum_Proposal_Type.Business);
        setDate({});
        setLogoImage(undefined);
        setMainImage(undefined);
        setUploadFiles([]);
        setBoa(0);
        setLoadFromSaveData(false);
    };

    const runCreateProposal = async () => {
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

            let uploadedLogoImageUrl;
            let uploadedAttachmentUrls: (string | undefined)[] = [];
            let uploadedFileUrl: (string | undefined)[] = [];

            if (!title) setCreateError({ errorName: 'title' });
            else if (!date.startDate?.timestamp || !date.endDate?.timestamp) setCreateError({ errorName: 'date' });
            else if (!description) setCreateError({ errorName: 'description' });

            if (!validatorLogin) setCreateError({ errorName: 'creator' });

            if (!title || !date.startDate?.timestamp || !date.endDate?.timestamp || !description) {
                dispatch(
                    ActionCreators.snackBarVisibility({
                        visibility: true,
                        text: '필수 항목을 입력해주세요',
                    }),
                );
                return;
            } else if (!validatorLogin) {
                dispatch(
                    ActionCreators.snackBarVisibility({
                        visibility: true,
                        text: '제안자의 노드 정보가 올바르지 않습니다',
                    }),
                );
                return;
            }

            // check valid range of boa
            if (proposalType === Enum_Proposal_Type.Business && (!boa || boa < 0 || boa > Number.MAX_SAFE_INTEGER)) {
                setCreateError({ errorName: 'fundingAmount'});
                dispatch(
                    ActionCreators.snackBarVisibility({
                        visibility: true,
                        text: '요청금액 정보가 올바르지 않습니다',
                    }),
                );
                return;
            }

            dispatch(ActionCreators.loadingAniModal({ visibility: true }));

            if (logoImage && !logoImage.cancelled) {
                const result = await loadUriAsFile(logoImage?.uri);
                const uploaded = await uploadAttachment({ variables: { file: result } });
                uploadedLogoImageUrl = uploaded.data?.upload.id;
            }

            if (mainImage && !mainImage.cancelled) {
                const result = await loadUriAsFile(mainImage?.uri);

                const uploaded = await uploadAttachment({ variables: { file: result } });
                uploadedAttachmentUrls.push(uploaded.data?.upload.id);
            }

            if (uploadFiles) {
                const uploadFilePromises = uploadFiles
                    .filter((file) => file && file.type === 'success' && file.uri)
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

            const today = new Date();
            const proposalData: ProposalInput = {
                name: title,
                description,
                type: proposalType,
                logo: uploadedLogoImageUrl,
                attachment: uploadedAttachmentUrls as string[],
                fundingAmount: getAmountAsBoaString(boa),
                proposer_address: validatorLogin.validator,
                creator: user?.memberId,
                status:
                    proposalType === Enum_Proposal_Type.Business
                        ? Enum_Proposal_Status.PendingAssess
                        : Enum_Proposal_Status.PendingVote,
                votePeriod: {
                    begin:
                        date.startDate?.timestamp && moment(new Date(date.startDate?.timestamp)).format('YYYY-MM-DD'),
                    end: date.endDate?.timestamp && moment(new Date(date.endDate?.timestamp)).format('YYYY-MM-DD'),
                },
            };
            if (proposalType === Enum_Proposal_Type.Business) {
                proposalData.assessPeriod = {
                    begin: moment(new Date()).format('YYYY-MM-DD'),
                    end: moment(new Date(today.setDate(today.getDate() + 6))).format('YYYY-MM-DD'),
                };
            }
            const proposalResponse = await createProposal({
                variables: {
                    input: {
                        data: proposalData,
                    },
                },
                update(cache, { data }) {
                    const createProposal = data?.createProposal;
                    if (createProposal) {
                        const cacheReads = cache.readQuery<GetProposalsQuery>({
                            query: GetProposalsDocument,
                            variables: {
                                where: proposalType === Enum_Proposal_Type.Business ? OpenWhere : ProjectWhere,
                                sort: 'createdAt:desc',
                            },
                        });

                        const proposals =
                            cacheReads && cacheReads.proposals
                                ? [createProposal.proposal, ...cacheReads.proposals]
                                : [createProposal.proposal];

                        cache.writeQuery({
                            query: GetProposalsDocument,
                            variables: {
                                where: proposalType === Enum_Proposal_Type.Business ? OpenWhere : ProjectWhere,
                                sort: 'createdAt:desc',
                            },
                            data: { proposals },
                        });
                    }
                },
            });
            if (proposalResponse.data?.createProposal?.proposal?.id && feedAddress) {
                const pushData = await push.useGetCurrentPushLocalStorage();
                await createFollow(
                    feedAddress,
                    [proposalResponse.data?.createProposal?.proposal?.id],
                    pushData?.id,
                    pushData?.enablePush,
                ).catch(console.log);
            }

            dispatch(ActionCreators.loadingAniModal({ visibility: false }));

            if (loadFromSaveData && route.params.saveData?.id) {
                await LocalStorage.deleteTemporaryProposal(route.params.saveData.id);
            }
            resetData();
            if (!proposalResponse.data?.createProposal?.proposal?.proposalId) {
                navigation.goBack();
                return;
            } else {
                const id = proposalResponse.data?.createProposal?.proposal?.proposalId;
                fetchProposal(id);

                if (proposalType === Enum_Proposal_Type.Business) {
                    navigation.navigate('ProposalPayment', { id });
                } else {
                    navigation.navigate('Main', { screen: 'ProposalDetail', params: { id } });
                }
            }
        } catch (err) {
            console.log('CreateProposal error : ', err);
            dispatch(ActionCreators.loadingAniModal({ visibility: false }));
        }
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: getString('제안 작성'),
            headerTitleStyle: { ...globalStyle.headerTitle, color: 'white' },
            headerLeft: () => (
                <Button
                    onPress={() => {
                        resetData();
                        navigation.goBack();
                    }}
                    icon={<Image source={require('@assets/icons/header/arrowWhiteBack.png')} />}
                    type="clear"
                />
            ),
            headerRight: () => (
                <ShortButton
                    title={proposalType === Enum_Proposal_Type.System ? getString('등록') : getString('다음')}
                    titleStyle={{ fontSize: 14, color: 'white' }}
                    buttonStyle={{
                        backgroundColor: 'transparent',
                        width: 63,
                        height: 32,
                        padding: 0,
                        borderRadius: 47,
                        borderColor: 'white',
                    }}
                    onPress={() => runCreateProposal()}
                />
            ),
            headerBackground: () => (
                <>
                    <Image
                        style={{ height: 65 + insets.top, width: '100%' }}
                        source={require('@assets/images/header/bg.png')}
                    />
                    <View
                        style={{
                            backgroundColor: 'white',
                            height: 10,
                            borderTopLeftRadius: 10,
                            borderTopRightRadius: 10,
                            top: -10,
                        }}
                    ></View>
                </>
            ),
        });
    }, [navigation, title, description, date, logoImage, mainImage, uploadFiles, proposalType]);

    useEffect(() => {
        resetData();
    }, []);

    useEffect(() => {
        if (isFocused) {
            if (route.params && route.params.saveData && !loadFromSaveData) {
                const { saveData } = route.params;
                setTitle(saveData.name || '');
                setDescription(saveData.description || '');
                setProposalType(saveData.type as Enum_Proposal_Type);
                if (saveData.fundingFee) setBoa(saveData.fundingFee);
                if (saveData.startDate || saveData.endDate) {
                    setDate(convertStringToDay(saveData.startDate, saveData.endDate));
                }
                setLoadFromSaveData(true);
            }

            if (!isGuest) {
                if (!user?.memberId) {
                    dispatch(
                        ActionCreators.snackBarVisibility({
                            visibility: true,
                            text: '사용자 정보를 읽어올 수 없습니다',
                        }),
                    );
                    navigation.goBack();
                    return;
                }

                try {
                    if (!isValidVoterCard(user.memberId)) {
                        dispatch(
                            ActionCreators.snackBarVisibility({
                                visibility: true,
                                text: '노드 정보가 유효하지 않습니다',
                            }),
                        );
                        navigation.navigate('UpdateNode');
                        return;
                    }

                    setValidatorLogin(getVoterCard(user.memberId));
                } catch (err) {
                    console.log('fail to verify voterCard. err = ', err);
                }
            }
        }
    }, [isFocused]);

    const saveAsTemp = async () => {
        try {
            const newTempProposalData: LocalStorageProposalProps = {
                name: title,
                description,
                type: proposalType.toString(),
                fundingFee: boa,
                startDate: date?.startDate?.dateString,
                endDate: date?.endDate?.dateString,
                status: 'TEMP',
                timestamp: new Date().getTime(),
            };
            if (loadFromSaveData && route.params.saveData?.id) {
                newTempProposalData.id = route.params.saveData.id;
            }

            await LocalStorage.addTemporaryProposal(newTempProposalData);
            dispatch(ActionCreators.snackBarVisibility({ visibility: true, text: '임시저장 되었습니다.' }));
        } catch (e) {
            console.log('Temp proposal save error : ', e);
            dispatch(ActionCreators.snackBarVisibility({ visibility: true, text: '임시 저장시 오류 발생' }));
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
                        top: -5,
                        paddingVertical: 29,
                        paddingHorizontal: 23,
                    }}
                >
                    <Text style={[globalStyle.ltext, { fontSize: 15, lineHeight: 23 }]}>
                        {getString(
                            `작성 완료된 제안은 수정이 불가능하므로\n아래의 제안 작성시 내용을 정확하게 등록해주세요&#46;`,
                        )}
                    </Text>
                    <RowWrapper label={getString('제안 유형')} mandatory={true}>
                        <RadioButton
                            data={[{ label: getString('사업제안') }, { label: getString('시스템제안') }]}
                            selectedIndex={proposalType === Enum_Proposal_Type.Business ? 0 : 1}
                            onChange={(index: number) => {
                                const changedType =
                                    index === 0 ? Enum_Proposal_Type.Business : Enum_Proposal_Type.System;
                                if (changedType !== proposalType) {
                                    setDate({});
                                }
                                setProposalType(changedType);
                            }}
                            buttonDirection={'row'}
                        />
                    </RowWrapper>

                    <RowWrapper
                        label={getString('제안 제목')}
                        mandatory={true}
                        subTitle={`${title.length}/${TITLE_MAX_LENGTH}`}
                    >
                        <TextInputComponent
                            onChangeText={(text: string) => setTitle(text)}
                            value={title}
                            // koreanInput
                            placeholder={getString('제안 제목을 입력해주세요&#46;')}
                            maxLength={TITLE_MAX_LENGTH}
                        />
                    </RowWrapper>
                    <RowWrapper label={getString('투표 기간')} mandatory={true}>
                        <DatePicker
                            onChange={(date) => setDate(date)}
                            value={date}
                            title={getString('투표기간 선택')}
                            isAssess={proposalType === Enum_Proposal_Type.Business}
                        />
                    </RowWrapper>
                    {proposalType === Enum_Proposal_Type.Business && (
                        <RowWrapper label={getString('요청 금액')} mandatory={true}>
                            <TextInputComponent
                                onChangeText={(text: string) => setBoa(text ? parseInt(text.replace(/,/gi, '')) : 0)}
                                value={boa ? boa.toLocaleString() : ''}
                                placeholder={getString('요청할 BOA 수량을 입력해주세요&#46;')}
                                maxLength={TITLE_MAX_LENGTH}
                                subComponent={<Text>BOA</Text>}
                                keyboardType="number-pad"
                            />
                            <View style={{ alignSelf: 'flex-end', marginTop: 10 }}>
                                <Text style={{ fontFamily: 'RobotoRegular' }}>
                                    {getString('수수료')}{' '}
                                    <Text style={{ color: themeContext.color.primary }}>
                                        {((boa ? boa : 0) * getProposalFeeRatio()).toLocaleString()}
                                    </Text>{' '}
                                    BOA
                                </Text>
                            </View>
                        </RowWrapper>
                    )}
                    <RowWrapper label={getString('사업목표 및 설명')} mandatory={true}>
                        {/* <MultilineInput onlyRead={false} /> */}
                        <Input
                            value={description}
                            textAlignVertical="top"
                            placeholder={getString('사업목표 및 관련 내용을 입력해주세요')}
                            placeholderTextColor={themeContext.color.placeholder}
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
                    </RowWrapper>

                    <RowWrapper label={getString('로고 이미지')} subTitle={getString('이미지 파일 10MB이하로 등록')}>
                        <ImagePicker
                            onChangeImage={(image) => setLogoImage(image)}
                            value={logoImage}
                            placeholder={getString('로고 이미지를 등록해주세요')}
                        />
                    </RowWrapper>
                    <RowWrapper label={getString('대표 이미지')} subTitle={getString('이미지 파일 10MB이하로 등록')}>
                        <ImagePicker
                            onChangeImage={(image) => setMainImage(image)}
                            value={mainImage}
                            placeholder={getString('대표 이미지를 등록해주세요')}
                        />
                    </RowWrapper>

                    <RowWrapper
                        label={getString('자료 업로드')}
                        subTitle={getString('10M이하로, 5개까지의 pdf 파일 등록')}
                    >
                        <DocumentPicker
                            onChangeFiles={(files) => setUploadFiles(files)}
                            value={uploadFiles}
                            placeholder={getString('자료를 등록해주세요')}
                        />
                    </RowWrapper>

                    <View style={{ marginTop: 37 }}>
                        <Text style={[globalStyle.ltext, { textAlign: 'center', lineHeight: 23 }]}>
                            {getString(`작성하신 제안을 등록하시기 전에 미리보기를 통해\n내용을 확인해주세요&#46;`)}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                        <ShortButton
                            onPress={() =>
                                navigation.navigate('ProposalPreview', {
                                    title,
                                    description,
                                    type: proposalType,
                                    votePeriod: {
                                        begin: date.startDate && new Date(date.startDate?.timestamp),
                                        end: date.endDate && new Date(date.endDate?.timestamp),
                                    },
                                    fundingAmount: getAmountAsBoaString(boa),
                                    logoImage,
                                    mainImage,
                                })
                            }
                            // buttonStyle={{ height: 36 }}
                            title={getString('미리보기')}
                            filled
                        />
                        <ShortButton
                            onPress={saveAsTemp}
                            title={getString('임시저장')}
                            containerStyle={{ marginLeft: 8 }}
                            // buttonStyle={{ height: 36 }}
                        />
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </>
    );
};

export default CreateProposal;
