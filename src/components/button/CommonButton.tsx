import React, { useContext } from 'react';
import { Button, ButtonProps } from 'react-native-elements';
import { Image, View } from 'react-native';
import { ThemeContext } from 'styled-components/native';

interface CommonButtonProps extends ButtonProps {
    filled?: boolean;
    shadow?: boolean;
}

const CommonButton = (props: CommonButtonProps) => {
    const { filled, shadow } = props;
    const themeContext = useContext(ThemeContext);

    return (
        <Button
            {...props}
            containerStyle={[
                {
                    borderRadius: 25,
                },
                props.containerStyle,
            ]}
            buttonStyle={[
                {
                    borderWidth: 2,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: filled ? themeContext.color.primary : 'white',
                    borderColor: filled ? themeContext.color.primary : 'rgb(222,212,248)',
                },
                props.buttonStyle,
            ]}
            titleStyle={[
                {
                    fontSize: 14,
                    fontFamily: 'NotoSansCJKkrBold',
                    fontWeight: 'bold',
                    color: filled ? 'white' : themeContext.color.primary,
                },
                props.titleStyle,
            ]}
            iconRight
            icon={
                props.icon ? (
                    props.icon
                ) : (
                    <Image
                        source={
                            filled
                                ? require('@assets/icons/arrow/rightArrowWhite.png')
                                : require('@assets/icons/arrow/arrowGrad.png')
                        }
                    />
                )
            }
        />
    );
};

export default CommonButton;
