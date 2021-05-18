import React, { useContext } from 'react';
import { View, Image } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { useDispatch } from 'react-redux';
import { Text } from 'react-native-elements';
import { Enum_Proposal_Status } from '~/graphql/generated/generated';
import globalStyle from '~/styles/global';
import CommonButton from '~/components/button/CommonButton';
import { ProposalContext } from '~/contexts/ProposalContext';
import { openProposalResultLink } from '~/utils/linkutil';
import ActionCreators from '~/state/actions';

interface VoteResultProps {
    data: any;
    status: Enum_Proposal_Status;
}

const VoteResult = (props: VoteResultProps) => {
    const themeContext = useContext(ThemeContext);
    const { proposal } = useContext(ProposalContext);
    const dispatch = useDispatch();

    const openVoteResult = () => {
        openProposalResultLink(proposal?.proposalId || '').catch((err) => {
            dispatch(ActionCreators.snackBarVisibility({
                visibility: true,
                text: '투표 결과 오픈 중 오류가 발생했습니다'
            }));
        });
    }

    return (
        <View style={{ backgroundColor: 'white' }}>
            <View style={{ alignItems: 'center', marginTop: 25 }}>
                <Image source={require('@assets/images/vote/vote.png')} />
            </View>

            <View style={{ alignItems: 'center', marginTop: 25 }}>
                <Text style={[globalStyle.btext, { fontSize: 20, color: themeContext.color.primary }]}>
                    투표 종료
                </Text>
                <Text style={{ marginTop: 13 }}>
                    투표가 종료되었습니다. 투표 결과를 확인하시려면 아래 버튼을 눌러주세요.
                </Text>
            </View>

            <View style={{ flex: 1, justifyContent: 'center', marginVertical: 25 }}>
                <CommonButton
                    title="투표 결과 확인"
                    containerStyle={{ borderRadius: 25, alignSelf: 'center' }}
                    buttonStyle={{
                        justifyContent: 'space-between',
                        paddingHorizontal: 21,
                        width: 209,
                    }}
                    filled
                    disabledStyle={{ backgroundColor: 'rgb(235,231,245)', borderColor: 'rgb(235,231,245)' }}
                    disabledTitleStyle={{ color: 'white' }}
                    onPress={openVoteResult}
                    raised
                />
            </View>
        </View>
    );
};

export default VoteResult;
