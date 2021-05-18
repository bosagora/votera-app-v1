import moment from 'moment';
import React, { useContext } from 'react';
import { View, Image } from 'react-native';
// import { GBText, BText, RLText } from '~/components/text';
import { ThemeContext } from 'styled-components/native';
import globalStyle from '~/styles/global';
import { Icon, Text } from 'react-native-elements';
import { VOTE_SELECT } from '~/utils/voterautil';

interface Props {
    type: VOTE_SELECT;
    name: string;
    time: number;
}

const VoteHistoryComponent = (props: Props) => {
    const { type, name } = props;
    const themeContext = useContext(ThemeContext);

    const color =
        type === VOTE_SELECT.YES
            ? themeContext.color.agree
            : VOTE_SELECT.NO
            ? themeContext.color.disagree
            : themeContext.color.abstain;

    const agreeMark = () => (
        <View
            style={{ borderWidth: 1, borderColor: themeContext.color.agree, width: 12, height: 12, borderRadius: 6 }}
        />
    );

    console.log('type : ', type);

    const renderMark = () => {
        switch (type) {
            case VOTE_SELECT.YES:
                return agreeMark();
            case VOTE_SELECT.NO:
                return <Icon name="close" color={themeContext.color.disagree} />;
            case VOTE_SELECT.BLANK:
                return (
                    <Image
                        style={{ tintColor: themeContext.color.abstain }}
                        source={require('@assets/images/vote/abstain.png')}
                    />
                );
        }
    };

    return (
        <View style={{ borderBottomWidth: 1, borderBottomColor: 'rgb(235,234,239)', paddingVertical: 30 }}>
            <View style={globalStyle.flexRowBetween}>
                <Text style={globalStyle.gbtext}>{name}</Text>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {renderMark()}
                    <Text style={[globalStyle.btext, { marginLeft: 8, color }]}>
                        {props.type === VOTE_SELECT.YES ? '찬성' : props.type === VOTE_SELECT.NO ? '반대' : '기권'}
                    </Text>
                </View>
            </View>
            <Text style={[globalStyle.rltext, { fontSize: 12 }]}>{moment(new Date(props.time)).format('lll')}</Text>
        </View>
    );
};

export default VoteHistoryComponent;
