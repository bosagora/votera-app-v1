import React, { useContext } from 'react';
import { View, StyleProp, ViewStyle, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { Text } from 'react-native-elements';

interface Props {
    buttonStyle?: StyleProp<ViewStyle>;
    buttonDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    data: { label: string }[];
    selectedIndex: number;
    onChange: (idx: number) => void;
}

interface ButtonProps {
    label: string;
}

const RadioButton: React.FC<Props> = (props) => {
    const themeContext = useContext(ThemeContext);
    const makeButton = (buttonData: ButtonProps, index: number) => {
        return (
            <TouchableOpacity
                key={'radiobtn_' + index}
                style={{ flexDirection: 'row', alignItems: 'center', marginRight: 28 }}
                onPress={() => props.onChange(index)}
            >
                <View style={[styles.buttonStyle, props.buttonStyle]}>
                    {props.selectedIndex === index && (
                        <View
                            style={{
                                width: 13,
                                height: 13,
                                borderRadius: 7,
                                backgroundColor: themeContext.color.primary,
                            }}
                        />
                    )}
                </View>
                <Text>{buttonData.label}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flexDirection: props.buttonDirection }}>
            {props.data.map((buttonData, index) => {
                return makeButton(buttonData, index);
            })}
        </View>
    );
};

RadioButton.defaultProps = {
    buttonDirection: 'row',
    data: [],
    selectedIndex: 0,
};

const styles = StyleSheet.create({
    buttonStyle: {
        width: 31,
        height: 31,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgb(222, 212, 248)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 13,
    },
});

export default RadioButton;
