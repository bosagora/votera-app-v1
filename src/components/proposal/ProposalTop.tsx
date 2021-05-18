/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ImageBackground, Dimensions, Platform } from 'react-native';
import { Text } from 'react-native-elements';

import globalStyle from '~/styles/global';

import Period from '../status/Period';
import StatusMark from '../status/StatusMark';
import DdayMark from '../status/DdayMark';
import { ComponentCommonPeriod, Enum_Proposal_Type } from '~/graphql/generated/generated';
import getString from '~/utils/locales/STRINGS';

interface ProposalTopProps {
    title: string;
    description: string;
    type: Enum_Proposal_Type;
    status: string;
    assessPeriod?: ComponentCommonPeriod;
    votePeriod?: ComponentCommonPeriod;
    topImage: any;
    onPress: () => void;
}

/*
<ProposalCard
    title="제안 제목을 넣어주세요. 1"
    description="제안설명을 넣어주세요. 1"
    type="BUSINESS"
    status="VOTING"
    created={new Date()}
    deadline={new Date()}
/>
<ProposalCard
    title="제안 제목을 넣어주세요. 1"
    description="제안설명을 넣어주세요. 1"
    type="SYSTEM"
    status="ASSESS"
    created={new Date()}
    deadline={new Date()}
/>
<ProposalCard
    title="제안 제목을 넣어주세요. 1"
    description="제안설명을 넣어주세요. 1"
    type="SYSTEM"
    status="ASSESS"
    created={new Date()}
    deadline={new Date()}
/>
*/

const styles = StyleSheet.create({
    imageBackground: {
        paddingHorizontal: 23,
        paddingVertical: 23,
        width: 'auto',
    },
    contents: {
        paddingVertical: 20,
        flexDirection: 'column',
        borderBottomColor: 'rgb(235, 234, 239)',
        paddingHorizontal: 22,
        backgroundColor: 'white',
    },
    fontDescriptions: { color: 'white', fontSize: 13, paddingRight: 65 },
    fontTitles: { color: 'white', fontSize: 14, paddingBottom: 7 },
    votingPeriodWithBtn: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? 0 : 3,
    },
    writeButton: {
        alignItems: 'center',
        backgroundColor: 'rgb(112, 58, 222)',
        borderRadius: 21.5,
        bottom: 0,
        height: 43,
        justifyContent: 'center',
        width: 43,
    },
    writeContent: {
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        left: 0,
        paddingHorizontal: 23,
        position: 'absolute',
        right: 18,
    },
});

function nextBtnComponent(onPress: () => void) {
    return (
        <View style={styles.writeContent}>
            <TouchableOpacity
                style={styles.writeButton}
                onPress={() => {
                    onPress();
                }}
            >
                <Image style={{ bottom: 1, left: 1 }} source={require('@assets/icons/arrow/rightArrowWhite.png')} />
            </TouchableOpacity>
        </View>
    );
}
const ProposalTop = (props: ProposalTopProps): any => {
    const { title, description, type, assessPeriod, votePeriod, topImage, onPress } = props;
    return (
        <View style={{ ...styles.contents }}>
            <ImageBackground
                source={topImage}
                style={styles.imageBackground}
                imageStyle={{ borderRadius: 14 }}
                resizeMode="cover"
            >
                {/* <TouchableOpacity style={styles.contents}> */}

                <View style={{ alignItems: 'flex-end' }}>
                    <DdayMark color="white" deadline={votePeriod?.end} type={type} />
                </View>
                <View style={globalStyle.flexRowBetween}>
                    <View style={globalStyle.flexRowAlignCenter}>
                        <StatusMark type={type} transparent={true} />
                    </View>
                </View>
                <View style={{ paddingVertical: Platform.OS === 'android' ? 0 : 13 }}>
                    <Text style={[globalStyle.btext, styles.fontTitles, { paddingBottom: 0 }]}>{title}</Text>
                    <Text numberOfLines={1} style={styles.fontDescriptions}>
                        {description}
                    </Text>
                    <View style={{ paddingTop: Platform.OS === 'android' ? 0 : 13 }}>
                        {type === Enum_Proposal_Type.Business && (
                            <Period
                                type={getString('제안기간')}
                                created={assessPeriod?.begin}
                                deadline={votePeriod?.end}
                                color="white"
                            />
                        )}
                        <View style={styles.votingPeriodWithBtn}>
                            <Period
                                type={getString('투표기간')}
                                created={votePeriod?.begin}
                                deadline={votePeriod?.end}
                                color="white"
                            />
                        </View>
                    </View>
                </View>
            </ImageBackground>
            {nextBtnComponent(onPress)}
        </View>
    );
};

export default ProposalTop;
