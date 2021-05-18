/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useContext } from 'react';
import { Image } from 'react-native';
import { ButtonProps, Text } from 'react-native-elements';
import { Button } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
interface HeaderProps extends ButtonProps {
    onPress: () => void;
    likeCount: number;
    isLiked: boolean;
}
/*
<CommentButton
    type="WRITE"
    onPress={() => {
        console.log('click Comment Write Button!');
    }}
/>
<CommentButton
    type="COUNT"
    onPress={() => {
        console.log('click Comment Count Button!');
    }}
    commentCount={3}
/>
*/
const likeIcon = require('@assets/icons/comment/likeIcon.png');

const CommentLikeButton = (props: HeaderProps): any => {
    const { onPress, likeCount, isLiked, ...otherProps } = props;
    const themeContext = useContext(ThemeContext);

    return (
        <Button
            {...otherProps}
            onPress={onPress}
            icon={<Image source={likeIcon} />}
            type="outline"
            buttonStyle={[
                {
                    paddingHorizontal: 10,
                    paddingVertical: 5.5,
                    borderColor: isLiked ? themeContext.color.primary : themeContext.color.boxBorder,
                    borderWidth: 1,
                    borderRadius: 6,
                    height: 25,
                },
                otherProps.buttonStyle,
            ]}
            title={likeCount.toString()}
            titleStyle={[
                {
                    fontSize: 10,
                    fontWeight: isLiked ? 'bold' : 'normal',
                    color: isLiked ? themeContext.color.primary : themeContext.color.textBlack,
                    marginLeft: 4,
                },
                otherProps.titleStyle,
            ]}
        />
    );
};

export default CommentLikeButton;
