import React, { useContext } from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import globalStyle from '~/styles/global';
import CommonButton from '~/components/button/CommonButton';
import { Proposal, useGetVoteFeeQuery, Enum_Fee_Status, Enum_Proposal_Type } from '~/graphql/generated/generated';
import { makeFundProposalDataLinkData, makeSystemProposalDataLinkData } from '~/utils/voterautil';
import { openProposalDataLink } from '~/utils/linkutil';
import { ProposalContext } from '~/contexts/ProposalContext';
import ActionCreators from '~/state/actions';
import getString from '~/utils/locales/STRINGS';

interface Props {}

const LineComponent: React.FC = () => (
    <View style={{ height: 1, width: '100%', backgroundColor: 'rgb(235,234,239)', marginVertical: 30 }} />
);

const PendingVote: React.FC<Props> = (props) => {
    const { proposal } = useContext(ProposalContext);
    const themeContext = useContext(ThemeContext);
    const dispatch = useDispatch();
    const defaultStyle = { lineHeight: 25 };

    const { data, loading, refetch } = useGetVoteFeeQuery({
        skip: !proposal?.id,
        variables: {
            id: proposal?.id || '',
        },
        fetchPolicy: 'cache-and-network',
    });

    const makeLinkData = () => {
        if (!data?.voteFee?.proposal) {
            return null;
        }

        const proposal = data.voteFee.proposal;
        if (proposal.type === 'SYSTEM') {
            return makeSystemProposalDataLinkData(
                {
                    proposal_id: proposal.proposalId || '',
                    title: proposal.name || '',
                    start: proposal.vote_start_height || 0,
                    end: proposal.vote_end_height || 0,
                    doc_hash: proposal.doc_hash || '',
                },
                proposal.proposer_address || '',
                JSON.parse(proposal.validators || '[]'),
                proposal.vote_fee || 0,
            );
        } else {
            return makeFundProposalDataLinkData(
                {
                    proposal_id: proposal.proposalId || '',
                    title: proposal.name || '',
                    start: proposal.vote_start_height || 0,
                    end: proposal.vote_end_height || 0,
                    doc_hash: proposal.doc_hash || '',
                    fund_amount: proposal.fundingAmount || 0,
                    proposal_fee: proposal.proposal_fee || 0,
                    tx_hash_proposal_fee: proposal.tx_hash_proposal_fee || '',
                },
                proposal.proposer_address || '',
                proposal.proposal_fee_address || '',
                JSON.parse(proposal.validators || '[]'),
                proposal.vote_fee || 0,
            );
        }
    };

    const renderButton = () => {
        switch (data?.voteFee?.status) {
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
                                const linkData = makeLinkData();
                                if (linkData) {
                                    openProposalDataLink(linkData).catch((err) => {
                                        dispatch(
                                            ActionCreators.snackBarVisibility({
                                                visibility: true,
                                                text: getString('지갑 실행 중 오류가 발생했습니다'),
                                            }),
                                        );
                                    });
                                }
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
            <View style={{ alignItems: 'center', marginTop: 25 }}>
                <Image source={require('@assets/images/vote/vote.png')} />
            </View>

            <View style={{ marginTop: 30 }}>
                <Text style={globalStyle.btext}>{getString('투표 기간')}</Text>
                <Text style={{ marginTop: 13 }}>{`${moment(new Date(proposal?.votePeriod?.begin)).format(
                    'll',
                )} ~ ${moment(new Date(proposal?.votePeriod?.end)).format('ll')}`}</Text>
            </View>

            <LineComponent />

            {data?.voteFee?.status === Enum_Fee_Status.Wait && (
                <>
                    <Text style={[globalStyle.btext, { color: themeContext.color.disagree }]}>주의사항</Text>
                    <Text style={{ marginTop: 13, lineHeight: 23 }}>
                        {`투표 비용을 입금해야 투표가 시작될 수 있습니다.`}
                    </Text>
                </>
            )}

            <View style={{ flexDirection: 'row', paddingBottom: 12 }}>
                <Text style={defaultStyle}>{`${getString('입금금액')} : `}</Text>
                <Text
                    style={[globalStyle.btext, { ...defaultStyle, color: themeContext.color.primary, marginLeft: 19 }]}
                >
                    {data?.voteFee?.proposal?.vote_fee?.toLocaleString()} BOA
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
                    <Text style={defaultStyle}>{getString('요청 금액')}</Text>
                    <Text
                        style={[
                            globalStyle.btext,
                            { ...defaultStyle, color: themeContext.color.primary, marginLeft: 19 },
                        ]}
                    >
                        {proposal?.fundingAmount?.toLocaleString()} BOA
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

export default PendingVote;
