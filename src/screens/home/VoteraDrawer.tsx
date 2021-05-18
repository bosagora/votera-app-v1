import React, { useContext, useEffect, useState } from 'react';
import { View, TouchableOpacity, Image, Platform } from 'react-native';
import { DrawerContentScrollView, useIsDrawerOpen } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from 'styled-components/native';
import { useDispatch } from 'react-redux';
import { Button, Text, Icon } from 'react-native-elements';
import { AuthContext } from '~/contexts/AuthContext';
import globalStyle from '~/styles/global';
import ActionCreators from '~/state/actions';
import { useGetFeedsConnectionQuery } from '~/graphql/generated/generated';
import getString from '~/utils/locales/STRINGS';

const VoteraDrawer = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const themeContext = useContext(ThemeContext);
    const dispatch = useDispatch();
    const { user, isGuest, feedAddress, myMemberIds } = useContext(AuthContext);
    const [notReadFeedsCount, setNotReadFeedsCount] = useState(0);

    const { data: feedsConnectionData } = useGetFeedsConnectionQuery({
        skip: !feedAddress,
        variables: {
            where: {
                target: feedAddress,
                isRead: false,
                rejectId_ne: user?.memberId,
            },
        },
    });

    useEffect(() => {
        if (feedsConnectionData) {
            setNotReadFeedsCount(feedsConnectionData.feedsConnection?.aggregate?.count || 0);
        }
    }, [feedsConnectionData]);

    return (
        <DrawerContentScrollView
            contentContainerStyle={[
                {
                    flex: 1,
                    paddingTop: insets.top + 25,
                    paddingLeft: 40,
                    paddingRight: 40,
                },
            ]}
        >
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => navigation.navigate('Feed')}>
                        <Icon size={28} name="notifications" color={'rgb(91,194,217)'} />
                        {notReadFeedsCount !== 0 && (
                            <View
                                style={[
                                    globalStyle.center,
                                    {
                                        position: 'absolute',
                                        width: 25.4,
                                        height: 25.4,
                                        borderRadius: 12.7,
                                        backgroundColor: themeContext.color.disagree,
                                        top: -3,
                                        left: 15.5,
                                        borderWidth: 1,
                                        borderColor: 'white',
                                    },
                                ]}
                            >
                                <Text style={[globalStyle.gbtext, { fontSize: 11, color: 'white' }]}>
                                    {notReadFeedsCount}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <Button
                        icon={<Image source={require('@assets/icons/drawer/closeIconLightgray.png')} />}
                        onPress={() => navigation.closeDrawer()}
                        type="clear"
                    />
                </View>

                <View style={{ marginTop: 40 }}>
                    <Text style={{ color: themeContext.color.primary }}>{getString('계정이름')}</Text>
                    <Text
                        style={[
                            globalStyle.gbtext,
                            {
                                fontSize: 22,
                                lineHeight: 30,
                                marginTop: Platform.OS === 'android' ? 0 : 10,
                                color: themeContext.color.primary,
                            },
                        ]}
                    >
                        {user?.username || (isGuest ? 'Guest' : 'User 없음')}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[globalStyle.flexRowBetween, { marginTop: Platform.OS === 'android' ? 20 : 40 }]}
                    onPress={() => {
                        if (isGuest) {
                            // Guest 모드일 때 어떻게 ?
                            dispatch(
                                ActionCreators.snackBarVisibility({
                                    visibility: true,
                                    text: '둘러보기 중에는 사용할 수 없습니다',
                                }),
                            );
                        } else {
                            navigation.navigate('ProposalList', {
                                type: 'JOIN',
                                query: { member_in: myMemberIds },
                            });
                        }
                    }}
                >
                    <Text style={[globalStyle.btext, { fontSize: 16 }]}>{getString('내가 참여한 제안')}</Text>
                    <View style={[globalStyle.center, { width: 30, height: 30 }]}>
                        <Image source={require('@assets/icons/arrow/rightArrowDarkgray.png')} />
                    </View>
                </TouchableOpacity>
                <View
                    style={{
                        height: 1,
                        backgroundColor: 'rgb(235,234,239)',
                        marginTop: Platform.OS === 'android' ? 15 : 33,
                    }}
                />

                <View style={{ marginTop: Platform.OS === 'android' ? 28 : 56 }}>
                    <Text style={[globalStyle.btext, { fontSize: 16 }]}>{getString('제안 작성')}</Text>
                    <TouchableOpacity
                        style={[globalStyle.flexRowBetween, { marginTop: Platform.OS === 'android' ? 5 : 14 }]}
                        onPress={() => {
                            navigation.navigate('CreateScreens', {
                                screen: 'CreateProposal',
                            });
                        }}
                    >
                        <Text>{getString('신규제안 작성')}</Text>
                        <View style={[globalStyle.center, { width: 30, height: 30 }]}>
                            <Image source={require('@assets/icons/arrow/rightArrowDarkgray.png')} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[globalStyle.flexRowBetween, { marginTop: Platform.OS === 'android' ? 0 : 9 }]}
                        onPress={() => {
                            navigation.navigate('ProposalList', {
                                type: 'TEMP',
                                query: {},
                            });
                        }}
                    >
                        <Text>{getString('임시저장 제안')}</Text>
                        <View style={[globalStyle.center, { width: 30, height: 30 }]}>
                            <Image source={require('@assets/icons/arrow/rightArrowDarkgray.png')} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[globalStyle.flexRowBetween, { marginTop: Platform.OS === 'android' ? 0 : 9 }]}
                        onPress={() => {
                            if (isGuest) {
                                dispatch(
                                    ActionCreators.snackBarVisibility({
                                        visibility: true,
                                        text: '둘러보기 중에는 사용할 수 없습니다',
                                    }),
                                );
                            } else {
                                navigation.navigate('ProposalList', {
                                    type: 'MY',
                                    query: { creator_in: myMemberIds },
                                });
                            }
                        }}
                    >
                        <Text>{getString('내가 작성한 제안')}</Text>
                        <View style={[globalStyle.center, { width: 30, height: 30 }]}>
                            <Image source={require('@assets/icons/arrow/rightArrowDarkgray.png')} />
                        </View>
                    </TouchableOpacity>
                </View>

                <View
                    style={{
                        height: 1,
                        backgroundColor: 'rgb(235,234,239)',
                        marginTop: Platform.OS === 'android' ? 15 : 33,
                        marginBottom: 26,
                    }}
                />

                <TouchableOpacity style={globalStyle.flexRowBetween} onPress={() => navigation.navigate('Settings')}>
                    <Text style={[globalStyle.btext, { fontSize: 16 }]}>{getString('설정')}</Text>
                    <View style={[globalStyle.center, { width: 30, height: 30 }]}>
                        <Image source={require('@assets/icons/arrow/rightArrowDarkgray.png')} />
                    </View>
                </TouchableOpacity>
            </View>

            {/* <Text style={{ fontSize: 10 }}>{`Version : ${version}`}</Text> */}
            {/* <RText style={{ fontSize: 10 }}>{`Server connect to : ${Config.SERVER_URL}`}</RText> */}
        </DrawerContentScrollView>
    );
};

export default VoteraDrawer;
