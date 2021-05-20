import React, { useContext, useEffect, useState } from 'react';
import { View, Image, Keyboard, BackHandler } from 'react-native';
import { useDispatch } from 'react-redux';
import { Button, Text } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView } from 'react-native-tab-view';
import { ThemeContext } from 'styled-components/native';
import { generateHashPin } from '@utils/crypto';
import { useCreateValidatorUserMutation } from '~/graphql/generated/generated';
import { AccessNavProps } from '~/navigation/access/AccessStackParams';
import { ValidatorLogin } from '~/utils/voterautil';
import { AuthContext, User } from '~/contexts/AuthContext';
import globalStyle from '~/styles/global';
import ActionCreators from '~/state/actions';
import Terms from './Terms';
import NodeAuth from '../common/NodeAuth';
import PinEnrollScreen from '../common/PinEnrollScreen';
import NameScreen from './Name';
import CompleteScreen from './Complete';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import getString from '~/utils/locales/STRINGS';

const SignupScreen = ({ navigation }: AccessNavProps<'Signup'>) => {
    const keys = [
        { key: 'terms', title: getString('약관동의') },
        { key: 'auth', title: getString('노드인증') },
        { key: 'name', title: getString('계정이름') },
        { key: 'password', title: getString('암호입력') },
        { key: 'complete', title: getString('가입완료') },
    ];
    const findIndex = (key: string) => {
        return keys.findIndex((value) => value.key === key);
    };
    const dispatch = useDispatch();
    const themeContext = useContext(ThemeContext);
    const [index, setIndex] = useState(0);
    const [routes] = useState(keys);
    const { setLocalUser, registerVoterCard, login } = useContext(AuthContext);

    const [createValidatorUser] = useCreateValidatorUserMutation({ fetchPolicy: 'no-cache' });

    const [stepComplete, setStepComplete] = useState(false);
    const [validatorLogin, setValidatorLogin] = useState<ValidatorLogin>();
    const [nodeName, setNodeName] = useState('');
    const [accountName, setAccountName] = useState('');
    const [pin, setPin] = useState('');

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: getString('계정만들기'),
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
            headerRight: () => renderNextButton(),
            headerStyle: { shadowOffset: { height: 0, width: 0 }, elevation: 0 },
        });
    }, [navigation, index, stepComplete, validatorLogin]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (index > 0) {
                setIndex(index - 1);
            } else {
                navigation.pop();
            }
            return true;
        });
        return () => backHandler.remove();
    }, [navigation, index]);

    useEffect(() => {
        setStepComplete(false);
    }, [index]);

    const completeSignup = async () => {
        if (!validatorLogin) {
            throw new Error('No Validator QRCode Login');
        }

        dispatch(ActionCreators.loadingAniModal({ visibility: true }));

        try {
            const validator = validatorLogin.validator;
            const password = generateHashPin(pin, validator);

            const voterCard = validatorLogin.getStringVoterCard();
            const createUserResult = await createValidatorUser({
                variables: {
                    input: {
                        username: accountName,
                        password,
                        nodeName,
                        voterCard,
                    },
                },
            });

            if (createUserResult.data?.createValidatorUser?.user) {
                const createdUser = createUserResult.data.createValidatorUser.user;
                const createdMember = createdUser?.members?.find((member) => member?.address === validator);

                console.log('createdUser result = ', createdUser);

                const user: User = {
                    memberId: createdMember?.id || '',
                    nodename: createdMember?.username || '',
                    userId: createdUser.id,
                    username: createdUser.username,
                    mail: createdUser.email,
                    validator,
                };

                await setLocalUser(user);
                if (createdMember) {
                    await registerVoterCard(
                        createdMember.id,
                        createdMember.username,
                        validatorLogin.validator,
                        validatorLogin,
                        true,
                    );
                }

                const loginResult = await login(pin);
                if (!loginResult.succeeded) {
                    dispatch(ActionCreators.loadingAniModal({ visibility: false }));
                    dispatch(ActionCreators.snackBarVisibility({ visibility: true, text: getString('로그인 실패') }));
                    return;
                }

                dispatch(ActionCreators.loadingAniModal({ visibility: false }));

                // 사용자 로그인 redirect
                navigation.navigate('Main', { screen: 'Home' });
            } else {
                dispatch(ActionCreators.loadingAniModal({ visibility: false }));
                dispatch(ActionCreators.snackBarVisibility({ visibility: true, text: getString('사용자 생성 실패') }));
            }
        } catch (err) {
            console.log('createValidatorUser error = ', err);
            dispatch(ActionCreators.loadingAniModal({ visibility: false }));
            dispatch(
                ActionCreators.snackBarVisibility({ visibility: true, text: getString('사용자 생성 중 오류 발생') }),
            );
        }
    };

    const onScannedAuthNode = (loginData: ValidatorLogin) => {
        setValidatorLogin(loginData);
    };

    const onCompleteAuthNodeName = (text: string) => {
        setNodeName(text);
        setStepComplete(text.length > 0);
    };

    const onCompleteAccountName = (name: string, incomplete?: boolean) => {
        setAccountName(name);
        if (incomplete) {
            setStepComplete(false);
        } else {
            setStepComplete(name.length > 0);
        }
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

    const renderNextButton = () => {
        if (index === 0 || (index === 1 && !validatorLogin) || index === 3 || index === 4) {
            return <></>;
        }

        return (
            <Button
                disabled={!stepComplete}
                onPress={() => {
                    Keyboard.dismiss();
                    setIndex(index + 1);
                }}
                title={getString('다음')}
                titleStyle={[globalStyle.rtext, { fontSize: 17, color: themeContext.color.primary }]}
                buttonStyle={{ padding: 0 }}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                type="clear"
            />
        );
    };

    const renderScene = ({ route }: any) => {
        switch (route.key) {
            case 'terms':
                return <Terms onComplete={() => setIndex(findIndex('auth'))} />;
            case 'auth':
                return <NodeAuth onScanned={onScannedAuthNode} onComplete={onCompleteAuthNodeName} />;
            case 'name':
                return <NameScreen onComplete={onCompleteAccountName} />;
            case 'password':
                return <PinEnrollScreen onComplete={onCompleteInputPin} />;
            case 'complete':
                return (
                    <CompleteScreen
                        onComplete={() => completeSignup()}
                        // localData={signupLocalData}
                        // onComplete={() => completeSignup()}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor="white" />
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

export default SignupScreen;
