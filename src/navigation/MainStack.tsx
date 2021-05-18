import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MainStackParams } from './types/MainStackParams';
import HomeScreen from '~/screens/home/HomeScreen';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Image } from 'react-native';
import { Button } from 'react-native-elements';
import { DrawerActions } from '@react-navigation/native';
import { ThemeContext } from 'styled-components/native';
import ProposalDetailScreen from '~/screens/proposal/ProposalDetailScreen';
import ProposalListScreen from '~/screens/home/ProposalListScreen';
import Search from '../screens/home/SearchScreen';
import FeedScreen from '../screens/feed/FeedScreen';
import { SettingScreens } from '~/navigation/SettingStack';

import globalStyle from '~/styles/global';
import NoticeScreen from '~/screens/notice/NoticeScreen';
import CreateNoticeScreen from '~/screens/notice/CreateNoticeScreen';
import { OpenWhere, ProjectWhere } from '~/graphql/hooks/Proposals';

import TabBar from './TabBar';
import getString from '~/utils/locales/STRINGS';

const MainStack = createStackNavigator<MainStackParams>();

const HomeTab = createMaterialTopTabNavigator();

const HomeTabs = () => {
    const themeContext = useContext(ThemeContext);
    return (
        <HomeTab.Navigator tabBar={TabBar} lazy swipeEnabled>
            <HomeTab.Screen
                name={getString('프로젝트')}
                component={HomeScreen}
                initialParams={{
                    where: { ...ProjectWhere },
                }}
            />
            <HomeTab.Screen
                name={getString('오픈예정')}
                component={HomeScreen}
                initialParams={{
                    where: { ...OpenWhere },
                }}
            />
        </HomeTab.Navigator>
    );
};

export const MainStackScreens = (): JSX.Element => (
    <MainStack.Navigator
        screenOptions={{
            headerTitleStyle: { ...globalStyle.headerTitle },
            headerLeftContainerStyle: { paddingLeft: 20 },
            headerRightContainerStyle: { paddingRight: 20 },
            headerTitleAlign: 'center',
        }}
    >
        <MainStack.Screen
            name="Home"
            component={HomeTabs}
            options={({ navigation, route }) => ({
                headerTitle: (props) => <Image source={require('@assets/images/votera/voteraLogo.png')} />,
                headerLeft: (props) => {
                    return (
                        <Button
                            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                            icon={<Image source={require('@assets/icons/header/drawerIcon.png')} />}
                            type="clear"
                        />
                    );
                },
                headerRight: (props) => {
                    return (
                        <Button
                            icon={<Image source={require('@assets/icons/header/searchIcon.png')} />}
                            type="clear"
                            onPress={() => {
                                navigation.navigate('Search');
                            }}
                        />
                    );
                },
                headerStyle: { shadowOffset: { height: 0, width: 0 }, elevation: 0 },
            })}
        />
        <MainStack.Screen name="Feed" component={FeedScreen} />
        <MainStack.Screen name="Search" component={Search} />
        <MainStack.Screen name="ProposalDetail" component={ProposalDetailScreen} options={{ headerShown: false }} />
        <MainStack.Screen name="ProposalList" component={ProposalListScreen} />
        <MainStack.Screen name="Settings" component={SettingScreens} options={{ headerShown: false }} />
        <MainStack.Screen name="Notice" component={NoticeScreen} />
        <MainStack.Screen name="CreateNotice" component={CreateNoticeScreen} />
    </MainStack.Navigator>
);
