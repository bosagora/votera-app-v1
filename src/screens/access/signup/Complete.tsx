import React, { useContext } from 'react';
import { View, Image, Alert } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import CommonButton from '~/components/button/CommonButton';
import globalStyle from '~/styles/global';
import Clipboard from 'expo-clipboard';
import getString from '~/utils/locales/STRINGS';

interface CompleteProps {
    onComplete: () => void;
}

const CompleteScreen = (props: CompleteProps) => {
    const themeContext = useContext(ThemeContext);

    return (
        <View style={{ flex: 1, alignItems: 'center', paddingTop: 30 }}>
            <View style={{ flex: 1.5 }}>
                <Text
                    style={[
                        globalStyle.btext,
                        { fontSize: 17, color: themeContext.color.primary, textAlign: 'center' },
                    ]}
                >
                    {getString(`노드 인증 및 암호 입력이\n모두 완료되었습니다!`)}
                </Text>
            </View>

            <View style={{ flex: 1, justifyContent: 'center' }}>
                <CommonButton
                    title={getString('VOTERA 시작하기')}
                    buttonStyle={{ justifyContent: 'space-between', paddingHorizontal: 21, width: 209 }}
                    filled
                    onPress={() => props.onComplete()}
                    raised
                />
                {/* <CommonButton
                    title="노드 추가 인증하기"
                    buttonStyle={{ justifyContent: 'space-between', paddingHorizontal: 21, width: 209, marginTop: 11 }}
                    // onPress={() => navigation.navigate('Signup')}
                /> */}
                {/* <LongButton
                    style={{
                        alignSelf: 'center',
                        backgroundColor: themeContext.color.main,
                        borderWidth: 0,
                        width: 209,
                        shadowOffset: { width: 0, height: 15 },
                        shadowOpacity: 0.29, shadowRadius: 15,
                        shadowColor: 'rgb(120,100,176)'
                    }}
                    content={(
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25 }}>
                            <Image source={require('@assets/images/logo/voteraLogoWhite.png')} />
                            <BText style={{ color: 'white', fontSize: 15 }}>시작하기</BText>
                            <Image source={require('@assets/images/icons/arrow/rightArrowWhite.png')} />
                        </View>
                    )}
                    onPress={() => props.onComplete()}
                /> */}
                {/* <LongButton
                    style={{
                        alignSelf: 'center',
                        backgroundColor: 'white',
                        borderWidth: 2,
                        borderColor: 'rgb(222,212,248)',
                        width: 209,
                        marginTop: 11
                    }}
                    content={(
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25 }}>
                            <BText style={{ color: themeContext.color.main, fontSize: 15 }}>노드 추가 인증하기</BText>
                            <Image source={require('@assets/images/icons/arrow/arrowGrad.png')} />
                        </View>
                    )}
                    onPress={() => { }}
                /> */}
            </View>
        </View>
    );
};

export default CompleteScreen;
