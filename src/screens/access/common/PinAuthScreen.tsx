import React, { useContext, useState, useEffect } from 'react';
import { Keyboard, View } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { Button, Text } from 'react-native-elements';

import Dot from '~/components/ui/Dot';
import globalStyle from '~/styles/global';
import VirtualNumericKeypad from '~/components/keypad';
import getString from '~/utils/locales/STRINGS';

interface PinAuthScreenProps {
    onComplete: (pin: string) => void;
    onRecover: () => void;
    onSignup: () => void;
    error?: boolean;
}

const PinAuthScreen = (props: PinAuthScreenProps) => {
    const { error } = props;
    const themeContext = useContext(ThemeContext);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);

    useEffect(() => {
        if (error) {
            setPassword('');
            setPasswordError(true);
        }
    }, [error]);

    useEffect(() => {
        if (password.length === 6) {
            props.onComplete(password);
        }
    }, [password]);

    const onValueChange = (val: string) => {
        if (passwordError) setPasswordError(false);
        setPassword(val);
    };

    const renderDots = () => {
        let dots = [];
        for (let i = 0; i < 6; i++) {
            dots.push(<Dot active={!!password[i]} key={'dot_' + i} />);
        }
        return <View style={{ flexDirection: 'row' }}>{dots}</View>;
    };

    return (
        <View style={{ flex: 1, alignItems: 'center', paddingTop: 40 }}>
            <Text style={[globalStyle.btext, { fontSize: 17 }]}>{getString('간편 암호 입력')}</Text>
            <Text style={{ marginTop: 13 }}>{getString(`암호 6자리를 입력해주세요`)}</Text>
            <View style={{ marginTop: 42, alignItems: 'center' }}>
                {renderDots()}
                <Text
                    style={{
                        alignSelf: 'center',
                        marginTop: 41,
                        color: passwordError ? themeContext.color.disagree : 'white',
                    }}
                >
                    {getString('입력한 비밀번호가 올바르지 않습니다&#46;')}
                </Text>
            </View>
            <View style={{ justifyContent: 'center', flex: 1 }}>
                <VirtualNumericKeypad value={password} onChange={onValueChange} maxLength={6} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <Button
                    title={getString('암호를 잃어버렸어요')}
                    titleStyle={[
                        globalStyle.mtext,
                        globalStyle.size10spacing13,
                        { color: '#888888', textDecorationLine: 'underline' },
                    ]}
                    type="clear"
                    onPress={() => props.onRecover()}
                />

                <Button
                    title={getString('신규 가입')}
                    titleStyle={[
                        globalStyle.mtext,
                        globalStyle.size10spacing13,
                        { color: '#888888', textDecorationLine: 'underline' },
                    ]}
                    type="clear"
                    onPress={() => props.onSignup()}
                />
            </View>
        </View>
    );
};

export default PinAuthScreen;
