/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useContext } from 'react';
import { Icon, Button } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import getString from '~/utils/locales/STRINGS';

interface CommentButtonProps {
    onPress: any;
    commentCount?: number;
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
const CommentButton = (props: CommentButtonProps): JSX.Element => {
    const { onPress, commentCount } = props;
    const themeContext = useContext(ThemeContext);

    return (
        <Button
            title={
                commentCount
                    ? `${getString('답글 N').replace('N', commentCount.toString() || '0')}`
                    : getString('답글작성')
            }
            titleStyle={{ fontSize: 10, fontFamily: 'NotoSansCJKkrBold' }}
            buttonStyle={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderColor: themeContext.color.boxBorder,
                borderWidth: 1,
                borderRadius: 6,
                marginRight: 10,
                height: 25,
            }}
            onPress={onPress}
            iconRight
            type="outline"
            icon={<Icon name="keyboard-arrow-down" color={themeContext.color.primary} size={10} />}
        />
    );
};

export default CommentButton;
