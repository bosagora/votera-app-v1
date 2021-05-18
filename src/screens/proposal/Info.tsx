import React, { useContext, useEffect, useState } from 'react';
import { View, Image, Dimensions } from 'react-native';
// import { convertPeriod } from '~/utils';
import { downloadFile } from '~/utils/file';
import { getImageSize, ISize } from '~/utils/image';
import DownloadComponent from '~/components/ui/Download';
import { Enum_Proposal_Type, Proposal, SummarizeResponse } from '~/graphql/generated/generated';
import { Divider, Text } from 'react-native-elements';
import globalStyle from '~/styles/global';
import { ThemeContext } from 'styled-components/native';
import AssessAvg from '~/components/proposal/AssessAvg';
import moment from 'moment';
import { ProposalType } from '~/types/proposalType';
import { getProposalStatusString } from '~/components/status/ProgressMark';
import { ProposalContext } from '~/contexts/ProposalContext';
import { useDispatch } from 'react-redux';
import ActionCreators from '~/state/actions';
import getString from '~/utils/locales/STRINGS';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
    previewData: ProposalType | Proposal | undefined;
    assessResultData: SummarizeResponse;
    reviewData?: any;
    isPreview?: boolean;
    onLayout: (h: number) => void;
}

const LineComponent: React.FC = () => <Divider style={{ marginVertical: 30 }} />;
const TitleComponent: React.FC = (props) => <View style={{ marginBottom: 30 }}>{props.children}</View>;

const Info = (props: Props) => {
    const themeContext = useContext(ThemeContext);
    const dispatch = useDispatch();
    const { previewData, assessResultData, isPreview, onLayout } = props;
    const defaultStyle = { lineHeight: 25 };
    const [logoImageSize, setLogoImageSize] = useState<ISize>();
    const { proposal } = useContext(ProposalContext);
    const [data, setData] = useState<ProposalType | Proposal | undefined>();

    useEffect(() => {
        if (isPreview) {
            setData(previewData);
        } else {
            setData(proposal);
        }
    }, [proposal, isPreview, previewData]);

    useEffect(() => {
        if (data?.logo?.url) {
            getImageSize(data.logo.url).then((_logoImageSize) => {
                if (_logoImageSize.width > SCREEN_WIDTH - 46) {
                    const imageRatio = (SCREEN_WIDTH - 46) / _logoImageSize.width;
                    setLogoImageSize({ width: SCREEN_WIDTH - 46, height: _logoImageSize.height * imageRatio });
                } else {
                    setLogoImageSize(_logoImageSize);
                }
            });
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
    }, [data]);

    return (
        <View
            style={{ marginBottom: 90 }}
            onLayout={(event) => {
                onLayout(event.nativeEvent.layout.height);
            }}
        >
            {data?.logo?.url && (
                <View style={{ alignItems: 'center', paddingBottom: 35 }}>
                    <Image style={{ ...logoImageSize }} resizeMode="contain" source={{ uri: data.logo?.url }} />
                </View>
            )}
            <View>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={defaultStyle}>{getString('제안유형')}</Text>
                    <Text style={[globalStyle.ltext, { ...defaultStyle, marginLeft: 18 }]}>
                        {data?.type === Enum_Proposal_Type.Business ? getString('사업제안') : getString('시스템제안')}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={defaultStyle}>{getString('제안상태')}</Text>
                    <Text style={[globalStyle.ltext, { ...defaultStyle, lineHeight: 25, marginLeft: 18 }]}>
                        {getProposalStatusString(data?.status)}
                    </Text>
                </View>
                {data?.type === Enum_Proposal_Type.Business && (
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={defaultStyle}>{getString('제안기간')}</Text>
                        <Text style={[globalStyle.ltext, { ...defaultStyle, marginLeft: 18 }]}>
                            {`${moment(new Date(data?.votePeriod?.begin)).format('YYYY.M.D')} ~ ${moment(
                                new Date(data?.votePeriod?.end),
                            ).format('M.D')}`}
                        </Text>
                    </View>
                )}
                {data?.type === Enum_Proposal_Type.Business && (
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={defaultStyle}>{getString('요청비용')}</Text>
                        <Text
                            style={[
                                globalStyle.btext,
                                { ...defaultStyle, color: themeContext.color.primary, marginLeft: 18 },
                            ]}
                        >
                            {data.fundingAmount?.toLocaleString()} BOA
                        </Text>
                    </View>
                )}
            </View>

            {/* {props.data && props.data.mainImage.url && (
                <View style={{ alignItems: 'center', paddingTop: 45 }}>
                    <Image
                        style={{ ...mainImageSize }}
                        resizeMode="contain"
                        source={{ uri: props.data.mainImage.url }}
                    />
                </View>
            )} */}

            <LineComponent />

            <TitleComponent>
                <Text>{getString('사업목표 및 설명')}</Text>
            </TitleComponent>

            <Text style={globalStyle.ltext}>{data?.description}</Text>

            <LineComponent />

            {data?.type === Enum_Proposal_Type.Business && (
                <>
                    <TitleComponent>
                        <Text>{getString('적합도 평가')}</Text>
                    </TitleComponent>

                    <AssessAvg assessResultData={assessResultData} />
                    <LineComponent />
                </>
            )}

            {data?.attachment?.length ? (
                <>
                    <TitleComponent>
                        <Text>{getString('첨부파일')}</Text>
                    </TitleComponent>
                    {data.attachment.map((file, index) => {
                        return (
                            <DownloadComponent
                                key={'file_' + index}
                                label={file?.name || 'filename'}
                                onPress={() =>
                                    downloadFile(file?.url, file?.name).then(async (result) => {
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
                </>
            ) : null}
        </View>
    );
};

export default Info;
