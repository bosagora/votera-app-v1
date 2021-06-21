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
                >{getString(`계정을 복구할 준비가 되었습니다&#46;`)}</Text>
            </View>

            <View style={{ flex: 1, justifyContent: 'center' }}>
                <CommonButton
                    title={getString('복구하기')}
                    buttonStyle={{ justifyContent: 'space-between', paddingHorizontal: 21, width: 209 }}
                    filled
                    onPress={() => props.onComplete()}
                    raised
                />
            </View>
        </View>
    );
};

export default CompleteScreen;
