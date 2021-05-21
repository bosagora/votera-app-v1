/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-elements';
import { Enum_Proposal_Type } from '~/graphql/generated/generated';

interface DdayMarkProps {
    deadline: number | Date | undefined;
    type: Enum_Proposal_Type | undefined;
    color?: string;
}

/**
 * ! 폰트 추가 
 * GmarketSansTTFBold
 * 위치 : assets/fonts/GmarketSansTTFBold.ttf
 * 사용법: 
 * * expo install expo-font
 * * import * as Font from 'expo-font'
 * * load font 
 *  Font.loadAsync({
        GmarketSansTTFBold: require('@assets/fonts/GmarketSansTTFBold.ttf'),
    });
    * fontFamily: 'GmarketSansTTFBold'

 * * Component Example
const nextDay = new Date();
nextDay.setDate(new Date().getDate() + 16);
<Dday deadline={nextDay} type="BUSINESS" />
<Dday deadline={nextDay} type="SYSTEM" />
*/

const styles = StyleSheet.create({
    businessFonts: { color: 'rgb(29, 197, 220)' },
    systemFonts: { color: 'rgb(242, 145, 229)' },
    contents: {},
    fonts: {
        fontFamily: 'GmarketSansTTFBold',
        fontSize: 11,
    },
});

const DdayMark = (props: DdayMarkProps): JSX.Element => {
    const { deadline, type, color } = props;
    let fontStyle;

    switch (type) {
        case 'BUSINESS':
            fontStyle = { ...styles.fonts, ...styles.businessFonts };
            break;
        case 'SYSTEM':
            fontStyle = { ...styles.fonts, ...styles.systemFonts };
            break;
        default:
            break;
    }
    if (color && color === 'white') {
        fontStyle = { ...fontStyle, color, fontSize: 14 };
    }

    const ddayCalc = (time: number | Date | undefined) => {
        if (time === undefined) return 0;

        const Dday = new Date(time);
        const now = new Date(); // 현재(오늘) 날짜를 받아온다.

        const gap = Dday.getTime() - now.getTime(); // 현재 날짜에서 D-day의 차이를 구한다.

        const day = Math.floor(gap / (1000 * 60 * 60 * 24)) + 1;
        if (day < 0) return '';

        return `D - ${day}`;
    };

    return (
        <View style={{ ...styles.contents }}>
            <Text style={{ ...fontStyle }}>{ddayCalc(deadline)}</Text>
        </View>
    );
};

export default DdayMark;
