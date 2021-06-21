import React, { useContext, useState, useEffect } from 'react';
import { View, Image, BackHandler } from 'react-native';
import { useDispatch } from 'react-redux';
import { Button, Text } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView } from 'react-native-tab-view';
import { ThemeContext } from 'styled-components/native';
import { generateHashPin } from '@utils/crypto';
import { useRecoverValidatorUserMutation, RecoverValidatorUserData } from '~/graphql/generated/generated';
import { AccessNavProps } from '~/navigation/access/AccessStackParams';
import { ValidatorLogin } from '~/utils/voterautil';
import { AuthContext } from '~/contexts/AuthContext';
import globalStyle from '~/styles/global';
import ActionCreators from '~/state/actions';
import NodeAuth from '../common/NodeAuth';
import PinEnrollScreen from '../common/PinEnrollScreen';
import CompleteScreen from './Complete';
import getString, { getLocale } from '~/utils/locales/STRINGS';
import pushService from '~/services/FcmService';

const keys = [
    { key: 'auth', title: getString('노드인증') },
    { key: 'password', title: getString('암호입력') },
    { key: 'complete', title: getString('복구') },
];

const findIndex = (key: string) => {
    return keys.findIndex((value) => value.key === key);
};

const RecoveryScreen = ({ navigation }: AccessNavProps<'Recovery'>) => {
    const dispatch = useDispatch();
    const themeContext = useContext(ThemeContext);
    const [index, setIndex] = useState(0);
    const [routes] = useState(keys);
    const { setLocalUser, getLocalUser, registerVoterCard, deleteVoterCard, login, myMemberIds } = useContext(
        AuthContext,
    );
    const [validatorLogin, setValidatorLogin] = useState<ValidatorLogin>();
    const [pin, setPin] = useState('');
    const [recoverValidator] = useRecoverValidatorUserMutation({ fetchPolicy: 'no-cache' });

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: getString('계정복구'),
            headerLeft: () => (
                <Button
                    onPress={() => {
                        if (index > 0) {
                            setIndex(index - 1);
                        } else {
                            navigation.pop();
                        }
                    }}
                    icon={<Image source={require('@assets/icons/arrow/backArrowBlack.png')} />}
                    type="clear"
                />
            ),
        });
    }, [navigation, index]);

    useEffect(() => {
        const backhandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (index > 0) {
                setIndex(index - 1);
            } else {
                navigation.pop();
            }
            return true;
        })
        return () => backhandler.remove();
    }, [navigation, index]);

    const completeRecovery = async () => {
        if (!validatorLogin) {
            throw new Error('No Validator QRCode Login');
        }

        dispatch(ActionCreators.loadingAniModal({ visibility: true }));

        try {
            const validator = validatorLogin.validator;
            const password = generateHashPin(pin, validator);

            const voterCard = validatorLogin.getStringVoterCard();

            const recoverInput: RecoverValidatorUserData = {
                password,
                voterCard,
                locale: getLocale(),
            };

            const tokenOnDevice = await pushService.getPushNotificationTokenOnDevice();
            if (tokenOnDevice) {
                recoverInput.pushToken = tokenOnDevice.token;
            }

            const userResult = await recoverValidator({
                variables: { input: { data: recoverInput }},
            });

            if (userResult.data?.recoverValidatorUser?.user) {
                const createdUser = userResult.data.recoverValidatorUser.user;
                const member = createdUser?.members?.find((member) => member?.address === validator);

                const user = getLocalUser();
                user.userId = createdUser.id;
                user.username = createdUser.username;
                user.mail = createdUser.email;
                user.validator = validator;
                if (member) {
                    user.memberId = member.id;
                    user.nodename = member.username;
                }
                await setLocalUser(user);

                if (createdUser?.members) {
                    const userMembers = createdUser.members || [];
                    const delMembers = myMemberIds.filter(
                        (memberId) => userMembers.findIndex((m) => m?.id === memberId) < 0,
                    );
                    delMembers.forEach((memberId) =>
                        deleteVoterCard(memberId, true).catch((err) => console.log('deleteVoterCard error : ', err)),
                    );
                    const addMembers = userMembers.filter(
                        (userMember) =>
                            userMember && myMemberIds.findIndex((memberId) => userMember.id === memberId) < 0,
                    );
                    if (member) {
                        await registerVoterCard(member.id, member.username, member.address, validatorLogin);
                        addMembers.forEach(async (addMember) => {
                            if (addMember && addMember.id !== member.id) {
                                registerVoterCard(addMember.id, addMember.username, addMember.address).catch((err) => {
                                    console.log('registerVoterCard error = ', err);
                                });
                            }
                        });
                    } else {
                        addMembers.forEach(async (addMember) => {
                            if (addMember) {
                                registerVoterCard(addMember.id, addMember.username, addMember.address).catch((err) => {
                                    console.log('registerVoterCard error = ', err);
                                });
                            }
                        });
                    }
                }
                if (userResult.data?.recoverValidatorUser?.push && tokenOnDevice)  {
                    const push = userResult.data?.recoverValidatorUser?.push;
                    await pushService.updatePushTokenOnLocalStorage(push.id, tokenOnDevice.token, push.isActive);
                }

                const loginResult = await login(pin);
                if (!loginResult.succeeded) {
                    dispatch(ActionCreators.loadingAniModal({ visibility: false }));
                    dispatch(ActionCreators.snackBarVisibility({ visibility: true, text: getString('로그인을 실패했습니다') }));
                    return;
                }

                dispatch(ActionCreators.loadingAniModal({ visibility: false }));

                // 사용자 로그인 redirect
                navigation.navigate('Main', { screen: 'Home' });
            } else {
                // Alert.alert('계정생성 실패');
                dispatch(ActionCreators.loadingAniModal({ visibility: false }));
                dispatch(ActionCreators.snackBarVisibility({ visibility: true, text: getString('계정생성 실패') }));
            }
        } catch (err) {
            console.log('createValidatorUser error = ', err);
            dispatch(ActionCreators.loadingAniModal({ visibility: false }));
            dispatch(ActionCreators.snackBarVisibility({ visibility: true, text: getString('계정 생성 중 오류가 발생했습니다') }));
        }
    };

    const onScannedAuthNode = (loginData: ValidatorLogin) => {
        setValidatorLogin(loginData);
        setIndex(findIndex('password'));
    };

    const onCompleteInputPin = (pwd: string) => {
        setPin(pwd);
        setIndex(findIndex('complete'));
    };

    const renderTabBar = (props: any) => {
        return (
            <View style={{ height: 30, flexDirection: 'row', paddingHorizontal: 20 }}>
                {props.navigationState.routes.map((route: any, i: number) => {
                    const isActive = props.navigationState.index === i;
                    return (
                        <View
                            key={'singupTab_' + i}
                            style={[
                                globalStyle.center,
                                {
                                    flex: 1,
                                    borderBottomWidth: isActive ? 2 : 0,
                                    borderBottomColor: themeContext.color.primary,
                                },
                            ]}
                        >
                            {
                                <Text
                                    style={{
                                        fontSize: 14,
                                        color: isActive ? themeContext.color.primary : themeContext.color.disabled,
                                        fontFamily: isActive ? 'NotoSansCJKkrBold' : 'NotoSansCJKkrLight',
                                        fontWeight: isActive ? 'bold' : '300',
                                    }}
                                >
                                    {route.title}
                                </Text>
                            }
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderScene = ({ route }: any) => {
        switch (route.key) {
            case 'auth':
                return <NodeAuth onScanned={onScannedAuthNode} onComplete={(nodeName: string) => {}} />;
            case 'password':
                return <PinEnrollScreen onComplete={onCompleteInputPin} />;
            case 'complete':
                return <CompleteScreen onComplete={() => completeRecovery()} />;
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <TabView
                swipeEnabled={false}
                sceneContainerStyle={{ paddingHorizontal: 22 }}
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                renderTabBar={renderTabBar}
            />
        </SafeAreaView>
    );
};

export default RecoveryScreen;
