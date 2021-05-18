/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { Button, Icon, Text } from 'react-native-elements';
import moment from 'moment';

import globalStyle from '~/styles/global';

import StatusBar from '../status/StatusBar';
import Period from '../status/Period';
import { ComponentCommonPeriod, Enum_Proposal_Type } from '~/graphql/generated/generated';
import { Enum_Extended_Proposal_Status } from '~/types/proposalType';
import getString from '~/utils/locales/STRINGS';

const btnImage = require('@assets/icons/arrow/arrowGrad.png');

interface ProposalCardProps {
    title: string;
    description: string;
    type: Enum_Proposal_Type;
    status: Enum_Extended_Proposal_Status;
    assessPeriod?: ComponentCommonPeriod;
    votePeriod?: ComponentCommonPeriod;
    onPress: () => void;
    onDelete?: () => void;
    isTempCard?: boolean;
    savedTime?: number;
}

const styles = StyleSheet.create({
    contents: {
        paddingVertical: 33,
        borderBottomWidth: 1,
        borderBottomColor: 'rgb(235, 234, 239)',
        // paddingHorizontal: 22,
    },
    // dividers: { backgroundColor: , marginTop: 34 },
    fontDescriptions: { fontSize: 13, paddingRight: 65 },
    fontTitles: { fontSize: 14, paddingBottom: 7, color: 'black' },
    votingPeriodWithBtn: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? 0 : 3,
    },
});

const ProposalCard = (props: ProposalCardProps): any => {
    const { title, description, type, status, assessPeriod, votePeriod, savedTime, onPress } = props;
    return (
        <TouchableOpacity style={styles.contents} onPress={onPress}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <StatusBar type={type} status={status} deadline={votePeriod?.end} />
                {status === 'TEMP' && (
                    <Button
                        icon={<Icon name="clear" />}
                        type="clear"
                        onPress={() => {
                            if (props.onDelete) props.onDelete();
                        }}
                    />
                )}
            </View>
            <View style={{ paddingVertical: Platform.OS === 'android' ? 0 : 13 }}>
                <Text style={[globalStyle.btext, styles.fontTitles]}>{title}</Text>
                <Text numberOfLines={1} style={styles.fontDescriptions}>
                    {description}
                </Text>
                {status === 'TEMP' ? (
                    <View style={{ flexDirection: 'row', marginTop: Platform.OS === 'android' ? 0 : 10 }}>
                        <Text style={[globalStyle.ltext, { fontSize: 10 }]}>{getString('마지막 저장일')}</Text>
                        <Text style={[globalStyle.ltext, { fontSize: 10, marginLeft: 12 }]}>
                            {moment(savedTime).format('lll')}
                        </Text>
                    </View>
                ) : (
                    <View style={{ paddingTop: Platform.OS === 'android' ? 0 : 13 }}>
                        {type === Enum_Proposal_Type.Business && assessPeriod && (
                            <Period
                                type={getString('제안기간')}
                                created={assessPeriod?.begin}
                                deadline={assessPeriod?.end}
                            />
                        )}
                        <View style={styles.votingPeriodWithBtn}>
                            <Period
                                type={getString('투표기간')}
                                created={votePeriod?.begin}
                                deadline={votePeriod?.end}
                            />
                            <Image style={{ marginLeft: 17 }} source={btnImage} />
                        </View>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default ProposalCard;
