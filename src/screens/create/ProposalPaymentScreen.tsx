import React, { useContext, useEffect } from 'react';
import { View, Image, ActivityIndicator, ScrollView } from 'react-native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import globalStyle from '~/styles/global';
import CommonButton from '~/components/button/CommonButton';
import { useGetProposalFeeQuery, Enum_Fee_Status, Enum_Proposal_Type } from '~/graphql/generated/generated';
import { makeProposalFeeDataLinkData, getAmountFromBoaString } from '~/utils/voterautil';
import { openProposalFeeLink } from '~/utils/linkutil';
import { ProposalContext } from '~/contexts/ProposalContext';
import ActionCreators from '~/state/actions';
import { CreateNavProps } from '~/navigation/types/CreateStackParams';
import ShortButton from '~/components/button/ShortButton';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';

const LineComponent: React.FC = () => (
    <View style={{ height: 1, width: '100%', backgroundColor: 'rgb(235,234,239)', marginVertical: 30 }} />
);

const ProposalPayment = ({ navigation, route }: CreateNavProps<'ProposalPayment'>) => {
    const { proposal, fetchProposal } = useContext(ProposalContext);
    const themeContext = useContext(ThemeContext);
    const dispatch = useDispatch();

    const insets = useSafeAreaInsets();
    const defaultStyle = { lineHeight: 25 };

    const { data, loading, refetch } = useGetProposalFeeQuery({
        skip: !proposal?.id,
        variables: {
            id: proposal?.id || '',
        },
        fetchPolicy: 'cache-and-network',
    });

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: '제안비 납입',
            headerTitleStyle: { ...globalStyle.headerTitle, color: 'white' },
            headerLeft: () => null,
            headerRight: () => (
                <ShortButton
                    title={'확인'}
                    titleStyle={{ fontSize: 14, color: 'white' }}
                    buttonStyle={{
                        backgroundColor: 'transparent',
                        width: 63,
                        height: 32,
                        padding: 0,
                        borderRadius: 47,
                        borderColor: 'white',
                    }}
                    onPress={() => {
                        fetchProposal(route.params.id);
                        navigation.navigate('Main', { screen: 'ProposalDetail', params: { id: route.params.id }});
                    }}
                />
            ),
            headerBackground: () => (
                <Image
                    style={{ height: 55 + insets.top, width: '100%' }}
                    source={require('@assets/images/header/bg.png')}
                />
            ),
        });
    }, [navigation]);

    useEffect(() => {
        fetchProposal(route.params.id);
    }, []);

    useEffect(() => {
        console.log('[ data ] : ', data);
        if (data?.proposalFee?.status === Enum_Fee_Status.Paid) {
            dispatch(
                ActionCreators.snackBarVisibility({
                    visibility: true,
                    text: '입금이 확인되었습니다.',
                }),
            );
            // setTimeout(() => {
            //     navigation.navigate('ProposalDetail', { id: route.params.id });
            // }, 1000);
        }
    }, [data]);

    const renderButton = () => {
        switch (data?.proposalFee?.status) {
            case Enum_Fee_Status.Wait:
                return (
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly' }}>
                        <CommonButton
                            title="입금 확인"
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
                                refetch();
                            }}
                            raised
                        />

                        <CommonButton
                            title="지갑 실행"
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
                                    dispatch(ActionCreators.snackBarVisibility({
                                        visibility: true,
                                        text: '지갑 실행 중 오류가 발생했습니다',
                                    }));
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
                            입금 확인
                        </Text>
                    </View>
                );
            case Enum_Fee_Status.Irrelevant:
                return (
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text>입금 작업과 관련이 없습니다.</Text>
                    </View>
                );
            default:
                return (
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text>입금 정보에 오류가 있습니다.</Text>
                    </View>
                );
        }
    };

    if (loading) {
        return <ActivityIndicator />;
    }
    return (
        <>
            <FocusAwareStatusBar barStyle="light-content" />
            <ScrollView style={{ paddingHorizontal: 20, backgroundColor: 'white', flex: 1 }}>
                <View style={{ marginTop: 30 }}>
                    <Text style={globalStyle.btext}>사전 평가 기간</Text>
                    <Text style={{ marginTop: 13 }}>{`${moment(new Date(proposal?.assessPeriod?.begin)).format(
                        'll',
                    )} ~ ${moment(new Date(proposal?.assessPeriod?.end)).format('ll')}`}</Text>
                </View>

                <LineComponent />

                {data?.proposalFee?.status === Enum_Fee_Status.Wait && (
                    <>
                        <Text style={[globalStyle.btext, { color: themeContext.color.disagree }]}>주의사항</Text>
                        <Text style={{ marginTop: 13, lineHeight: 23 }}>
                            {`제안 수수료를 입금해야 사전평가가 시작됩니다.`}
                        </Text>
                    </>
                )}
                <View style={{ flexDirection: 'row' }}>
                    <Text style={defaultStyle}>입금주소 : </Text>
                    <Text style={[globalStyle.ltext, { ...defaultStyle, marginLeft: 19, flex: 1 }]}>{`${
                        data?.proposalFee?.destination || ''
                    }`}</Text>
                </View>
                <View style={{ flexDirection: 'row', paddingBottom: 12 }}>
                    <Text style={defaultStyle}>입금금액 : </Text>
                    <Text
                        style={[
                            globalStyle.btext,
                            { ...defaultStyle, color: themeContext.color.primary, marginLeft: 19 },
                        ]}
                    >
                        {getAmountFromBoaString(data?.proposalFee?.amount).toLocaleString()} BOA
                    </Text>
                </View>
                {renderButton()}

                <LineComponent />

                <Text style={[globalStyle.btext, { marginTop: 12, marginBottom: 15 }]}>제안요약</Text>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={defaultStyle}>Proposal ID</Text>
                    <Text style={[globalStyle.ltext, { ...defaultStyle, marginLeft: 19 }]}>{`${
                        proposal?.proposalId || ''
                    }`}</Text>
                </View>

                {proposal?.type === Enum_Proposal_Type.Business && (
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={defaultStyle}>사업금액</Text>
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
                    <Text style={defaultStyle}>사업내용</Text>
                    <Text style={[globalStyle.ltext, { ...defaultStyle, marginLeft: 19, flex: 1 }]}>
                        {proposal?.description}
                    </Text>
                </View>
            </ScrollView>
        </>
    );
};

export default ProposalPayment;
