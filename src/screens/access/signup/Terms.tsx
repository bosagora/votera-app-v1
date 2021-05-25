import React, { useState, useContext, useEffect } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import globalStyle from '~/styles/global';
import { Text, CheckBox } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import CommonButton from '~/components/button/CommonButton';
import getString from '~/utils/locales/STRINGS';
import { getUserServiceTermURL, getPrivacyTermURL } from '~/utils/agoraconf';

interface TermsProps {
    onComplete: () => void;
}

const Terms = (props: TermsProps) => {
    const { color } = useContext(ThemeContext);
    const { onComplete } = props;
    const [congressTerm, setCongressTerm] = useState(false);
    const [privacyTerm, setPrivacyTerm] = useState(false);
    const [allCheck, setAllCheck] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        setAllCheck(congressTerm && privacyTerm);
    }, [congressTerm, privacyTerm]);

    const checkboxIcon = (isActive: boolean) => (
        <View
            style={{
                width: 34,
                height: 35,
                borderWidth: 2,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isActive ? color.primary : 'white',
                borderColor: isActive ? color.primary : color.boxBorder,
            }}
        >
            <Image
                style={{
                    width: 17,
                    height: 13,
                    tintColor: isActive ? 'white' : color.boxBorder,
                }}
                source={require('@assets/icons/checkIcon.png')}
            />
        </View>
    );

    return (
        <View style={{ flex: 1, paddingBottom: 97, marginTop: 22 }}>
            <View style={{ flex: 1 }}>
                <Text style={{ lineHeight: 23 }}>
                    {getString('아래의 인증회원 약관과 개인정보수집 및 이용약관을\n확인해 보시고 동의해주세요')}
                </Text>

                <View style={[globalStyle.flexRowBetween, { marginTop: 32 }]}>
                    <View style={globalStyle.flexRowAlignCenter}>
                        <CheckBox
                            containerStyle={{ padding: 0, marginLeft: 0 }}
                            onPress={() => setCongressTerm(!congressTerm)}
                            checked={congressTerm}
                            checkedIcon={checkboxIcon(true)}
                            uncheckedIcon={checkboxIcon(false)}
                        />
                        <Text style={{ fontSize: 13, letterSpacing: -1 }}>
                            {getString(`\"Congress Function\" 인증회원 약관`)}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate('Common', {
                                screen: 'WebView',
                                params: { title: getString('인증회원약관'), uri: getUserServiceTermURL() },
                            });
                        }}
                    >
                        <Text style={{ color: color.primary }}>{getString('내용보기')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={[globalStyle.flexRowBetween, { marginTop: 10 }]}>
                    <View style={globalStyle.flexRowAlignCenter}>
                        <CheckBox
                            containerStyle={{ padding: 0, marginLeft: 0 }}
                            onPress={() => setPrivacyTerm(!privacyTerm)}
                            checked={privacyTerm}
                            checkedIcon={checkboxIcon(true)}
                            uncheckedIcon={checkboxIcon(false)}
                        />
                        <Text style={{ fontSize: 13, letterSpacing: -1 }}>{getString('개인정보수집 및 이용약관')}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate('Common', {
                                screen: 'WebView',
                                params: { title: getString('개인정보수집약관'), uri: getPrivacyTermURL() },
                            });
                        }}
                    >
                        <Text style={{ color: color.primary }}>{getString('내용보기')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ alignItems: 'center' }}>
                <CommonButton
                    title={getString('동의하고 인증하기')}
                    containerStyle={{ borderRadius: 25 }}
                    buttonStyle={{
                        justifyContent: 'space-between',
                        paddingHorizontal: 21,
                        width: 209,
                    }}
                    filled
                    disabled={!allCheck}
                    disabledStyle={{ backgroundColor: 'rgb(235,231,245)', borderColor: 'rgb(235,231,245)' }}
                    disabledTitleStyle={{ color: 'white' }}
                    onPress={onComplete}
                    raised={allCheck}
                />
            </View>
        </View>
    );
};

export default Terms;
