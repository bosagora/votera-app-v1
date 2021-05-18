/* eslint-disable global-require, @typescript-eslint/no-unsafe-assignment */
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ActionCreators, { ActionCreatorsState } from '../../../state/actions';
import LoadingModalScreen from './screen';

const LoadingAniModal = (): JSX.Element | null => {
    const loadingAniModal = useSelector((store: ActionCreatorsState) => store.loadingAniModal);
    const dispatch = useDispatch();
    const [timer, setTimer] = useState(0);

    const clearTimer = () => {
        if (timer) {
            clearTimeout(timer);
            setTimer(0);
        }
    };

    useEffect(() => {
        if (loadingAniModal.visibility) {
            clearTimer();
            setTimer(
                setTimeout(() => {
                    Alert.alert('Loading failed');
                    dispatch(ActionCreators.loadingAniModal({ visibility: false }));
                }, 180000),
            );
        } else {
            clearTimer();
        }
    }, [loadingAniModal.visibility]);

    if (!loadingAniModal.visibility) return null;
    return <LoadingModalScreen />;
};

export default LoadingAniModal;
