/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-elements';
import globalStyle from '~/styles/global';
import getString from '~/utils/locales/STRINGS';

interface HeaderProps {
    type: string;
    transparent: boolean;
}
/*
<View style={{ justifyContent: 'center', alignItems: 'center' }}>
    <StatusMark type="BUSINESS" transparent={false} />
    <StatusMark type="SYSTEM" transparent={false} />
    <StatusMark type="SYSTEM" transparent />
    <StatusMark type="BUSINESS" transparent />
</View>
*/

const styles = StyleSheet.create({
    businessContents: {
        backgroundColor: 'rgb(29, 197, 220)',
    },
    contents: {
        alignItems: 'center',
        backgroundColor: 'rgb(29, 197, 220)',
        borderRadius: 6,
        height: 24,
        justifyContent: 'center',
        marginRight: 10,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    systemContents: {
        backgroundColor: 'rgb(242, 145, 229)',
    },
    transparentContents: {
        backgroundColor: 'transparent',
        borderColor: 'white',
        borderWidth: 1,
    },
});

const StatusMark = (props: HeaderProps): any => {
    const { type, transparent } = props;
    let componentStyle;
    let markText;

    switch (type) {
        case 'BUSINESS':
            componentStyle = styles.businessContents;
            markText = getString('사업 제안');
            break;
        case 'SYSTEM':
            componentStyle = styles.systemContents;
            markText = getString('시스템 제안');
            break;
        default:
            break;
    }
    if (transparent) {
        componentStyle = { ...componentStyle, ...styles.transparentContents };
    }

    return (
        <View style={{ ...styles.contents, ...componentStyle }}>
            <Text style={[globalStyle.mtext, { color: 'white', fontSize: 12 }]}>{markText}</Text>
        </View>
    );
};

export default StatusMark;
