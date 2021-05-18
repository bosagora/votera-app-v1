import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import LandingScreen from '~/screens/access/landing/LandingScreen';
import LoginScreen from '~/screens/access/login/LoginScreen';
import RecoveryScreen from '~/screens/access/recovery/RecoveryScreen';
import SignupScreen from '~/screens/access/signup/SignupScreen';
import globalStyle from '~/styles/global';
import { AccessStackParams } from './AccessStackParams';

const AccessStack = createStackNavigator<AccessStackParams>();

export const AccessStackScreens: React.FC = () => (
    <AccessStack.Navigator
        screenOptions={{
            headerTitleStyle: { ...globalStyle.headerTitle },
            headerLeftContainerStyle: { paddingLeft: 20 },
            headerRightContainerStyle: { paddingRight: 20 },
            headerTitleAlign: 'center',
        }}
    >
        <AccessStack.Screen name="Landing" component={LandingScreen} />
        <AccessStack.Screen name="Signup" component={SignupScreen} />
        <AccessStack.Screen name="Login" component={LoginScreen} />
        <AccessStack.Screen name="Recovery" component={RecoveryScreen} />
    </AccessStack.Navigator>
);

const WrapperAccessNavigation: React.FC = () => {
    return (
        <>
            <AccessStackScreens />
        </>
    );
};

export default WrapperAccessNavigation;
