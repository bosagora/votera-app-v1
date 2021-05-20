import React, { useContext, useEffect, useState } from 'react';
import { View, Image, ScrollView, StyleSheet, Switch } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { useDispatch } from 'react-redux';
import * as Application from 'expo-application';
import globalStyle from '~/styles/global';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { LocalStoragePushProps } from '~/utils/LocalStorage';
import { useIsFocused } from '@react-navigation/native';
import { ThemeContext } from 'styled-components/native';
import push from '~/services/FcmService';
import ActionCreators from '~/state/actions';
import messaging from '@react-native-firebase/messaging';
import { MainNavProps } from '~/navigation/types/MainStackParams';
import { useToggleFollowAllMutation } from '~/graphql/generated/generated';
import { getAppUpdate } from '~/utils/device';
import { getUserServiceTermURL, getPrivacyTermURL } from '~/utils/agoraconf';
import { AuthContext } from '~/contexts/AuthContext';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import getString from '~/utils/locales/STRINGS';

const styles = StyleSheet.create({
    sectionLabel: {
        fontSize: 14,
        marginBottom: 15,
        fontFamily: 'NotoSansCJKkrBold',
        fontWeight: 'bold',
    },
    sectionSeparator: {
        height: 1,
        backgroundColor: 'rgb(235,234,239)',
        marginVertical: 30
    },
});

