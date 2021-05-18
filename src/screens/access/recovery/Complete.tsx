import React, { useContext } from 'react';
import { View, Image, Alert } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import CommonButton from '~/components/button/CommonButton';
import globalStyle from '~/styles/global';
import Clipboard from 'expo-clipboard';

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
                >{`계정이 성공적으로 복구되었습니다.`}</Text>
            </View>

            <View style={{ flex: 1, justifyContent: 'center' }}>
                <CommonButton
                    title="복구하기"
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
