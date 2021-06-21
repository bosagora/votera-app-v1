import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Image, ScrollView, Switch } from 'react-native';
import { useDispatch } from 'react-redux';
import { Button, Text } from 'react-native-elements';
import * as Application from 'expo-application';
import { debounce } from 'lodash';
import { MainDrawerProps } from '~/navigation/types/MainDrawerParams';
import globalStyle from '~/styles/global';
import { ThemeContext } from 'styled-components/native';
import { useUpdateAlarmStatusMutation } from '~/graphql/generated/generated';
import { FeedProps } from '~/types/alarmType';
import { getAppUpdate } from '~/utils/device';
import { AuthContext } from '~/contexts/AuthContext';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import getString from '~/utils/locales/STRINGS';
import pushService from '~/services/FcmService';
import ActionCreators from '~/state/actions';

const Alarm = ({ navigation, route }: MainDrawerProps<'Alarm'>): JSX.Element => {
    const themeContext = useContext(ThemeContext);
    const dispatch = useDispatch();
    const { isGuest, user } = useContext(AuthContext);
    const [feedStatus, setFeedStatus] = useState<FeedProps>();
    const [updateAlarmMutate] = useUpdateAlarmStatusMutation();

    useEffect(() => {
        setFeedStatus(pushService.getUserAlarmStatus());
    }, []);

    const updateAlarm = useCallback(
        debounce(async () => {
            const alarmStatus = pushService.getUserAlarmStatus();
            const result = await updateAlarmMutate({
                variables: {
                    input: {
                        where: {
                            id: user?.userId || '',
                        },
                        data: {
                            alarmStatus: {
                                myProposalsNews: alarmStatus.isMyProposalsNews,
                                likeProposalsNews: alarmStatus.isLikeProposalsNews,
                                newProposalsNews: alarmStatus.isNewProposalNews,
                                myCommentsNews: alarmStatus.isMyCommentNews,
                                etcNews: alarmStatus.isEtcNews,
                            },
                        },
                    },
                },
            });
            if (!result.data?.updateUserAlarmStatus?.userFeed?.id) {
                dispatch(ActionCreators.snackBarVisibility({
                    visibility: true,
                    text: getString('사용자 설정 오류로 변경 실패'),
                }))
            }
        }, 500),
        [updateAlarmMutate, user]
    )

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
                            value={feedStatus?.isMyProposalsNews || false}
                            onValueChange={(value) => {
                                setFeedStatus(pushService.setUserAlarmStatus({
                                    isMyProposalsNews: value,
                                }));
                                updateAlarm();
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
                            value={feedStatus?.isLikeProposalsNews || false}
                            onValueChange={(value) => {
                                setFeedStatus(pushService.setUserAlarmStatus({
                                    isLikeProposalsNews: value,
                                }));
                                updateAlarm();
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
                            value={feedStatus?.isNewProposalNews || false}
                            onValueChange={(value) => {
                                setFeedStatus(pushService.setUserAlarmStatus({
                                    isNewProposalNews: value,
                                }));
                                updateAlarm();
                            }}
                            thumbColor={'white'}
                        />
                    </View>
                    <View style={[globalStyle.flexRowBetween, { height: 40 }]}>
                        <Text style={{ fontSize: 13 }}>{getString('내 게시글에 대한 반응')}</Text>
                        <Switch
                            style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                            trackColor={{ true: themeContext.color.primary, false: themeContext.color.black }}
                            disabled={isGuest}
                            value={feedStatus?.isMyCommentNews || false}
                            onValueChange={(value) => {
                                setFeedStatus(pushService.setUserAlarmStatus({
                                    isMyCommentNews: value,
                                }));
                                updateAlarm();
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
                            value={feedStatus?.isEtcNews || false}
                            onValueChange={(value) => {
                                setFeedStatus(pushService.setUserAlarmStatus({
                                    isEtcNews: value,
                                }));
                                updateAlarm();
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
