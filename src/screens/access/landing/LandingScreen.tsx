import React, { useState, useEffect, useContext } from 'react';
import { View, Image } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { SmartBuffer } from 'smart-buffer';
import CommonButton from '~/components/button/CommonButton';
import { AuthContext } from '~/contexts/AuthContext';
import { AccessNavProps } from '~/navigation/access/AccessStackParams';
import globalStyle from '~/styles/global';
import { useDispatch } from 'react-redux';
import ActionCreators from '~/state/actions';
import getString from '~/utils/locales/STRINGS';

const LandingScreen = ({ navigation }: AccessNavProps<'Landing'>): JSX.Element => {
    const themeContext = useContext(ThemeContext);
    const { enrolled, setGuestMode, routeLoaded, setRouteLoaded } = useContext(AuthContext);
    const [routeName, setRouteName] = useState<string>();
    const [showLanding, setShowLanding] = useState(false);
    const dispatch = useDispatch();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    useEffect(() => {
        if (enrolled) {
            setShowLanding(false);
            navigation.replace('Login');
            return;
        }

        setShowLanding(true);
    }, [enrolled]);

    useEffect(() => {
        if (routeLoaded && routeName) {
            navigation.navigate(routeName);
        }
    }, [routeLoaded]);

    if (!showLanding) return <></>;
    return (
        <View style={{ alignItems: 'center', backgroundColor: 'white', flex: 1 }}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <Image source={require('@assets/images/votera/voteraFullnameLogo.png')} />
            </View>
            <View>
                <CommonButton
                    title={getString('계정만들기')}
                    buttonStyle={{ justifyContent: 'space-between', paddingHorizontal: 21, width: 271 }}
                    filled
                    onPress={() => navigation.navigate('Signup')}
                    raised
                />
                <CommonButton
                    title={getString('계정복구하기')}
                    buttonStyle={{ justifyContent: 'space-between', paddingHorizontal: 21, width: 271, marginTop: 11 }}
                    onPress={() => navigation.navigate('Recovery')}
                />
                <Button
                    title={getString('둘러보기')}
                    titleStyle={[globalStyle.mtext, { marginRight: 16, fontSize: 16 }]}
                    icon={<Image source={require('@assets/icons/arrow/arrowGrad.png')} />}
                    iconRight
                    buttonStyle={{ justifyContent: 'flex-end', paddingHorizontal: 21, marginTop: 10 }}
                    iconContainerStyle={{ paddingLeft: 16 }}
                    type="clear"
                    onPress={() => {
                        setRouteLoaded(false);
                        setRouteName('RootUser');
                        setGuestMode(true);
                        // navigation.navigate('RootUser');
                    }}
                />
                <View style={{ marginBottom: 77, marginTop: 34, alignItems: 'center' }}>
                    <Text style={[globalStyle.gmtext, { fontSize: 11, color: themeContext.color.textGray }]}>
                        (C) 2020 BOSAGORA.
                    </Text>
                    <View style={{ flexDirection: 'row', marginTop: 12.7 }}>
                        <Button
                            title={getString('이용약관')}
                            titleStyle={{
                                fontSize: 13,
                                color: themeContext.color.textGray,
                            }}
                            type="clear"
                        />
                        <Button
                            title={getString('개인정보보호정책')}
                            titleStyle={{
                                fontSize: 13,
                                color: themeContext.color.textGray,
                            }}
                            type="clear"
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};

export default LandingScreen;