const Settings = ({ navigation, route }: MainNavProps<'Settings'>): JSX.Element => {
    const dispatch = useDispatch();
    const { feedAddress, isGuest } = useContext(AuthContext);
    const themeContext = useContext(ThemeContext);
    const isFocused = useIsFocused();
    const [usePush, setUsePush] = useState<boolean>();
    const [toggleFollowAll] = useToggleFollowAllMutation();
    // TODO: Overlay 작업이 안되어 있음
    const [showWarningPushPopup, setShowWarningPushPopup] = useState(false);

    function mutateUpdateFollow(isPush: boolean) {
        toggleFollowAll({
            variables: {
                input: {
                    member: feedAddress,
                    isActive: isPush,
                },
            },
        }).catch(console.log);
    }

    const toggleUsePush = (isPush: boolean) => {
        // Local user enablePush
        push.useGetCurrentPushLocalStorage()
            .then((localData: LocalStoragePushProps) => {
                localData.enablePush = isPush;
                return localData;
            })
            .then((localData) => {
                const { token, enablePush } = localData;
                return push.useUpdateTokenToLocalPushStorage(token, enablePush);
            })
            .then(() => {
                mutateUpdateFollow(isPush);
            })
            .catch(console.log);
        // mutation updateFeed
    };

    useEffect(() => {
        if (isFocused) {
            push.useGetCurrentPushLocalStorage()
                .then((localData) => {
                    if (localData.enablePush === true) {
                        // 푸시 권한으로 푸시 사용유무 확인
                        push.useGetPushPermission()
                            .then((permissions) => {
                                if (permissions !== messaging.AuthorizationStatus.AUTHORIZED) {
                                    setUsePush(false);
                                    mutateUpdateFollow(false);
                                } else {
                                    setUsePush(true);
                                    mutateUpdateFollow(true);
                                }
                            })
                            .catch(console.log);
                    } else {
                        setUsePush(localData.enablePush || false);
                    }
                })
                .catch(console.log);
        }
    }, [isFocused]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitleAlign: 'center',
            headerTitle: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={globalStyle.headerTitle}>{getString('설정')}</Text>
                </View>
            ),
            headerLeft: () => (
                <Button
                    onPress={() => navigation.goBack()}
                    icon={<Image source={require('@assets/icons/arrow/backArrowBlack.png')} />}
                    type="clear"
                />
            ),
            headerStyle: { shadowOffset: { height: 0, width: 0 }, elevation: 0 },
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
                            fontWeight: 'bold',
                            color: themeContext.color.primary,
                        }}
                    >
                        Ver {Application.nativeApplicationVersion}
                    </Text>
                </View>
                <View style={{ marginTop: 60 }}>
                    <Text style={styles.sectionLabel}>
                        {getString('알림')}
                    </Text>
                    <View style={[globalStyle.flexRowBetween, { height: 40 }]}>
                        <Text style={{ fontSize: 13 }}>{getString('푸시 알림 받기')}</Text>
                        <Switch
                            style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                            trackColor={{ true: themeContext.color.primary, false: themeContext.color.black }}
                            disabled={isGuest}
                            value={usePush}
                            onValueChange={(isPush) => {
                                if (isPush === true) {
                                    push.useGetPushPermission()
                                        .then((permission) => {
                                            if (permission === messaging.AuthorizationStatus.AUTHORIZED) {
                                                setUsePush(isPush);
                                                toggleUsePush(isPush);
                                            } else {
                                                setShowWarningPushPopup(true);
                                                console.log('no!');
                                            }
                                        })
                                        .catch(console.log);
                                } else {
                                    setUsePush(isPush);
                                    toggleUsePush(isPush);
                                }
                            }}
                            thumbColor={'white'}
                        />
                    </View>

                    <TouchableOpacity
                        style={[globalStyle.flexRowBetween, { height: 40 }]}
                        onPress={() => {
                            navigation.navigate('Alarm');
                        }}
                    >
                        <Text style={{ fontSize: 13 }}>{getString('알림 수신 설정')}</Text>
                        <Image source={require('@assets/icons/arrow/rightArrowDarkgray.png')} />
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionSeparator} />

                <View>
                    <Text style={styles.sectionLabel}>
                        {getString('계정 설정')}
                    </Text>
                    <TouchableOpacity
                        style={[globalStyle.flexRowBetween, { height: 40 }]}
                        onPress={() => {
                            if (isGuest) {
                                dispatch(
                                    ActionCreators.snackBarVisibility({
                                        visibility: true,
                                        text: '둘러보기 중에는 사용할 수 없습니다',
                                    }),
                                );
                            } else {
                                navigation.navigate('AccountInfo');
                            }
                        }}
                    >
                        <Text style={{ fontSize: 13 }}>{getString('계정정보 변경하기')}</Text>
                        <Image source={require('@assets/icons/arrow/rightArrowDarkgray.png')} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[globalStyle.flexRowBetween, { height: 40 }]}
                        onPress={() => {
                            // if (isGuest) {
                            //     dispatch(ActionCreators.snackBarVisibility({
                            //         visibility: true,
                            //         text: '둘러보기 중에는 사용할 수 없습니다'
                            //     }));
                            // } else {
                                navigation.navigate('ConvertNode');
                            // }
                        }}
                    >
                        <Text style={{ fontSize: 13 }}>{getString('노드변경/추가하기')}</Text>
                        <Image source={require('@assets/icons/arrow/rightArrowDarkgray.png')} />
                    </TouchableOpacity>
                </View>
                <View style={styles.sectionSeparator} />

                <Text style={styles.sectionLabel}>
                    {getString('기타')}
                </Text>
                <TouchableOpacity style={[globalStyle.flexRowBetween, { height: 40 }]}>
                    <Text style={{ fontSize: 13 }}>{getString('버전정보')}</Text>
                    <Image source={require('@assets/icons/arrow/rightArrowDarkgray.png')} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[globalStyle.flexRowBetween, { height: 40 }]}
                    onPress={() => {
                        navigation.navigate('Common', {
                            screen: 'WebView',
                            params: {
                                title: '이용약관',
                                uri: getUserServiceTermURL(),
                            },
                        });
                    }}
                >
                    <Text style={{ fontSize: 13 }}>{getString('이용약관')}</Text>
                    <Image source={require('@assets/icons/arrow/rightArrowDarkgray.png')} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[globalStyle.flexRowBetween, { height: 40 }]}
                    onPress={() => {
                        navigation.navigate('Common', {
                            screen: 'WebView',
                            params: {
                                title: getString('개인정보보호정책'),
                                uri: getPrivacyTermURL(),
                            },
                        });
                    }}
                >
                    <Text style={{ fontSize: 13 }}>{getString('개인정보보호정책')}</Text>
                    <Image source={require('@assets/icons/arrow/rightArrowDarkgray.png')} />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default Settings;
