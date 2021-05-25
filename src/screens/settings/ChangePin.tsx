import React, { useContext } from 'react';
import { View, Image } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { useDispatch } from 'react-redux';
import { MainDrawerProps } from '~/navigation/types/MainDrawerParams';
import globalStyle from '~/styles/global';
import { AuthContext } from '~/contexts/AuthContext';
import PinEnrollScreen from '~/screens/access/common/PinEnrollScreen';
import ActionCreators from '~/state/actions';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import getString from '~/utils/locales/STRINGS';

const ChangePin = ({ navigation, route }: MainDrawerProps<'ChangePin'>): JSX.Element => {
    const dispatch = useDispatch();
    const { changePassword } = useContext(AuthContext);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitleAlign: 'center',
            headerTitle: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={globalStyle.headerTitle}>{getString('PIN 변경')}</Text>
                </View>
            ),
            headerLeft: () => (
                <Button
                    onPress={() => navigation.goBack()}
                    icon={<Image source={require('@assets/icons/arrow/backArrowBlack.png')} />}
                    type="clear"
                />
            ),
        });
    }, [navigation]);

    const onCompleteInputPin = (pwd: string) => {
        dispatch(ActionCreators.loadingAniModal({ visibility: true }));
        changePassword(pwd)
            .then(() => {
                dispatch(ActionCreators.loadingAniModal({ visibility: false }));
                dispatch(ActionCreators.snackBarVisibility({ visibility: true, text: getString('변경 완료했습니다&#46;') }));
                navigation.goBack();
            })
            .catch((err) => {
                console.log('changePassword error : ', err);
                dispatch(ActionCreators.loadingAniModal({ visibility: false }));
                dispatch(ActionCreators.snackBarVisibility({ visibility: true, text: getString('변경 실패했습니다&#46;') }));
            });
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor="white" />
            <PinEnrollScreen onComplete={onCompleteInputPin} />
        </View>
    );
};

export default ChangePin;
