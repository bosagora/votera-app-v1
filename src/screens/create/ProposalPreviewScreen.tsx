import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, Image } from 'react-native';
import ReactNativeParallaxHeader from 'react-native-parallax-header';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import { CreateNavProps } from '~/navigation/types/CreateStackParams';
import { Button, Text } from 'react-native-elements';
import globalStyle from '~/styles/global';
import { Enum_Proposal_Status, Enum_Proposal_Type } from '~/graphql/generated/generated';
import Period from '~/components/status/Period';
import DdayMark from '~/components/status/DdayMark';
import styles, { HEADER_HEIGHT } from '../proposal/styles';
import ProposalContent from '../proposal/ProposalContent';

const ProposalPreviewScreen = ({ navigation, route }: CreateNavProps<'ProposalPreview'>) => {
    const scroll = useRef(new Animated.Value(0)).current;
    const { fundingAmount, title, description, votePeriod, type, logoImage, mainImage } = route.params;
    const [assessPeriod, setAssessPeriod] = useState<{ begin: Date; end: Date }>();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    useEffect(() => {
        if (type === Enum_Proposal_Type.Business) {
            const today = new Date();
            setAssessPeriod({
                begin: today,
                end: new Date(today.setDate(today.getDate() + 6)),
            });
        }
    }, [type]);

    const titleRender = () => {
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
                        {type === Enum_Proposal_Type.Business ? '사업제안' : '시스템제안'}
                    </Text>
                </Animated.View>
                <Text
                    style={[globalStyle.btext, { color: 'white', fontSize: 20, maxWidth: 220, textAlign: 'center' }]}
                    numberOfLines={3}
                >
                    {title}
                </Text>
                <Animated.View style={{ alignItems: 'center', opacity }}>
                    {assessPeriod?.begin && assessPeriod.end && (
                        <Period
                            type="제안기간"
                            typeStyle={{ fontSize: 14 }}
                            periodStyle={{ fontSize: 13 }}
                            color="white"
                            created={assessPeriod?.begin}
                            deadline={assessPeriod?.end}
                        />
                    )}

                    {votePeriod?.begin && votePeriod.end && (
                        <Period
                            type="투표기간"
                            typeStyle={{ fontSize: 14 }}
                            periodStyle={{ fontSize: 13 }}
                            color="white"
                            created={votePeriod?.begin}
                            deadline={votePeriod?.end}
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

                    <DdayMark color="white" deadline={votePeriod?.end} type={type} />
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
                title={titleRender()}
                backgroundImage={require('@assets/images/header/proposalBg.png')}
                backgroundImageScale={1.2}
                renderNavBar={renderNavBar}
                renderContent={() => (
                    <ProposalContent
                        isPreview
                        previewData={{
                            name: title,
                            description,
                            type,
                            status: Enum_Proposal_Type.Business
                                ? Enum_Proposal_Status.PendingVote
                                : Enum_Proposal_Status.PendingAssess,
                            fundingAmount,
                            logo: (logoImage && !logoImage.cancelled) ? { url: logoImage.uri } : undefined,
                            votePeriod: {
                                begin: votePeriod?.begin,
                                end: votePeriod?.end,
                            },
                        }}
                    />
                )}
                scrollViewProps={{
                    onScroll: Animated.event([{ nativeEvent: { contentOffset: { y: scroll } } }], {
                        useNativeDriver: false,
                    }),
                }}
            />
        </>
    );
};

export default ProposalPreviewScreen;
