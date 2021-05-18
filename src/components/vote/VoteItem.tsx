import React, { useContext } from 'react';
import { View, Image } from 'react-native';
import { Icon, Text } from 'react-native-elements';
import styled, { ThemeContext } from 'styled-components/native';
import globalStyle from '~/styles/global';
import { VOTE_SELECT } from '~/utils/voterautil';

interface VoteItemProps {
    text: string;
    type: VOTE_SELECT | undefined;
    isSelect: boolean;
    onPress: (type: VOTE_SELECT) => void;
}

export const getVoteString = (select?: VOTE_SELECT | undefined) =>
    select === VOTE_SELECT.YES ? 'agree' : select === VOTE_SELECT.NO ? 'disagree' : 'abstain';

const ItemContainer = styled.TouchableOpacity`
    width: 80px;
    height: 79px;
    border-radius: 40px;
    border-color: ${(props) => props.theme.color.disabled};
    justify-content: center;
    align-items: center;
    ${(props: any) => {
        return {
            backgroundColor: props.isSelect
                ? props.type === VOTE_SELECT.YES
                    ? props.theme.color.agree
                    : props.type === VOTE_SELECT.NO
                    ? props.theme.color.disagree
                    : props.theme.color.abstain
                : 'white',
            borderWidth: props.isSelect ? 0 : 2,
        };
    }}
`;

const VoteItem: React.FC<VoteItemProps> = (props) => {
    const { type, isSelect, text } = props;
    const themeContext = useContext(ThemeContext);
    const tintColor = props.isSelect ? 'white' : themeContext.color.disabled;
    const icon =
        props.type === VOTE_SELECT.YES ? (
            <View style={{ width: 17, height: 17, borderRadius: 9, borderWidth: 2, borderColor: tintColor }} />
        ) : props.type === VOTE_SELECT.NO ? (
            <Icon name="close" color={tintColor} />
        ) : (
            <Image style={{ tintColor }} source={require('@assets/images/vote/abstain.png')} />
        );

    return (
        <ItemContainer onPress={() => props.onPress(type)} isSelect={isSelect} type={type}>
            {icon}
            <Text style={[globalStyle.btext, { color: tintColor, marginTop: 2 }]}>{text}</Text>
        </ItemContainer>
    );
};

export default VoteItem;
