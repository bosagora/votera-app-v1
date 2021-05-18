import React, { useEffect, useRef } from 'react';
import styled from 'styled-components/native';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import { Animated } from 'react-native';
import { useSelector } from 'react-redux';
import { Text } from 'react-native-elements';
import { ActionCreatorsState } from '~/state/actions';

const SNACK_BAR_HEIGHT = 70 + (initialWindowMetrics?.insets.bottom || 0);

const Container = styled.View`
    position: absolute;
    bottom: 0;
    width: 100%;
`;
const SnackBarView = styled.View`
    height: ${SNACK_BAR_HEIGHT}px;
    margin-horizontal: 40px;
    background-color: ${(props) => props.theme.color.primary};
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    justify-content: center;
    align-items: center;
`;

interface Props {}

const SnackBar: React.FC = (props) => {
    const snackBarTopAni = useRef(new Animated.Value(SNACK_BAR_HEIGHT)).current;
    const snackBar = useSelector((state: ActionCreatorsState) => state.snackBar);

    useEffect(() => {
        if (snackBar && snackBar.visibility) {
            Animated.sequence([
                Animated.timing(snackBarTopAni, {
                    toValue: 0,
                    duration: 500,
                    delay: 0,
                    useNativeDriver: true,
                }),
                Animated.timing(snackBarTopAni, {
                    toValue: SNACK_BAR_HEIGHT,
                    duration: 500,
                    delay: 2000,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [snackBar]);

    if (!snackBar.visibility) return null;

    return (
        <Container as={Animated.View} style={{ transform: [{ translateY: snackBarTopAni }] }}>
            <SnackBarView>
                <Text style={{ color: 'white', textAlign: 'center' }}>{snackBar.text}</Text>
            </SnackBarView>
        </Container>
    );
};

export default SnackBar;
