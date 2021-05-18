/* eslint-disable camelcase, global-require, @typescript-eslint/no-unsafe-assignment */
import React, { useContext, useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as boasdk from 'boa-sdk-ts';
import { BOASodiumRN } from '~/utils/crypto/BOASodiumRN';
import { BOASodium } from 'boa-sodium-ts';
import { useVoteraConfigurationQuery } from '~/graphql/generated/generated';
import { setAppUpdate } from '~/utils/device';
import { setAgoraConf } from '~/utils/agoraconf';
import { AuthContext } from '~/contexts/AuthContext';
import ActionCreators from '~/state/actions';
import { useDispatch } from 'react-redux';

interface LoadingProps {
    onComplete: () => void;
}

const Loading = (props: LoadingProps): JSX.Element => {
    const { onComplete } = props;
    const dispatch = useDispatch();
    let { feedAddress } = useContext(AuthContext);
    const { loading } = useVoteraConfigurationQuery({
        fetchPolicy: 'no-cache',
        onCompleted: (data) => {
            if (data?.version) {
                setAppUpdate(data.version);
            }
            if (data?.agora) {
                setAgoraConf(data.agora);
            }
        },
    });
    const [fontLoaded, error] = useFonts({
        GmarketSansTTFBold: require('@assets/fonts/GmarketSansTTFBold.ttf'),
        GmarketSansTTFMedium: require('@assets/fonts/GmarketSansTTFMedium.ttf'),
        NotoSansCJKkrBold: require('@assets/fonts/NotoSansCJKkr-Bold.otf'),
        NotoSansCJKkrLight: require('@assets/fonts/NotoSansCJKkr-Light.otf'),
        NotoSansCJKkrMedium: require('@assets/fonts/NotoSansCJKkr-Medium.otf'),
        NotoSansCJKkrRegular: require('@assets/fonts/NotoSansCJKkr-Regular.otf'),
        RobotoRegular: require('@assets/fonts/Roboto-Regular.ttf'),
        RobotoMedium: require('@assets/fonts/Roboto-Medium.ttf'),
        RobotoLight: require('@assets/fonts/Roboto-Light.ttf'),
    });

    useEffect(() => {
        if (__DEV__) {
            console.log('Running in DEV assign BOASodium')
            boasdk.SodiumHelper.assign(new BOASodium());
        } else {
            boasdk.SodiumHelper.assign(new BOASodiumRN());
        }

        boasdk.SodiumHelper.init().catch((err) => {
            console.log('boasdk init error = ', err.message || err);
        });
        dispatch(ActionCreators.snackBarVisibility({ visibility: false }));
    }, []);

    useEffect(() => {
        if (fontLoaded && !loading) onComplete();
    }, [fontLoaded, loading]);

    return <></>;
};

export default Loading;
