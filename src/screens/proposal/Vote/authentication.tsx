import React, { useContext, useState } from 'react';
import { View, Image, Alert } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { useDispatch } from 'react-redux';
import * as Device from 'expo-device';
import { Text } from 'react-native-elements';
import moment from 'moment';
import globalStyle from '~/styles/global';
import { Enum_Proposal_Status, Enum_Proposal_Type } from '~/graphql/generated/generated';
import CommonButton from '~/components/button/CommonButton';
import { AuthContext } from '~/contexts/AuthContext';
import { parseQrcodeValidatorLogin, parseQrcodeValidatorVote, ValidatorLogin, ValidatorVote } from '~/utils/voterautil';
import ActionCreators from '~/state/actions';
import { ProposalContext } from '~/contexts/ProposalContext';
import getString from '~/utils/locales/STRINGS';

interface Props {
    onNodeAuthComplete: (validatorLogin: ValidatorLogin, validatorVote: ValidatorVote) => void;
}

const LineComponent: React.FC = () => (
    <View style={{ height: 1, width: '100%', backgroundColor: 'rgb(235,234,239)', marginVertical: 30 }} />
);

const Authentication = (props: Props) => {
    const { proposal } = useContext(ProposalContext);
    const { user, getVoterCard, registerVoterCard, isValidVoterCard } = useContext(AuthContext);
    const themeContext = useContext(ThemeContext);
    const dispatch = useDispatch();
    const defaultStyle = { lineHeight: 25 };
    const [validatorLogin, setValidatorLogin] = useState(user ? getVoterCard(user.memberId) : null);
    const [validValidator, setValidValidator] = useState(isValidVoterCard(user?.memberId || ''));

    const authenticateNode = () => {
        if (!Device.isDevice) {
            Alert.alert('Not Available');
            return;
        }

        const checkNode = (data: string) => {
            dispatch(ActionCreators.qrcodeScanner({ visibility: false }));

            try {
                const loginData = parseQrcodeValidatorLogin(data);
                if (validatorLogin) {
                    if (loginData.validator !== validatorLogin.validator) {
                        dispatch(
                            ActionCreators.snackBarVisibility({
                                visibility: true,
                                text: getString('등록된 노드 주소와 다릅니다&#46;'),
                            }),
                        );
                        return;
                    }
                }

                registerVoterCard(user?.memberId || '', user?.nodename || '', loginData.validator, loginData);
                setValidatorLogin(loginData);
                setValidValidator(true);
            } catch (err) {
                console.log('checkNode error = ', err);
                dispatch(
                    ActionCreators.snackBarVisibility({
                        visibility: true,
                        text: getString('노드 인증 실패'),
                    }),
                );
            }
        };

        dispatch(
            ActionCreators.qrcodeScanner({
                visibility: true,
                action: ActionCreators.QRCodeActionType.Validator,
                onComplete: checkNode,
            }),
        );
    };

    const authenticateVote = () => {
        if (!Device.isDevice) {
            Alert.alert('Not Available');
            return;
        } else if (!validatorLogin) {
            Alert.alert(getString('노드 정보가 없습니다'));
            return;
        }

        const checkVote = (data: string) => {
            dispatch(ActionCreators.qrcodeScanner({ visibility: false }));

            try {
                const voteData = parseQrcodeValidatorVote(data);
                props.onNodeAuthComplete(validatorLogin, voteData);
                dispatch(
                    ActionCreators.qrcodeScanner({
                        visibility: false,
                    }),
                );
            } catch (err) {
                console.log('checkNode error = ', err);
                dispatch(
                    ActionCreators.snackBarVisibility({
                        visibility: true,
                        text: getString('Ballot 인증 실패'),
                    }),
                );
            }
        };

        dispatch(
            ActionCreators.qrcodeScanner({
                visibility: true,
                action: ActionCreators.QRCodeActionType.Vote,
                onComplete: checkVote,
            }),
        );
    };

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

            <Text style={[globalStyle.btext, { color: themeContext.color.disagree }]}>{getString('주의사항')}</Text>
            <Text style={{ marginTop: 13, lineHeight: 23 }}>
                {getString(
                    `하나의 노드 당 하나의 투표권을 가집니다&#46;\n투표마감일 전까지는 자유롭게 투표 내용을 변경할 수 있으며 기간이 지난 후에는 투표를 할 수 없습니다&#46;`,
                )}
            </Text>

            <Text style={[globalStyle.btext, { marginTop: 40, marginBottom: 15 }]}>{getString('제안요약')}</Text>
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
            <View style={{ flexDirection: 'row' }}>
                <Text style={defaultStyle}>Validator</Text>
                <Text style={[globalStyle.ltext, { ...defaultStyle, marginLeft: 19, flex: 1 }]}>
                    {validatorLogin?.validator}
                </Text>
            </View>
            {!validValidator && (
                <View style={{ marginTop: 20 }}>
                    <Text style={defaultStyle}>
                        {getString('VoterCard가 유효하지 않습니다&#46; 다시 노드를 인증해주세요')}
                    </Text>
                    <CommonButton
                        title={getString('노드 인증하기')}
                        buttonStyle={{
                            alignSelf: 'center',
                            justifyContent: 'space-between',
                            paddingHorizontal: 21,
                            width: 209,
                            marginTop: 90,
                            shadowOffset: { width: 0, height: 10 },
                        }}
                        disabled={proposal?.status !== Enum_Proposal_Status.Vote}
                        onPress={() => authenticateNode()}
                        filled
                    />
                </View>
            )}
            {validValidator && (
                <View style={{ marginTop: 20 }}>
                    <CommonButton
                        title={getString('Ballot 검증')}
                        buttonStyle={{
                            alignSelf: 'center',
                            justifyContent: 'space-between',
                            paddingHorizontal: 21,
                            width: 209,
                            marginTop: 90,
                            shadowOffset: { width: 0, height: 10 },
                        }}
                        disabled={proposal?.status !== Enum_Proposal_Status.Vote}
                        onPress={() => authenticateVote()}
                        filled
                    />
                </View>
            )}
            {proposal?.status !== Enum_Proposal_Status.Vote && (
                <Text style={{ alignSelf: 'center', marginTop: 20 }}>
                    {getString('투표 기간이 아직 시작하지 않았습니다&#46;')}
                </Text>
            )}
        </View>
    );
};

export default Authentication;
