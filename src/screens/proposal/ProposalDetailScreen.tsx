import React, { useContext, useEffect, useRef, useState } from 'react';
import { MainNavProps } from '~/navigation/types/MainStackParams';
import { View, Animated, Image } from 'react-native';
import { Button, Text } from 'react-native-elements';
import ReactNativeParallaxHeader from 'react-native-parallax-header';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import globalStyle from '~/styles/global';
import Period from '~/components/status/Period';
import PeriodBlock from '~/components/status/PeriodBlock';
import PeriodTime from '~/components/status/PeriodTime';
import DdayMark from '~/components/status/DdayMark';
import ProposalContent from './ProposalContent';
import { Enum_Proposal_Type, Enum_Proposal_Status } from '~/graphql/generated/generated';
import styles, { HEADER_HEIGHT } from './styles';
import { ProposalContext } from '~/contexts/ProposalContext';
import { useIsFocused } from '@react-navigation/core';
import getString from '~/utils/locales/STRINGS';

const ProposalDetailScreen = ({ navigation, route }: MainNavProps<'ProposalDetail'>) => {
    const scroll = useRef(new Animated.Value(0)).current;
    const isFocused = useIsFocused();

    const [discussionAId, setDiscussionAId] = useState('');
    const [noticeAId, setNoticeAId] = useState('');

    const { proposal, estimatedPeriod } = useContext(ProposalContext);

    useEffect(() => {
        if (proposal) {
            proposal.activities?.forEach((activity) => {
                const boardType = activity?.name.split('_').pop();
                if (!activity || !activity?.id) return;

                if (boardType === 'DISCUSSION') {
                    setDiscussionAId(activity?.id);
                } else if (boardType === 'NOTICE') {
                    setNoticeAId(activity.id);
                }
            });            
        }
    }, [proposal]);

    const title = () => {
        const opacity = scroll.interpolate({
            inputRange: [-20, 0, 250 - HEADER_HEIGHT],
            outputRange: [1, 1, 0],
            extrapolate: 'clamp',
        });
        return (
            <View style={{ justifyContent: 'space-around', flex: 1 }}>
                <Animated.View
                    style={{
                        borderWidth: 1,
                        borderColor: 'white',
                        borderRadius: 6,
                        alignSelf: 'center',
                        paddingHorizontal: 7,
                        paddingVertical: 5,
                        opacity,
                    }}
                >
                    <Text style={[globalStyle.mtext, { fontSize: 11, color: 'white' }]}>
                        {proposal?.type === Enum_Proposal_Type.Business
                            ? getString('사업제안')
                            : getString('시스템제안')}
                    </Text>
                </Animated.View>
                <Text
                    style={[globalStyle.btext, { color: 'white', fontSize: 20, maxWidth: 220, textAlign: 'center' }]}
                    numberOfLines={3}
                >
                    {proposal?.name}
                </Text>
                <Animated.View style={{ alignItems: 'center', opacity }}>
                    {proposal?.type === Enum_Proposal_Type.Business && (
                        <Period
                            type={getString('제안기간')}
                            typeStyle={{ fontSize: 14 }}
                            periodStyle={{ fontSize: 13 }}
                            color="white"
                            created={proposal?.assessPeriod?.begin}
                            deadline={proposal?.assessPeriod?.end}
                        />
                    )}

                    <PeriodBlock
                        type={getString('유효 투표 블록')}
                        typeStyle={{ fontSize: 14 }}
                        periodStyle={{ fontSize: 13 }}
                        color="white"
                        start={proposal?.vote_start_height}
                        end={proposal?.vote_end_height}
                    />

                    {estimatedPeriod && (
                        <PeriodTime
                            type={proposal?.status === Enum_Proposal_Status.Closed ? getString('투표 기간') : getString('예상 투표 기간')}
                            typeStyle={{ fontSize: 14 }}
                            periodStyle={{ fontSize: 13 }}
                            color="white"
                            created={estimatedPeriod.begin}
                            deadline={estimatedPeriod.end}
                        />
                    )}
                </Animated.View>
            </View>
        );
    };

    const renderNavBar = () => {
        const offset = scroll.interpolate({
            inputRange: [-20, 0, 250 - HEADER_HEIGHT],
            outputRange: [0, 0, -5],
            extrapolate: 'clamp',
        });
        return (
            <Animated.View style={{ paddingHorizontal: 20, marginTop: offset }}>
                <View style={styles.statusBar} />
                <View style={styles.navBar}>
                    <Button
                        onPress={() => navigation.goBack()}
                        icon={<Image source={require('@assets/icons/header/arrowWhiteBack.png')} />}
                        type="clear"
                    />

                    <DdayMark color="white" deadline={estimatedPeriod ? estimatedPeriod.end : proposal?.votePeriod?.end} type={proposal?.type} />
                </View>
            </Animated.View>
        );
    };

    return (
        <>
            <FocusAwareStatusBar barStyle="light-content" />
            <ReactNativeParallaxHeader
                headerMinHeight={HEADER_HEIGHT}
                headerMaxHeight={250}
                extraScrollHeight={20}
                title={title()}
                backgroundImage={require('@assets/images/header/proposalBg.png')}
                backgroundImageScale={1.2}
                renderNavBar={renderNavBar}
                renderContent={() =>
                    proposal && <ProposalContent discussionAId={discussionAId} noticeAId={noticeAId} />
                }
                scrollViewProps={{
                    onScroll: Animated.event([{ nativeEvent: { contentOffset: { y: scroll } } }], {
                        useNativeDriver: false,
                    }),
                }}
            />
        </>
    );
};

export default ProposalDetailScreen;
