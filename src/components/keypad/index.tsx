import React, { useState, useEffect } from 'react';
import { View, StyleProp, ViewStyle, TouchableOpacity, TextStyle } from 'react-native';
import { Icon, Text } from 'react-native-elements';
import globalStyle from '~/styles/global';
import styles from './style';

interface VirtualNumericKeypadProps {
    style?: StyleProp<ViewStyle>;
    rowStyle?: StyleProp<ViewStyle>;
    cellStyle?: StyleProp<ViewStyle>;
    numberStyle?: StyleProp<TextStyle>;
    onChange: (val: string) => void;
    value: string;
    maxLength: number;
}

const VirtualNumericKeypad = (props: VirtualNumericKeypadProps) => {
    const [password, setPassword] = useState('');

    useEffect(() => {
        setPassword(props.value);
    }, [props.value]);

    const Cell = (symbol: any) => {
        return (
            <TouchableOpacity style={[styles.cell, props.cellStyle]} key={symbol} onPress={() => onPress(symbol)}>
                <Text style={[globalStyle.gmtext, { fontSize: 19 }]}>{symbol}</Text>
            </TouchableOpacity>
        );
    };

    const Row = (numbersArray: [any, any, any]) => {
        const cells = numbersArray.map((number) => Cell(number));
        return <View style={[styles.row, props.rowStyle]}>{cells}</View>;
    };

    const Clear = () => {
        return (
            <TouchableOpacity style={[styles.cell, props.cellStyle]} onPress={() => onPress('clear')}>
                <Icon name="clear" />
            </TouchableOpacity>
        );
    };

    const Backspace = () => {
        return (
            <TouchableOpacity style={[styles.cell, props.cellStyle]} onPress={() => onPress('back')}>
                <Icon name="arrow-back" />
            </TouchableOpacity>
        );
    };

    const onPress = (val: any) => {
        if (isNaN(val)) {
            if (val === 'back') {
                setPassword(password.slice(0, -1));
                props.onChange(password.slice(0, -1));
            } else {
                setPassword('');
                props.onChange('');
            }
        } else {
            if (password.length >= props.maxLength) return;
            setPassword(password + val);
            props.onChange(password + val);
        }
    };

    return (
        <View style={[styles.container, props.style]}>
            {Row([1, 2, 3])}
            {Row([4, 5, 6])}
            {Row([7, 8, 9])}
            <View style={[styles.row, props.rowStyle]}>
                {Clear()}
                {Cell(0)}
                {Backspace()}
            </View>
        </View>
    );
};

export default VirtualNumericKeypad;
