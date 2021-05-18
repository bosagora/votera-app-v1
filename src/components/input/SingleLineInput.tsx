import React, { useContext, useState } from 'react';
import { Platform, View } from 'react-native';
import { Input, InputProps } from 'react-native-elements';
import styled, { ThemeContext } from 'styled-components/native';
import globalStyle from '~/styles/global';

interface TextInputComponentProps extends InputProps {
    // eslint-disable-next-line react/require-default-props
    subComponent?: any;
    koreanInput?: boolean;
}

/*
<TextInput
    onChangeText={(text) => {
        console.log('changeText', text);
    }}
    koreanInput
    subComponent={<NSText style={{}}>text</NSText>}
/>
<TextInput
    onChangeText={(text) => {
        console.log('changeText', text);
    }}
    koreanInput
    subComponent={<Icon onPress={console.log} name="add-circle" color="rgb(112, 58, 222)" size={28} />}
/>
*/

const Container = styled.View`
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background-color: rgb(252, 251, 255);
    height: 52px;
    border-width: 2px;
    border-color: rgb(235, 234, 239);
    border-radius: 5px;
`;

const TextInputComponent = (props: TextInputComponentProps) => {
    const themeContext = useContext(ThemeContext);
    const {
        inputStyle,
        inputContainerStyle,
        labelStyle,
        placeholderTextColor,
        onChangeText,
        koreanInput,
        style,
        subComponent,
        ...otherProps
    } = props;
    // const [isFocused, setIsFocused] = useState(false);
    const [changed, setChanged] = useState(false);

    if (Platform.OS === 'ios' && !!koreanInput) {
        if (changed) delete otherProps.value;
        return (
            <Container>
                <Input
                    {...otherProps}
                    onChangeText={(text) => {
                        setChanged(true);
                        if (onChangeText) onChangeText(text);
                    }}
                    renderErrorMessage={false}
                    allowFontScaling={false}
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={{ paddingHorizontal: 5 }}
                    inputStyle={[
                        {
                            fontSize: 14,
                            lineHeight: 18,
                            fontFamily: 'NotoSansCJKkrRegular',
                        },
                    ]}
                    inputContainerStyle={[{ borderBottomWidth: 0 }]}
                    placeholderTextColor={placeholderTextColor}
                    rightIcon={subComponent && subComponent}
                />
            </Container>
        );
    }
    return (
        <Container>
            <Input
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                onChangeText={onChangeText}
                renderErrorMessage={false}
                allowFontScaling={false}
                autoCorrect={false}
                autoCapitalize="none"
                // style={Platform.OS === 'web' ? { outline: 'none' } : {}} // 이 부분 때문에 빨간줄이 뜨는데, 작동은 됨 // 웹에서 Input 클릭했을때 border 안생기는 기능
                inputStyle={[
                    {
                        fontSize: 14,
                        lineHeight: 18,
                        fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'NotoSansCJKkrRegular',
                    },
                    inputStyle,
                ]}
                inputContainerStyle={[{ borderBottomWidth: 0 }, inputContainerStyle]}
                labelStyle={[globalStyle.inputLabel, labelStyle]}
                placeholderTextColor={placeholderTextColor || themeContext.color.textGray}
                selectionColor={themeContext.color.primary}
                rightIcon={subComponent && subComponent}
            />
        </Container>
    );
};

export default TextInputComponent;
