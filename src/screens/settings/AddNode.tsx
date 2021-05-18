import React, { useState, useContext } from 'react';
import { View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from 'react-native-elements';
import { useDispatch } from 'react-redux';
import { ThemeContext } from 'styled-components/native';
import { MainDrawerProps } from '~/navigation/types/MainDrawerParams';
import NodeAuth from '~/screens/access/common/NodeAuth';
import ActionCreators from '~/state/actions';
import { AuthContext } from '~/contexts/AuthContext';
import globalStyle from '~/styles/global';
import { ValidatorLogin } from '~/utils/voterautil';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';

const AddNode = ({ navigation, route }: MainDrawerProps<'AddNode'>): JSX.Element => {
    const dispatch = useDispatch();
    const themeContext = useContext(ThemeContext);
    const { user, addVoterCard } = useContext(AuthContext);
    const [validatorLogin, setValidatorLogin] = useState<ValidatorLogin>();
    const [nodeName, setNodeName] = useState('');

    const renderNextButton = () => {
        if (!validatorLogin) {
            return <></>;
        }

        return (
            <Button
                disabled={!nodeName}
                onPress={() => {
                    dispatch(ActionCreators.loadingAniModal({ visibility: true }));
                    addVoterCard(nodeName, validatorLogin)
                        .then((memberId) => {
                            dispatch(ActionCreators.loadingAniModal({ visibility: false }));
                            dispatch(
                                ActionCreators.snackBarVisibility({ visibility: true, text: '노드를 추가했습니다' }),
                            );
                            navigation.goBack();
                        })
                        .catch((err) => {
                            console.log('AddVoterCard error : ', err);
                            dispatch(ActionCreators.loadingAniModal({ visibility: false }));
                            dispatch(
                                ActionCreators.snackBarVisibility({
                                    visibility: true,
                                    text: '노드 추가 중 오류가 발생했습니다',
                                }),
                            );
                        });
                }}
                title="완료"
                titleStyle={[globalStyle.rtext, { fontSize: 17, color: themeContext.color.primary }]}
                buttonStyle={{ padding: 0 }}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                type="clear"
            />
        );
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitleAlign: 'center',
            headerTitle: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={globalStyle.headerTitle}>노드 추가 인증</Text>
                </View>
            ),
            headerLeft: () => (
                <Button
                    onPress={() => navigation.goBack()}
                    icon={<Image source={require('@assets/icons/arrow/backArrowBlack.png')} />}
                    type="clear"
                />
            ),
            headerRight: () => renderNextButton(),
        });
    }, [navigation, nodeName]);

    const onScannedAuthNode = (loginData: ValidatorLogin) => {
        setValidatorLogin(loginData);
    };

    const onCompleteAuthNodeName = (name: string) => {
        setNodeName(name);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor="white" />
            <View style={{ flex: 1, paddingHorizontal: 22, paddingTop: 0 }}>
                <NodeAuth onScanned={onScannedAuthNode} onComplete={onCompleteAuthNodeName} />
            </View>
        </SafeAreaView>
    );
};

export default AddNode;
