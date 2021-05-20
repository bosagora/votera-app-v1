import React, { useContext, useState } from 'react';
import { View, Alert } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { useDispatch } from 'react-redux';
import * as Device from 'expo-device';
import { Icon, Text } from 'react-native-elements';
import CommonButton from '~/components/button/CommonButton';
import TextInputComponent from '~/components/input/SingleLineInput2';
import globalStyle from '~/styles/global';
import ActionCreators from '~/state/actions';
import { ValidatorLogin, parseQrcodeValidatorLogin } from '~/utils/voterautil';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import getString from '~/utils/locales/STRINGS';

interface AuthProps {
    onScanned: (loginData: ValidatorLogin) => void;
    onComplete: (nodeName: string) => void;
}

const NodeAuth = (props: AuthProps) => {
    const themeContext = useContext(ThemeContext);
    const dispatch = useDispatch();
    const [scaned, setscaned] = useState(false);
    const [nodeName, setNodeName] = useState('');
    const [validator, setValidator] = useState('');

    const authenticateNode = async () => {
        if (!Device.isDevice) {
            Alert.alert('Not Available');
            return;
        }

        const checkNode = (data: string) => {
            dispatch(ActionCreators.qrcodeScanner({ visibility: false }));

            try {
                const loginData = parseQrcodeValidatorLogin(data);
                setValidator(loginData.validator);
                props.onScanned(loginData);

                setscaned(true);
            } catch (err) {
                console.log('checkNode error = ', err);

                dispatch(
                    ActionCreators.snackBarVisibility({
                        visibility: true,
                        text: getString('인증이 정상적으로 처리되지 않았습니다. 코드 확인후 다시 시도해주세요!'),
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

    const checkNodeName = (text: string) => {
        // Node name 중복체크하는 로직
        setNodeName(text);
        if (text.length) props.onComplete(text);
    };

    const NotScanedScreen = () => {
        return (
            <>
                <Text style={{ lineHeight: 23 }}>
                    {getString(
                        `Votera 계정을 만들기 위해서는 최소 1개 이상의 유효한\nBOSAGORA 노드를 보유하고 계셔야 합니다&#46;`,
                    )}
                </Text>

                <View style={{ marginTop: 63 }}>
                    <Text style={[globalStyle.btext, { color: themeContext.color.disagree }]}>
                        {getString('주의사항')}
                    </Text>
                    <Text style={{ lineHeight: 23, marginTop: 13 }}>
                        {`- ${getString('각각의 노드는')} `}
                        <Text style={[globalStyle.btext, { color: themeContext.color.primary }]}>
                            {`40,000 ${getString('보아')}`}
                        </Text>
                        {getString(
                            `이상 보유하고 있어야 합니다&#46;\n- 이미 인증된 노드라도, 해당 노드가 보유하고 있는 보아가`,
                        )}
                        <Text style={globalStyle.btext}>{`40,000 ${getString('보아')}`}</Text>
                        {` ${getString(`이하일 경우 재인증하여야 합니다&#46;`)} `}
                    </Text>
                </View>

                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <CommonButton
                        title={getString('노드 인증하기')}
                        containerStyle={{ borderRadius: 25, alignSelf: 'center' }}
                        buttonStyle={{
                            justifyContent: 'space-between',
                            paddingHorizontal: 21,
                            width: 209,
                        }}
                        filled
                        disabledStyle={{ backgroundColor: 'rgb(235,231,245)', borderColor: 'rgb(235,231,245)' }}
                        disabledTitleStyle={{ color: 'white' }}
                        onPress={authenticateNode}
                        raised
                    />
                </View>
            </>
        );
    };

    const ScanedScreen = () => {
        return (
            <KeyboardAwareScrollView style={{ flex: 1 }} enableResetScrollToCoords={false} scrollEnabled={false}>
                <Text style={[globalStyle.btext, { color: 'black' }]}>인증된 노드 주소</Text>
                <Text style={[globalStyle.gmtext, { fontSize: 12, lineHeight: 20, marginTop: 17 }]}>
                    {`${validator}`}
                </Text>
                <Text style={{ lineHeight: 23, marginTop: 40 }}>
                    {getString(`노드의 닉네임을 입력해주세요!\n추후 내 설정에서 언제든 변경할 수 있습니다&#46;`)}
                </Text>
                <TextInputComponent
                    style={{ marginTop: 32 }}
                    inputStyle={{ color: themeContext.color.primary }}
                    value={nodeName}
                    onChangeText={checkNodeName}
                    subComponent={
                        nodeName.length ? (
                            <Icon
                                onPress={() => setNodeName('')}
                                name="cancel"
                                color={themeContext.color.primary}
                                size={28}
                            />
                        ) : null
                    }
                    placeholderText={getString('노드 닉네임을 입력해주세요')}
                    searchValue=""
                />
            </KeyboardAwareScrollView>
        );
    };

    return <View style={{ flex: 1, paddingTop: 45 }}>{scaned ? ScanedScreen() : NotScanedScreen()}</View>;
};

export default NodeAuth;
