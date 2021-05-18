import React, { useContext, useState } from 'react';
import { Platform, StyleSheet, View, Image, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Input, InputProps, Text } from 'react-native-elements';

import { ThemeContext } from 'styled-components/native';

interface TextInputComponentProps extends InputProps {
    // eslint-disable-next-line react/require-default-props
    onlyRead: boolean;
    onPress: () => void;
    componentStyle?: StyleProp<ViewStyle>;
}
const writeIcon = require('@assets/icons/penIconSvg.png');
/*
 <View style={{ backgroundColor: 'white' }}>
    <MultiInputBox
        onChangeText={(text) => {
            console.log('이 콜백으로 데이터가 입력됩니다.', text);
        }}
        onlyRead={false}
        showText="onlyRead=true 읽기 전용 텍스트"
    />
</View>
*/
const styles = StyleSheet.create({
    inputContent: {
        backgroundColor: 'rgb(242, 244, 250)',
        borderRadius: 20,
        height: 128,
        marginBottom: 21.5,
        paddingHorizontal: 23,
        paddingVertical: 20, // onlyRead:false
    },
    inputStyle: {
        fontSize: 13,
        lineHeight: 21,
        padding: 0,
        fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'NotoSansCJKkrRegular',
    },
    writeButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgb(112, 58, 222)',
        borderRadius: 21.5,
        bottom: 0,
        height: 43,
        width: 43,
        shadowOffset: {
            height: 10,
            width: 0,
        },
        shadowColor: 'rgb(120,100,176)',
        shadowOpacity: 0.29,
    },
    writeContent: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 23,
    },
});

const MultilineInput = (props: TextInputComponentProps) => {
    const themeContext = useContext(ThemeContext);
    const {
        componentStyle,
        inputStyle,
        inputContainerStyle,
        placeholderTextColor,
        onChangeText,
        onlyRead,
        onPress,
        ...otherProps
    } = props;

    function writeBtnComponent() {
        return (
            <View style={styles.writeContent}>
                <Text style={{ fontSize: 10 }}>{`${props.value?.length}/300`}</Text>
                <TouchableOpacity style={styles.writeButton} onPress={onPress}>
                    <Image style={{ bottom: 1, left: 1 }} source={writeIcon} />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={componentStyle}>
            <View style={styles.inputContent}>
                <Input
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherProps}
                    onChangeText={(text) => {
                        if (onChangeText) onChangeText(text);
                    }}
                    disabled={onlyRead}
                    multiline
                    renderErrorMessage={false}
                    allowFontScaling={false}
                    autoCorrect={false}
                    autoCapitalize="none"
                    // style={{ minHeight: 0, paddingTop: 0 }}
                    // containerStyle={{ paddingHorizontal: 0, paddingVertical: 0 }}
                    inputStyle={[styles.inputStyle, inputStyle]}
                    inputContainerStyle={[{ borderBottomWidth: 0 }, inputContainerStyle]}
                    placeholderTextColor={placeholderTextColor ? placeholderTextColor : themeContext.color.primary}
                    selectionColor={themeContext.color.primary}
                />
            </View>
            {!onlyRead && writeBtnComponent()}
        </View>
    );
};

export default MultilineInput;
