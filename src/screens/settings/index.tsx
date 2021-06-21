import React, { useContext, useEffect, useState } from 'react';
import { View, Image, ScrollView, StyleSheet, Switch } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { useDispatch } from 'react-redux';
import * as Application from 'expo-application';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useIsFocused } from '@react-navigation/native';
import { ThemeContext } from 'styled-components/native';
import globalStyle from '~/styles/global';
import pushService from '~/services/FcmService';
import ActionCreators from '~/state/actions';
import { MainNavProps } from '~/navigation/types/MainStackParams';
import { useUpdatePushTokenMutation } from '~/graphql/generated/generated';
import { getAppUpdate } from '~/utils/device';
import { getUserServiceTermURL, getPrivacyTermURL } from '~/utils/agoraconf';
import { AuthContext } from '~/contexts/AuthContext';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import getString from '~/utils/locales/STRINGS';
import { PushStatusType } from '~/types/pushType';

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
    const { isGuest, user } = useContext(AuthContext);
    const themeContext = useContext(ThemeContext);
    const isFocused = useIsFocused();
    const [usePush, setUsePush] = useState<boolean>(!isGuest);
    const [disablePush, setDisablePush] = useState<boolean>(isGuest);

    const [updatePushToken] = useUpdatePushTokenMutation();

    const toggleUsePush = async (isPush: boolean) => {
        const localData = await pushService.getCurrentPushLocalStorage();
        if (!localData?.id) {
            return;
        }

        await pushService.updatePushTokenOnLocalStorage(localData.id, localData.token, isPush);

        const result = await updatePushToken({
            variables: {
                input: {
                    where: {
                        id: user?.userId || '',
                    },
                    data: {
                        pushId: localData.id,
                        isActive: isPush,
                    },
                },
            },
        });
        if (!result.data?.updateUserPushToken?.userFeed) {
            // update failed, restore to original
            await pushService.updatePushTokenOnLocalStorage(localData.id, localData.token, localData.enablePush);
            setUsePush(localData.enablePush);
            dispatch(ActionCreators.snackBarVisibility({
                visibility: true,
                text: getString('사용자 설정 오류로 변경 실패'),
            }));
        }
    };

    useEffect(() => {
        if (isFocused && !isGuest) {
            pushService.getCurrentPushLocalStorage()
                .then((localData) => {
                    if (!localData || localData.tokenStatus === PushStatusType.DISABLED) {
                        setUsePush(false);
                        setDisablePush(true);
                        return;
                    }

                    setUsePush(!!localData.enablePush);
                })
                .catch((err) => {
                    console.log('getCurrentPushLocalStorage error : ', err);
                });
        }
    }, [isFocused, isGuest]);

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
                            disabled={disablePush}
                            value={usePush}
                            onValueChange={(isPush) => {
                                setUsePush(isPush);
                                toggleUsePush(isPush).catch((err) => {
                                    console.log('toggleUsePush error : ', err);
                                })
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
                                        text: getString('둘러보기 중에는 사용할 수 없습니다'),
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
                            //         text: getString('둘러보기 중에는 사용할 수 없습니다')
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
                                title: getString('이용약관'),
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
