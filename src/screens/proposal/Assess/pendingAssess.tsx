import React, { useContext, useEffect } from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import globalStyle from '~/styles/global';
import CommonButton from '~/components/button/CommonButton';
import { useGetProposalFeeQuery, Enum_Fee_Status, Enum_Proposal_Type } from '~/graphql/generated/generated';
import { makeProposalFeeDataLinkData, getAmountFromBoaString } from '~/utils/voterautil';
import { openProposalFeeLink } from '~/utils/linkutil';
import { ProposalContext } from '~/contexts/ProposalContext';
import ActionCreators from '~/state/actions';
import getString from '~/utils/locales/STRINGS';

interface Props {
    onChangeStatus: () => void;
}

const LineComponent: React.FC = () => (
    <View style={{ height: 1, width: '100%', backgroundColor: 'rgb(235,234,239)', marginVertical: 30 }} />
);

const PendingAssess = (props: Props) => {
    const { proposal } = useContext(ProposalContext);
    const themeContext = useContext(ThemeContext);
    const dispatch = useDispatch();

    const defaultStyle = { lineHeight: 25 };

    const { data, loading, refetch } = useGetProposalFeeQuery({
        skip: !proposal?.id,
        variables: {
            id: proposal?.id || '',
        },
        fetchPolicy: 'cache-and-network',
    });

    useEffect(() => {
        if (data?.proposalFee?.status === Enum_Fee_Status.Paid) {
            dispatch(
                ActionCreators.snackBarVisibility({
                    visibility: true,
                    text: getString('입금이 확인되었습니다&#46;'),
                }),
            );
            setTimeout(() => {
                props.onChangeStatus();
            }, 1000);
        }
    }, [data]);

    const RenderButton = (): JSX.Element => {
        switch (data?.proposalFee?.status) {
            case Enum_Fee_Status.Wait:
                return (
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly' }}>
                        <CommonButton
                            title={getString('입금 확인')}
                            containerStyle={{ borderRadius: 25, alignSelf: 'center' }}
                            buttonStyle={{
                                justifyContent: 'space-between',
                                paddingHorizontal: 21,
                                minWidth: 120,
                            }}
                            filled
                            disabledStyle={{ backgroundColor: 'rgb(235,231,245)', borderColor: 'rgb(235,231,245)' }}
                            disabledTitleStyle={{ color: 'white' }}
                            onPress={() => {
                                refetch();
                            }}
                            raised
                        />

                        <CommonButton
                            title={getString('지갑 실행')}
                            containerStyle={{ borderRadius: 25, alignSelf: 'center' }}
                            buttonStyle={{
                                justifyContent: 'space-between',
                                paddingHorizontal: 21,
                                width: 120,
                            }}
                            filled
                            disabledStyle={{ backgroundColor: 'rgb(235,231,245)', borderColor: 'rgb(235,231,245)' }}
                            disabledTitleStyle={{ color: 'white' }}
                            onPress={() => {
                                const linkData = makeProposalFeeDataLinkData(
                                    proposal?.proposalId || '',
                                    data?.proposalFee?.proposer_address || '',
                                    data?.proposalFee?.destination || '',
                                    data?.proposalFee?.amount || '0',
                                );

                                openProposalFeeLink(linkData).catch((err) => {
                                    dispatch(
                                        ActionCreators.snackBarVisibility({
                                            visibility: true,
                                            text: getString('지갑 실행 중 오류가 발생했습니다&#46;'),
                                        }),
                                    );
                                });
                            }}
                            raised
                        />
                    </View>
                );
            case Enum_Fee_Status.Paid:
                return (
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text
                            style={[
                                globalStyle.btext,
                                { fontSize: 20, color: themeContext.color.primary, textAlign: 'center' },
                            ]}
                        >
                            {getString('입금 확인')}
                        </Text>
                    </View>
                );
            case Enum_Fee_Status.Irrelevant:
                return (
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text
                            style={[
                                globalStyle.btext,
                                { fontSize: 20, color: themeContext.color.disagree, textAlign: 'center' },
                            ]}
                        >
                            {getString('입금 작업과 관련이 없습니다&#46;')}
                        </Text>
                    </View>
                );
            default:
                return (
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text
                            style={[
                                globalStyle.btext,
                                { fontSize: 20, color: themeContext.color.disagree, textAlign: 'center' },
                            ]}
                        >
                            {getString('입금 정보에 오류가 있습니다&#46;')}
                        </Text>
                    </View>
                );
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" />;
    }
    return (
        <View>
            <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[globalStyle.btext, { fontSize: 20, color: themeContext.color.primary }]}>
                    {getString('사전 평가 준비')}
                </Text>
                {/* <LText style={{ textAlign: 'center', lineHeight: 25, marginTop: 11.5 }}>{`해당 제안을 평가해주세요.\n평가된 평균점수가`}<MText style={{ color: themeContext.color.main }}>70점 이상일 경우</MText>{`에 한해\n정식제안으로 오픈됩니다.`}</LText> */}
            </View>

            <View style={{ marginTop: 30 }}>
                <Text style={globalStyle.btext}>{getString('사전 평가 기간')}</Text>
                <Text style={{ marginTop: 13 }}>{`${moment(new Date(proposal?.assessPeriod?.begin)).format(
                    'll',
                )} ~ ${moment(new Date(proposal?.assessPeriod?.end)).format('ll')}`}</Text>
            </View>

            <LineComponent />

            {data?.proposalFee?.status === Enum_Fee_Status.Wait && (
                <>
                    <Text style={[globalStyle.btext, { color: themeContext.color.disagree }]}>
                        {getString('주의사항')}
                    </Text>
                    <Text style={{ marginTop: 13, lineHeight: 23 }}>
                        {getString(`제안 수수료를 입금해야 사전평가가 시작됩니다&#46;`)}
                    </Text>
                </>
            )}
            <View style={{ flexDirection: 'row' }}>
                <Text style={defaultStyle}>{`${getString('입금주소')} :`}</Text>
                <Text style={[globalStyle.ltext, { ...defaultStyle, marginLeft: 19, flex: 1 }]}>{`${
                    data?.proposalFee?.destination || ''
                }`}</Text>
            </View>
            <View style={{ flexDirection: 'row', paddingBottom: 12 }}>
                <Text style={defaultStyle}>{getString('입금금액')} : </Text>
                <Text
                    style={[globalStyle.btext, { ...defaultStyle, color: themeContext.color.primary, marginLeft: 19 }]}
                >
                    {getAmountFromBoaString(data?.proposalFee?.amount).toLocaleString()} BOA
                </Text>
            </View>

            <View style={{height: 50}}>
                <RenderButton />
            </View>

            <LineComponent />

            <Text style={[globalStyle.btext, { marginTop: 12, marginBottom: 15 }]}>{getString('제안요약')}</Text>
            <View style={{ flexDirection: 'row' }}>
                <Text style={defaultStyle}>Proposal ID</Text>
                <Text style={[globalStyle.ltext, { ...defaultStyle, marginLeft: 19 }]}>{`${
                    proposal?.proposalId || ''
                }`}</Text>
            </View>

            {proposal?.type === Enum_Proposal_Type.Business && (
                <View style={{ flexDirection: 'row' }}>
                    <Text style={defaultStyle}>{getString('요청비용')}</Text>
                    <Text
                        style={[
                            globalStyle.btext,
                            { ...defaultStyle, color: themeContext.color.primary, marginLeft: 19 },
                        ]}
                    >
                        {getAmountFromBoaString(proposal?.fundingAmount).toLocaleString()} BOA
                    </Text>
                </View>
            )}

            <View style={{ flexDirection: 'row' }}>
                <Text style={defaultStyle}>{getString('사업내용')}</Text>
                <Text style={[globalStyle.ltext, { ...defaultStyle, marginLeft: 19, flex: 1 }]}>
                    {proposal?.description}
                </Text>
            </View>
        </View>
    );
};

export default PendingAssess;
