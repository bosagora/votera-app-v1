import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MainStackScreens } from './MainStack';
import VoteraDrawer from '~/screens/home/VoteraDrawer';
import { CreateScreens } from '~/navigation/CreateStack';
import { MainDrawerParams } from '~/navigation/types/MainDrawerParams';

const Drawer = createDrawerNavigator<MainDrawerParams>();

export const MainDrawer: React.FC = () => {
    return (
        <Drawer.Navigator
            screenOptions={{
                swipeEnabled: true,
                gestureEnabled: true,
                headerStyle: { paddingHorizontal: 20 },
                headerTitleAlign: 'center',
            }}
            drawerContent={(props): any => <VoteraDrawer {...props} />}
        >
            <Drawer.Screen name="Main" component={MainStackScreens} />
            <Drawer.Screen name="CreateScreens" component={CreateScreens} />
        </Drawer.Navigator>
    );
};

const WrapperMainNavigation: React.FC = () => {
    return (
        <>
            <MainDrawer />
        </>
    );
};

export default WrapperMainNavigation;
