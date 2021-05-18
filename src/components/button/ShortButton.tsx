import React, { useContext } from 'react';
import { Button, ButtonProps } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';

interface Props extends ButtonProps {
    filled?: boolean;
}

const ShortButton = (props: Props) => {
    const { filled } = props;
    const themeContext = useContext(ThemeContext);
    return (
        <Button
            {...props}
            buttonStyle={[
                {
                    width: 83,
                    borderRadius: 5,
                    backgroundColor: filled ? themeContext.color.primary : 'white',
                    borderWidth: 1,
                    borderColor: themeContext.color.primary,
                },
                props.buttonStyle,
            ]}
            titleStyle={[
                { fontSize: 15, fontFamily: 'NotoSansCJKkrBold', color: filled ? 'white' : themeContext.color.primary },
                props.titleStyle,
            ]}
        />
    );
};

export default ShortButton;
