import React, { useContext, useEffect, useState } from 'react';
import { View, Alert, Image } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { useDispatch } from 'react-redux';
import * as Device from 'expo-device';
import { Text, Button } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import globalStyle from '~/styles/global';
import CommonButton from '~/components/button/CommonButton';
import { AuthContext } from '~/contexts/AuthContext';
import { parseQrcodeValidatorLogin } from '~/utils/voterautil';
import ActionCreators from '~/state/actions';
import { CreateNavProps } from '~/navigation/types/CreateStackParams';

const UpdateNode = ({ route, navigation }: CreateNavProps<'UpdateNode'>) => {
    const themeContext = useContext(ThemeContext);
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const { user, getMember, updateVoterCard } = useContext(AuthContext);
    const [ member, setMember ] = useState(getMember(user?.memberId || ''));

    const popToMain = () => {
        navigation.navigate('Main', { screen: 'Home' });
    }

    useEffect(() => {
        if (!member) {
            dispatch(ActionCreators.snackBarVisibility({
                visibility: true,
                text: '현재 디바이스에서 사용자 정보를 찾을 수 없습니다'
            }));
            popToMain();
        }
    }, []);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: '노드 갱신하기',
            headerTitleStyle: { ...globalStyle.headerTitle, color: 'white' },
            headerLeft: () => (
                <Button
                    onPress={popToMain}
                    icon={<Image source={require('@assets/icons/header/arrowWhiteBack.png')} />}
                    type="clear"
                />
            ),
            headerBackground: () => (
                <Image
                    style={{ height: 55 + insets.top, width: '100%' }}
                    source={require('@assets/images/header/bg.png')}
                />
            ),
        });
    }, [navigation]);
    
    const authenticateNode = () => {
        if (!Device.isDevice) {
            Alert.alert('Not Available');
            return;
        }

        const checkNode = (data: string) => {
            dispatch(ActionCreators.qrcodeScanner({ visibility: false }));

            try {
                const loginData = parseQrcodeValidatorLogin(data);
                if (!loginData || loginData.validator !== member?.address) {
                    dispatch(
                        ActionCreators.snackBarVisibility({
                            visibility: true,
                            text: '노드 주소가 일치하지 않습니다',
                        })
                    );
                    return;
                }

                updateVoterCard(member.memberId || '', loginData);
                navigation.goBack();
            } catch (err) {
                console.log('checkNode error = ', err);

                dispatch(ActionCreators.snackBarVisibility({
                    visibility: true,
                    text: '노드 인증 실패',
                }));
            }
        };

        dispatch(
            ActionCreators.qrcodeScanner({
                visibility: true,
                action: ActionCreators.QRCodeActionType.Validator,
                onComplete: checkNode,
                onCancel: popToMain,
            }),
        );
    };

    return (
        <View style={{ flex: 1, paddingTop: 45, paddingHorizontal: 22, }}>
            <Text style={[globalStyle.btext, { color: 'black' }]}>갱신 대상 노드 : {`${member?.nodename}`}</Text>
            {member?.address && (<Text style={[globalStyle.gmtext, { fontSize: 12, lineHeight: 20, marginTop: 17 }]}>{`${member.address}`}</Text>)}
            {!member?.address && (<Text style={[globalStyle.gmtext, { fontSize: 12, lineHeight: 20, marginTop: 17, color: themeContext.color.disagree }]}>노드 주소 정보가 없습니다</Text>)}
            <Text style={{ lineHeight: 23, marginTop: 63 }}>{`유효한 노드 정보가 없거나 유효기간이 지났습니다.\n노드 정보 갱신이 필요합니다.`}</Text>
            <View style={{ marginTop: 63 }}>
                <Text style={[globalStyle.btext, { color: themeContext.color.disagree }]}>주의사항</Text>
                <Text style={{ lineHeight: 23, marginTop: 13 }}>
                    {`- 해당 노드의 주소와 `}
                    <Text style={[globalStyle.btext, { color: themeContext.color.primary }]}>40,000 보아</Text>
                    {` 이상 보유하고 있는지 확인하시고 인증해 주시기 바랍니다.`}
                </Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <CommonButton
                    title="노드 인증하기"
                    containerStyle={{ borderRadius: 25, alignSelf: 'center' }}
                    buttonStyle={{
                        justifyContent: 'space-between',
                        paddingHorizontal: 21,
                        width: 209,
                    }}
                    filled
                    disabledStyle={{ backgroundColor: 'rgb(235,231,245)', borderColor: 'rgb(235,231,245)' }}
                    disabledTitleStyle={{ color: 'white' }}
                    onPress={authenticateNode}
                    raised
                />
            </View>
        </View>
    );
};

export default UpdateNode;
