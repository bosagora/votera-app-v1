/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { View, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native-elements';

interface PeriodBlockProps {
    type: string;
    typeStyle?: StyleProp<TextStyle>;
    periodStyle?: StyleProp<TextStyle>;
    start: number | undefined | null;
    end: number | undefined | null;
    color?: string;
}

const styles = StyleSheet.create({
    types: { fontSize: 11, paddingRight: 13, fontFamily: 'NotoSansCJKkrMedium' },
    periods: { fontSize: 12, fontFamily: 'RobotoRegular' },
});

const PeriodBlock = (props: PeriodBlockProps): any => {
    const { type, start, end, color, typeStyle, periodStyle } = props;

    return (
        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
            <Text style={[{ ...styles.types, color }, typeStyle]}>{type}</Text>
            <Text style={[{ ...styles.periods, color }, periodStyle]}>{start} - {end}</Text>
        </View>
    );
};

export default PeriodBlock;
