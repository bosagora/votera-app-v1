import React from 'react';
import { View } from 'react-native';
import getString from '~/utils/locales/STRINGS';
import { VOTE_SELECT } from '~/utils/voterautil';
import VoteItem from './VoteItem';

const VoteItemGroup = (props: any) => {
    return (
        <View
            style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-around',
                marginTop: 59,
            }}
        >
            <VoteItem
                text={getString('찬성')}
                type={VOTE_SELECT.YES}
                onPress={props.onPress}
                isSelect={props.vote === VOTE_SELECT.YES}
            />
            <VoteItem
                text={getString('반대')}
                type={VOTE_SELECT.NO}
                onPress={props.onPress}
                isSelect={props.vote === VOTE_SELECT.NO}
            />
            <VoteItem
                text={getString('기권')}
                type={VOTE_SELECT.BLANK}
                onPress={props.onPress}
                isSelect={props.vote === VOTE_SELECT.BLANK}
            />
        </View>
    );
};

export default VoteItemGroup;
