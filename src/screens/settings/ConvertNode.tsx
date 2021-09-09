import React, { useContext, useEffect, useState } from 'react';
import { View, Image, Alert } from 'react-native';
import { Button, Icon, Text } from 'react-native-elements';
import { useDispatch } from 'react-redux';
import * as Application from 'expo-application';
import { MainDrawerProps } from '~/navigation/types/MainDrawerParams';
import globalStyle from '~/styles/global';
import NowNode from '~/components/input/SingleLineInput2';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { ThemeContext } from 'styled-components/native';
import ActionCreators from '~/state/actions';
import { AuthContext } from '~/contexts/AuthContext';
import CommonButton from '~/components/button/CommonButton';
import { getAppUpdate } from '~/utils/device';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import getString from '~/utils/locales/STRINGS';

const ConvertNode = ({ navigation, route }: MainDrawerProps<'ConvertNode'>): JSX.Element => {
    const themeContext = useContext(ThemeContext);
    const dispatch = useDispatch();
    const { user, isGuest, signOut, setGuestMode, myMemberIds, getVoterName, deleteVoterCard, changeVoterCard } = useContext(AuthContext);
    const [nodes, setNodes] = useState(myMemberIds.filter((m) => m !== user?.memberId));

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerTitleAlign: 'center',
            headerTitle: () => <Text style={globalStyle.headerTitle}>{getString('노드 변경/추가')}</Text>,
            headerLeft: () => (
                <Button
                    onPress={() => navigation.goBack()}
                    icon={<Image source={require('@assets/icons/arrow/backArrowBlack.png')} />}
                    type="clear"
                />
            ),
        });
    }, [navigation]);

    useEffect(() => {
        setNodes(myMemberIds.filter((m) => m !== user?.memberId));
    }, [myMemberIds, user]);

    const onClickSignout = () => {
        if (isGuest) {
            setGuestMode(false);
        } else {
            signOut();
        }
    };

    const onClickRemoveNode = (memberId: string, nickname: string | null) => {
        Alert.alert(getString('노드 삭제'), getString('${nickname} 를 삭제하시겠습니까?').replace('${nickname}', nickname || ''), [
            {
                text: getString('취소'),
                onPress: () => {
                    console.log('Cancel Pressed');
                },
                style: 'cancel',
            },
            {
                text: getString('확인'),
                onPress: () => {
                    dispatch(ActionCreators.loadingAniModal({ visibility: true }));
                    deleteVoterCard(memberId)
                        .then(() => {
                            dispatch(ActionCreators.loadingAniModal({ visibility: false }));
                            dispatch(ActionCreators.snackBarVisibility({ visibility: true, text: getString('삭제했습니다') }));
                        })
                        .catch((err) => {
                            console.log('deleteVoterCard error : ', err);
                            dispatch(ActionCreators.loadingAniModal({ visibility: false }));
                            dispatch(
                                ActionCreators.snackBarVisibility({
                                    visibility: true,
                                    text: getString('노드 삭제 중 오류 발생헀습니다'),
                                }),
                            );
                        });
                },
            },
        ]);
    };

    const onClickAddNode = () => {
        if (isGuest) {
            dispatch(ActionCreators.snackBarVisibility({
                visibility: true,
                text: getString('둘러보기 중에는 사용할 수 없습니다')
            }));
        } else {
            navigation.navigate('AddNode');
        }
    };

    const onClickChangeNode = (memberId: string) => {
        changeVoterCard(memberId).catch((err) => {
            dispatch(
                ActionCreators.snackBarVisibility({
                    visibility: true,
                    text: getString('노드 변경 시 오류 발생'),
                }),
            );
        });
    };

    function renderNodes({ item }: { item: string }) {
        const nickname = getVoterName(item);
        return (
            <CommonButton
                onPress={() => {
                    onClickChangeNode(item);
                }}
                title={nickname || ''}
                titleStyle={{ paddingLeft: 10, fontFamily: 'GmarketSansTTFBold' }}
                buttonStyle={{ justifyContent: 'space-between' }}
                icon={
                    <Icon
                        onPress={() => {
                            onClickRemoveNode(item, nickname);
                        }}
                        name="cancel"
                        color={themeContext.color.primary}
                        size={30}
                    />
                }
            />
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor="white" />
            <FlatList
                ListHeaderComponent={
                <>
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
                        <Text style={[globalStyle.btext, { marginBottom: 15 }]}>{getString('현재 로그인한 노드')}</Text>
                        {!isGuest && (
                            <NowNode
                                searchValue={user?.nodename || ''}
                                value={user?.nodename}
                                inputStyle={{ fontFamily: 'GmarketSansTTFBold' }}
                                koreanInput
                                placeholderText=""
                                textDisable
                            />
                        )}
                    </View>
                    <TouchableOpacity
                        style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 18 }}
                        onPress={onClickSignout}
                    >
                        <Text style={{ fontSize: 13, color: themeContext.color.primary, textDecorationLine: 'underline' }}>
                            {getString('로그아웃')}
                        </Text>
                    </TouchableOpacity>
                    <View style={{ paddingTop: 23 }}>
                        <Text style={[globalStyle.btext, { marginBottom: 15 }]}>{getString('등록된 다른 인증 노드')}</Text>
                    </View>
                </>
                }
                keyExtractor={(item, index) => 'node_' + index}
                data={nodes}
                renderItem={renderNodes}
                style={{ paddingHorizontal: 22, paddingTop: 0 }}
                ListEmptyComponent={
                    <Text style={{ fontSize: 13 }}>{getString('등록되어 있는 다른 노드가 없습니다&#46;')}</Text>
                }
                ListFooterComponent={
                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingTop: 23 }}
                    onPress={onClickAddNode}
                >
                    <Text style={[globalStyle.mtext, { color: themeContext.color.primary }]}>{getString('노드 추가인증')}</Text>
                    <View
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: 19,
                            width: 29,
                            height: 29,
                            borderColor: themeContext.color.boxBorder,
                            borderRadius: 20,
                            borderWidth: 2,
                        }}
                    >
                        <Image source={require('@assets/icons/nodePlusSvg.png')} />
                    </View>
                </TouchableOpacity>
                }
            />
        </View>
    );
};

export default ConvertNode;
