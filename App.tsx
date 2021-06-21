import './global';
import React, { useEffect } from 'react';
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
import pushService from '~/services/FcmService';

let preventCalled = false;

if (!preventCalled) {
    // console.log('Call prevent splash');
    SplashScreen.preventAutoHideAsync().catch(console.log); // it's good to explicitly catch and inspect any error
    preventCalled = true;
}

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
});

export default function App() {

    useEffect(() => {
        pushService.registerAppWithFCM().catch((err) => {
            console.log('registerAppWithFCM error : ', err);
        });
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
