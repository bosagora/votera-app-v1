import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CommonStackParams } from './CommonStack';
import globalStyle from '~/styles/global';
import WebViewScreen from '~/screens/common/WebViewScreen';

const CommonStack = createStackNavigator<CommonStackParams>();

export const CommonStackScreens: React.FC = () => (
    <CommonStack.Navigator
        screenOptions={{
            headerTitleStyle: { ...globalStyle.headerTitle },
            headerLeftContainerStyle: { paddingLeft: 20 },
            headerRightContainerStyle: { paddingRight: 20 },
            headerTitleAlign: 'center',
        }}
    >
        <CommonStack.Screen name="WebView" component={WebViewScreen} />
    </CommonStack.Navigator>
);

const WrapCommonNavigation: React.FC = () => {
    return (
        <>
            <CommonStackScreens />
        </>
    );
};

export default WrapCommonNavigation;
