/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { View, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native-elements';
import moment from 'moment';

interface PeriodProps {
    type: string;
    typeStyle?: StyleProp<TextStyle>;
    periodStyle?: StyleProp<TextStyle>;
    created: Date;
    deadline: Date;
    color?: string;
}

const styles = StyleSheet.create({
    types: { fontSize: 11, paddingRight: 13, fontFamily: 'NotoSansCJKkrMedium' },
    periods: { fontSize: 12, fontFamily: 'RobotoRegular' },
});

const PeriodTime = (props: PeriodProps): any => {
    const { type, created, deadline, color, typeStyle, periodStyle } = props;

    const convertPeriod = (startDate: number | Date | undefined, endDate: number | Date | undefined) => {
        if (startDate === undefined || endDate === undefined) return '';
        const start = new Date(startDate);
        const end = new Date(endDate);

        return `${moment(start).format('yyyy-MM-DD HH:mm')} - ${moment(end).format('MM-DD HH:mm')}`;
    };

    return (
        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
            <Text style={[{ ...styles.types, color }, typeStyle]}>{type}</Text>
            <Text style={[{ ...styles.periods, color }, periodStyle]}>{convertPeriod(created, deadline)}</Text>
        </View>
    );
};

export default PeriodTime;
