import React, { useContext, useEffect, useState } from 'react';
import { View, Image, ScrollView, Switch } from 'react-native';
import { Button, Text } from 'react-native-elements';
import * as Application from 'expo-application';
import { MainDrawerProps } from '~/navigation/types/MainDrawerParams';
import globalStyle from '~/styles/global';
import LocalStorage, { LocalStorageFeedProps } from '~/utils/LocalStorage';
import { ThemeContext } from 'styled-components/native';
import { useUpdateTargetsFollowMutation } from '~/graphql/generated/generated';
import { FeedStatusType } from '~/types/alarmType';
import { getAppUpdate } from '~/utils/device';
import { AuthContext } from '~/contexts/AuthContext';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import getString from '~/utils/locales/STRINGS';

const Alarm = ({ navigation, route }: MainDrawerProps<'Alarm'>): JSX.Element => {
    const themeContext = useContext(ThemeContext);
    const { feedAddress, isGuest } = useContext(AuthContext);

    const [feedStatus, setFeedStatus] = useState<LocalStorageFeedProps>();
    const [updateTargetsFollow] = useUpdateTargetsFollowMutation();

    function updateFeedLocalStorage(renewLocalStorageFeedProps: LocalStorageFeedProps) {
        LocalStorage.get().then((localData) => {
            localData.feed = renewLocalStorageFeedProps;
            LocalStorage.set(localData);
            setFeedStatus(localData.feed);
        });
    }

    function updateFollows({ targets, value }: { targets: string[]; value: boolean }) {
        updateTargetsFollow({
            variables: {
                input: {
                    member: feedAddress,
                    targets,
                    isActive: value,
                },
            },
        }).catch(console.log);
    }
    // TODO: 각 타입별 타겟(proposalId 등)을 추출하는 로직(or 쿼리)가 필요
    function getTargets(type: FeedStatusType): string[] {
        let targets: string[] = [];
        switch (type) {
            case FeedStatusType.MY_PROPOSALS_NEWS:
                targets = ['proposal1'];
                break;
            case FeedStatusType.LIKE_PROPOSALS_NEWS:
                targets = ['proposal2'];
                break;
            case FeedStatusType.NEW_PROPOSAL_NEWS:
                targets = ['proposal3'];
                break;
            case FeedStatusType.ETC_NEWS:
                targets = ['proposal4'];
                break;
            default:
                break;
        }
        return targets;
    }

    useEffect(() => {
        LocalStorage.get().then((localData) => {
            let currentFeedStatus: LocalStorageFeedProps = localData.feed;
            if (!currentFeedStatus) {
                currentFeedStatus = {
                    isEtcNews: true,
                    isLikeProposalsNews: true,
                    isMyProposalsNews: true,
                    isNewProposalNews: true,
                };
                localData.feed = currentFeedStatus;
                LocalStorage.set(localData);
            }
            setFeedStatus(currentFeedStatus);
        });
    }, []);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitleAlign: 'center',
            headerTitle: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={globalStyle.headerTitle}>{getString('알람수신 설정')}</Text>
                </View>
            ),
            headerLeft: () => (
                <Button
                    onPress={() => navigation.goBack()}
                    icon={<Image source={require('@assets/icons/arrow/backArrowBlack.png')} />}
                    type="clear"
                />
            ),
        });
    }, [navigation]);

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor="white" />
            <ScrollView
                contentContainerStyle={{ paddingVertical: 50 }}
                style={{ paddingHorizontal: 22, paddingTop: 0 }}
            >
                <View>
                    <Text style={{ fontSize: 13, color: themeContext.color.textBlack }}>{getAppUpdate()}</Text>
                    <Text
                        style={{
                            fontSize: 14,
                            marginTop: 8.5,
                            fontFamily: 'GmarketSansTTFBold',
                            color: themeContext.color.primary,
                        }}
                    >
                        Ver {Application.nativeApplicationVersion}
                    </Text>
                </View>
                <View style={{ marginTop: 60 }}>
                    <View style={[globalStyle.flexRowBetween, { height: 40 }]}>
                        <Text style={{ fontSize: 13 }}>{getString('작성한 제안에 대한 소식')}</Text>
                        <Switch
                            style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                            trackColor={{ true: themeContext.color.primary, false: themeContext.color.black }}
                            disabled={isGuest}
                            value={feedStatus?.isMyProposalsNews}
                            onValueChange={(value) => {
                                let currentFeedStatus = feedStatus as LocalStorageFeedProps;
                                currentFeedStatus.isMyProposalsNews = value;
                                updateFeedLocalStorage(currentFeedStatus);
                                const targets = getTargets(FeedStatusType.MY_PROPOSALS_NEWS);
                                updateFollows({ targets, value });
                            }}
                            thumbColor={'white'}
                        />
                    </View>
                    <View style={[globalStyle.flexRowBetween, { height: 40 }]}>
                        <Text style={{ fontSize: 13 }}>{getString('관심 제안에 대한 신규 소식')}</Text>
                        <Switch
                            style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                            trackColor={{ true: themeContext.color.primary, false: themeContext.color.black }}
                            disabled={isGuest}
                            value={feedStatus?.isLikeProposalsNews}
                            onValueChange={(value) => {
                                let currentFeedStatus = feedStatus as LocalStorageFeedProps;
                                currentFeedStatus.isLikeProposalsNews = value;
                                updateFeedLocalStorage(currentFeedStatus);
                                const targets = getTargets(FeedStatusType.LIKE_PROPOSALS_NEWS);
                                updateFollows({ targets, value });
                            }}
                            thumbColor={'white'}
                        />
                    </View>
                    <View style={[globalStyle.flexRowBetween, { height: 40 }]}>
                        <Text style={{ fontSize: 13 }}>{getString('신규 제안 등록 소식')}</Text>
                        <Switch
                            style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                            trackColor={{ true: themeContext.color.primary, false: themeContext.color.black }}
                            disabled={isGuest}
                            value={feedStatus?.isNewProposalNews}
                            onValueChange={(value) => {
                                let currentFeedStatus = feedStatus as LocalStorageFeedProps;
                                currentFeedStatus.isNewProposalNews = value;
                                updateFeedLocalStorage(currentFeedStatus);
                                const targets = getTargets(FeedStatusType.NEW_PROPOSAL_NEWS);
                                updateFollows({ targets, value });
                            }}
                            thumbColor={'white'}
                        />
                    </View>
                    <View style={[globalStyle.flexRowBetween, { height: 40 }]}>
                        <Text style={{ fontSize: 13 }}>{getString('기타 소식')}</Text>
                        <Switch
                            style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                            trackColor={{ true: themeContext.color.primary, false: themeContext.color.black }}
                            disabled={isGuest}
                            value={feedStatus?.isEtcNews}
                            onValueChange={(value) => {
                                let currentFeedStatus = feedStatus as LocalStorageFeedProps;
                                currentFeedStatus.isEtcNews = value;
                                updateFeedLocalStorage(currentFeedStatus);
                                const targets = getTargets(FeedStatusType.ETC_NEWS);
                                updateFollows({ targets, value });
                            }}
                            thumbColor={'white'}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default Alarm;
