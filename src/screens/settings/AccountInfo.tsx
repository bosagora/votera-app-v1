import React, { useContext, useState } from 'react';
import { View, Image, ScrollView } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ThemeContext } from 'styled-components/native';
import { useDispatch } from 'react-redux';
import * as Application from 'expo-application';
import { MainDrawerProps } from '~/navigation/types/MainDrawerParams';
import globalStyle from '~/styles/global';
import NowNode from '~/components/input/SingleLineInput2';
import { AuthContext } from '~/contexts/AuthContext';
import ActionCreators from '~/state/actions';
import { getAppUpdate } from '~/utils/device';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import getString from '~/utils/locales/STRINGS';

const AccountInfo = ({ navigation, route }: MainDrawerProps<'AccountInfo'>): JSX.Element => {
    const themeContext = useContext(ThemeContext);
    const dispatch = useDispatch();
    const { user, changeVoterName } = useContext(AuthContext);
    const [searchValue, setSearchValue] = useState<string>(user?.nodename || '');
    const [isSearched, setIsSearched] = useState(true);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitleAlign: 'center',
            headerTitle: () => <Text style={globalStyle.headerTitle}>{getString('설정')}</Text>,
            headerLeft: () => (
                <Button
                    onPress={() => navigation.goBack()}
                    icon={<Image source={require('@assets/icons/arrow/backArrowBlack.png')} />}
                    type="clear"
                />
            ),
        });
    }, [navigation]);

    const changeNodeName = async () => {
        if (!user?.memberId) {
            dispatch(
                ActionCreators.snackBarVisibility({
                    visibility: true,
                    text: '사용자 설정 오류로 변경 실패',
                }),
            );
            return;
        }

        dispatch(
            ActionCreators.loadingAniModal({
                visibility: true,
            }),
        );
        try {
            await changeVoterName(user.memberId, searchValue);
            setIsSearched(true);
            dispatch(
                ActionCreators.loadingAniModal({
                    visibility: false,
                }),
            );
            dispatch(
                ActionCreators.snackBarVisibility({
                    visibility: true,
                    text: '노드 이름을 변경',
                }),
            );
        } catch (err) {
            console.log('changeVoterName error : ', err);
            dispatch(
                ActionCreators.loadingAniModal({
                    visibility: false,
                }),
            );
            dispatch(
                ActionCreators.snackBarVisibility({
                    visibility: true,
                    text: '이름 변경 중 오류 발생',
                }),
            );
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor="white" />
            <ScrollView
                contentContainerStyle={{ paddingVertical: 50 }}
                style={{ paddingHorizontal: 22, paddingTop: 0 }}
            >
                <View>
                    <Text style={{ fontSize: 13 }}>{getAppUpdate()}</Text>
                    <Text
                        style={[
                            globalStyle.gbtext,
                            {
                                marginTop: 8.5,
                                color: themeContext.color.primary,
                            },
                        ]}
                    >
                        Ver {Application.nativeApplicationVersion}
                    </Text>
                </View>
                <View style={{ marginTop: 60 }}>
                    <Text style={[globalStyle.btext, { marginBottom: 15, color: 'black' }]}>
                        {getString('현재 로그인한 노드')}
                    </Text>
                    <NowNode
                        onChangeText={(text) => {
                            console.log('changeText', text);
                            setSearchValue(text);
                            setIsSearched(text === user?.nodename);
                            // setProposals([]);
                        }}
                        inputStyle={{ fontFamily: 'GmarketSansTTFBold' }}
                        searchValue={searchValue}
                        value={searchValue}
                        koreanInput
                        subComponent={
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Button
                                    disabled={isSearched}
                                    title={getString('이름변경')}
                                    titleStyle={{
                                        fontFamily: 'NotoSansCJKkrBold',
                                        fontSize: 14,
                                        color: themeContext.color.primary,
                                    }}
                                    type="clear"
                                    onPress={changeNodeName}
                                />
                            </View>
                        }
                        placeholderText=""
                    />
                </View>

                <View style={{ height: 1, backgroundColor: 'rgb(235,234,239)', marginVertical: 30 }} />

                <View>
                    <TouchableOpacity
                        style={[globalStyle.flexRowBetween, { height: 40 }]}
                        onPress={() => {
                            navigation.navigate('ChangePin');
                        }}
                    >
                        <Text style={[globalStyle.btext, { color: 'black' }]}>{getString('로그인 비밀번호 변경')}</Text>
                        <Image source={require('@assets/icons/arrow/rightArrowDarkgray.png')} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default AccountInfo;
