import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SettingStackParams } from './types/SettingStackParams';
import globalStyle from '~/styles/global';

const SettingStack = createStackNavigator<SettingStackParams>();

// Screens
import SettingsScreen from '../screens/settings/index';
import AccountInfoScreen from '../screens/settings/AccountInfo';
import ConvertNodeScreen from '../screens/settings/ConvertNode';
import AddNodeScreen from '../screens/settings/AddNode';
import ChangePinScreen from '../screens/settings/ChangePin';
import AlarmScreen from '../screens/settings/Alarm';

export const SettingScreens = (): JSX.Element => (
    <SettingStack.Navigator
        screenOptions={{
            headerTitleStyle: { ...globalStyle.headerTitle, color: 'red' },
            headerLeftContainerStyle: { paddingLeft: 20 },
            headerRightContainerStyle: { paddingRight: 20 },
        }}
    >
        <SettingStack.Screen name="Settings" component={SettingsScreen} />
        <SettingStack.Screen name="AccountInfo" component={AccountInfoScreen} />
        <SettingStack.Screen name="ConvertNode" component={ConvertNodeScreen} />
        <SettingStack.Screen name="AddNode" component={AddNodeScreen} />
        <SettingStack.Screen name="ChangePin" component={ChangePinScreen} />
        <SettingStack.Screen name="Alarm" component={AlarmScreen} />
    </SettingStack.Navigator>
);
