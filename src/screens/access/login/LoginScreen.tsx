import React, { useContext, useState } from 'react';
import { Dimensions, Image } from 'react-native';
import { useDispatch } from 'react-redux';
import { SceneRendererProps, TabView } from 'react-native-tab-view';
import { AccessNavProps } from '~/navigation/access/AccessStackParams';
import { AuthContext } from '~/contexts/AuthContext';
import { ValidatorLogin } from '~/utils/voterautil';
import ActionCreators from '~/state/actions';
import PinAuthScreen from '~/screens/access/common/PinAuthScreen';
import NodeAuth from '~/screens/access/common/NodeAuth';
import { SafeAreaView } from 'react-native-safe-area-context';

const keys = [{ key: 'login' }, { key: 'node' }];

const LoginScreen = ({ navigation }: AccessNavProps<'Login'>) => {
    const dispatch = useDispatch();
    const { login, setRouteLoaded } = useContext(AuthContext);
    const [index, setIndex] = useState(0);
    const [passwordError, setPasswordError] = useState(false);
    const [routes] = useState(keys);
    const [validatorLogin, setValidatorLogin] = useState<ValidatorLogin>();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: (props) => <Image source={require('@assets/images/votera/voteraLogo.png')} />,
            headerStyle: { shadowOffset: { height: 0, width: 0 }, elevation: 0 },
        });
    }, [navigation]);

    const onCompleteInputPin = (pin: string) => {
        const handler = async (pin: string) => {
            setPasswordError(false);
            setRouteLoaded(false);
            const result = await login(pin);
            if (result.succeeded) {
                navigation.navigate('Main', { screen: 'Home' });
            } else {
                setPasswordError(true);
                console.log('login result = ', result);
            }
        };
        handler(pin).catch((err) => {
            console.log('login error = ', err);
            dispatch(
                ActionCreators.snackBarVisibility({
                    visibility: true,
                    text: '로그인 통신 중 오류 발생',
                }),
            );
        });
    };

    const onSelectRecover = () => {
        navigation.navigate('Recovery');
    };

    const onSelectSignup = () => {
        navigation.navigate('Signup');
    };

    const onScannedAuthNode = (loginData: ValidatorLogin) => {
        setValidatorLogin(validatorLogin);
    };

    const renderScene = (props: SceneRendererProps & { route: { key: string } }): JSX.Element => {
        switch (props.route.key) {
            case 'login':
                return (
                    <PinAuthScreen
                        onComplete={onCompleteInputPin}
                        onRecover={onSelectRecover}
                        onSignup={onSelectSignup}
                        error={passwordError}
                    />
                );
            case 'node':
                return <NodeAuth onScanned={onScannedAuthNode} onComplete={(text: string) => {}} />;
            default:
                return <></>;
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
            <TabView
                keyboardDismissMode="on-drag"
                initialLayout={{ width: Dimensions.get('window').width }}
                sceneContainerStyle={{ backgroundColor: 'white' }}
                navigationState={{ index, routes }}
                onIndexChange={setIndex}
                renderScene={renderScene}
                renderTabBar={() => null}
                lazy
                swipeEnabled={false}
            />
        </SafeAreaView>
    );
};

export default LoginScreen;
