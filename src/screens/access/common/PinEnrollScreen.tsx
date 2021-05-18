import React, { useContext, useState, useEffect } from 'react';
import { Keyboard, View } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { Text } from 'react-native-elements';

import Dot from '~/components/ui/Dot';
import globalStyle from '~/styles/global';
import VirtualNumericKeypad from '~/components/keypad';
import getString from '~/utils/locales/STRINGS';

interface PinEnrollScreenProps {
    mode?: {};
    onComplete: (pin: string) => void;
}

const PinEnrollScreen = (props: PinEnrollScreenProps) => {
    const themeContext = useContext(ThemeContext);
    const [step, setStep] = useState(0);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);

    useEffect(() => {
        if (password.length === 6) {
            setStep(1);
        }
    }, [password]);

    useEffect(() => {
        if (confirmPassword.length === 6) {
            if (password === confirmPassword) {
                // console.log('correct');
                props.onComplete(password);
            } else {
                // console.log('incorrect');
                setConfirmPassword('');
                setPasswordError(true);
            }
        }
    }, [confirmPassword]);

    const onValueChange = (val: string) => {
        if (passwordError) setPasswordError(false);
        step === 0 ? setPassword(val) : setConfirmPassword(val);
    };

    const renderDots = () => {
        let dots = [];
        for (let i = 0; i < 6; i++) {
            dots.push(<Dot active={step === 0 ? !!password[i] : !!confirmPassword[i]} key={'dot_' + i} />);
        }
        return <View style={{ flexDirection: 'row' }}>{dots}</View>;
    };

    return (
        <View style={{ flex: 1, alignItems: 'center', paddingTop: 40 }}>
            <Text style={[globalStyle.btext, { fontSize: 17 }]}>{getString('간편 암호 입력')}</Text>
            <Text style={{ marginTop: 13 }}>
                {step === 0
                    ? getString(`계정 보호에 사용할 암호 6자리를 입력해주세요`)
                    : getString(`확인을 위해 한 번 더 입력해주세요&#46;`)}
            </Text>
            <View style={{ marginTop: 42, alignItems: 'center' }}>
                {renderDots()}
                {passwordError && (
                    <Text
                        style={{
                            alignSelf: 'center',
                            marginTop: 41,
                            color: themeContext.color.disagree,
                        }}
                    >
                        {getString('입력한 값이 일치하지 않습니다&#46; 다시 입력해주십시오&#46;')}
                    </Text>
                )}
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 40 }}>
                <VirtualNumericKeypad
                    value={step === 0 ? password : confirmPassword}
                    onChange={onValueChange}
                    maxLength={6}
                />
            </View>
        </View>
    );
};

export default PinEnrollScreen;
