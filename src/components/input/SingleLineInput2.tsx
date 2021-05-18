import React, { useContext, useEffect, useState } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Input, InputProps } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import globalStyle from '~/styles/global';

interface TextInputComponentProps extends InputProps {
    // eslint-disable-next-line react/require-default-props
    placeholderText: string;
    searchValue: string;
    subComponent?: any;
    koreanInput?: boolean;
    borderColor?: string;
    textDisable?: boolean;
}

const styles = StyleSheet.create({
    contents: {
        backgroundColor: 'rgb(252, 251, 255)',
        borderColor: 'rgb(112, 58, 222)',
        borderRadius: 25,
        borderWidth: 2,
        flexDirection: 'row',
        height: 52,
        alignItems: 'center',
        paddingLeft: 10,
    },
    input: {
        fontFamily: 'NotoSansCJKkrBold',
        color: 'rgb(112, 58, 222)',
        fontSize: 14,
    },
    inputContainerStyle: {
        borderBottomWidth: 0,
    },
});

/*
<TextInput
    onChangeText={(text) => {
        console.log('changeText', text);
    }}
    koreanInput
    subComponent={<Icon onPress={console.log} name="cancel" color="rgb(112, 58, 222)" size={28} />}
/>
*/

const TextInputComponent = (props: TextInputComponentProps) => {
    const themeContext = useContext(ThemeContext);
    const {
        inputStyle,
        inputContainerStyle,
        labelStyle,
        placeholderTextColor,
        placeholderText,
        searchValue,
        onChangeText,
        koreanInput,
        style,
        subComponent,
        borderColor = themeContext.color.primary,
        textDisable = false,
        ...otherProps
    } = props;
    // const [isFocused, setIsFocused] = useState(false);
    const [changed, setChanged] = useState(false);
    const [value, setValue] = useState<string>('');

    useEffect(() => {
        if (searchValue) {
            setChanged(true);
            setValue(searchValue);
        }
    }, [searchValue]);

    if (Platform.OS === 'ios' && !!koreanInput) {
        if (changed) delete otherProps.value;
        return (
            <View style={{ ...styles.contents, borderColor }}>
                <Input
                    {...otherProps}
                    value={searchValue.length === 0 ? '' : value}
                    disabled={textDisable}
                    disabledInputStyle={{ color: themeContext.color.primary, opacity: 1 }}
                    onChangeText={(text) => {
                        setChanged(true);
                        if (onChangeText) {
                            onChangeText(text);
                            setValue(text);
                        }
                        if (text.length === 0) {
                            setChanged(false);
                            setValue('');
                        }
                    }}
                    renderErrorMessage={false}
                    allowFontScaling={false}
                    autoCorrect={false}
                    autoCapitalize="none"
                    inputStyle={[styles.input, inputStyle]}
                    inputContainerStyle={[styles.inputContainerStyle]}
                    placeholderTextColor="rgb(112, 58, 222)"
                    placeholder={placeholderText}
                    rightIcon={() => {
                        return changed && subComponent;
                    }}
                />
            </View>
        );
    }
    return (
        <View style={[styles.contents, style]}>
            <Input
                {...otherProps}
                onChangeText={onChangeText}
                disabled={textDisable}
                disabledInputStyle={{ color: themeContext.color.primary }}
                renderErrorMessage={false}
                allowFontScaling={false}
                autoCorrect={false}
                autoCapitalize="none"
                inputStyle={[styles.input, inputStyle]}
                inputContainerStyle={[styles.inputContainerStyle]}
                labelStyle={[globalStyle.inputLabel, labelStyle]}
                placeholder={placeholderText}
                placeholderTextColor="rgb(112, 58, 222)"
                selectionColor={themeContext.color.primary}
                rightIcon={subComponent}
            />
        </View>
    );
};

export default TextInputComponent;
