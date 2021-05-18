import './global';
import React, { useCallback, useEffect, useState } from 'react';
import { ThemeProvider } from 'react-native-elements';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { Provider } from 'react-redux';
import messaging from '@react-native-firebase/messaging';
import { ApolloProvider } from '@apollo/react-hooks';
import * as SplashScreen from 'expo-splash-screen';
import Routes from '~/navigation/Routes';
import store from './src/state/store';
import theme from './src/theme/theme';
import { theme as sTheme } from './src/theme/styledTheme';
import apolloClient from './src/graphql/client';
import { AuthProvider } from '~/contexts/AuthContext';
import { ProposalProvider } from '~/contexts/ProposalContext';

let preventCalled = false;

if (!preventCalled) {
    // console.log('Call prevent splash');
    SplashScreen.preventAutoHideAsync().catch(console.log); // it's good to explicitly catch and inspect any error
    preventCalled = true;
}

export default function App() {
    async function registerAppWithFCM() {
        if (!messaging().isDeviceRegisteredForRemoteMessages) {
            await messaging().registerDeviceForRemoteMessages();
        }
    }

    const foregroundListener = useCallback(() => {
        messaging().onMessage(async (message) => {
            console.log('foreground message : ', message);
        });
    }, []);

    useEffect(() => {
        registerAppWithFCM();
        foregroundListener();
        // handlePushToken();
        // saveDeviceToken();
    }, []);

    return (
        <ApolloProvider client={apolloClient}>
            <Provider store={store}>
                <ThemeProvider theme={theme}>
                    <StyledThemeProvider theme={sTheme}>
                        <AuthProvider>
                            <ProposalProvider>
                                <Routes />
                            </ProposalProvider>
                        </AuthProvider>
                    </StyledThemeProvider>
                </ThemeProvider>
            </Provider>
        </ApolloProvider>
    );
}
