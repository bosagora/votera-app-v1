import React, { useCallback } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';

import Loading from '~/screens/loading';
import { MainDrawer } from './MainDrawer';
import { AccessStackScreens } from './access/AccessNavigator';
import CommonStackScreens from './common/CommonNavigator';
import { AuthContext } from '~/contexts/AuthContext';
import LoadingAniScreen from '~/components/shared/LoadingModal/index';
import QRCodeScanner from '~/components/shared/qrcode/QRCodeScanner';
import SnackBar from '~/components/shared/snackbar';
import BottomSheetComponent from '~/components/shared/BottomSheet';

const authScreens = {
    RootAuth: AccessStackScreens,
    Common: CommonStackScreens,
};

const userScreens = {
    RootUser: MainDrawer,
    Common: CommonStackScreens,
};

const guestScreens = {
    RootUser: MainDrawer,
    RootAuth: AccessStackScreens,
    Common: CommonStackScreens,
};

const RootStack = createStackNavigator();

const Routes: React.FC = () => {
    const { user, isGuest, setRouteLoaded } = React.useContext(AuthContext);
    const [isLoading, setIsLoading] = React.useState(true);

    const onLayoutRootView = useCallback(async () => {
        if (!isLoading) {
            await SplashScreen.hideAsync();
        }
    }, [isLoading]);

    React.useEffect(() => {
        setRouteLoaded(true);
    }, [user, isGuest]);

    if (isLoading) return <Loading onComplete={() => setIsLoading(false)} />;
    const routeScreen = {
        ...(user ? userScreens : isGuest ? guestScreens : authScreens),
    };
    console.log('routeScreen = ', routeScreen);
    return (
        <>
            <NavigationContainer>
                <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
                    <RootStack.Navigator screenOptions={{ headerShown: false }}>
                        {Object.entries(routeScreen).map(([name, component]) => (
                            <RootStack.Screen key={`root.${name}`} name={name} component={component} />
                        ))}
                    </RootStack.Navigator>
                </View>
            </NavigationContainer>
            <LoadingAniScreen />
            <QRCodeScanner />
            <BottomSheetComponent />
            <SnackBar />
        </>
    );
};

export default Routes;
