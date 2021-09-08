/* eslint-disable @typescript-eslint/no-floating-promises */
import React, { useState, useCallback, useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { getLocale, setLocale } from '@utils/locales/STRINGS';
import {
    useGetFeedsConnectionLazyQuery,
    useLoginMutation,
    useUpdatePasswordMutation,
    useCreateMemberMutation,
    useUpdateMemberMutation,
    useDeleteMemberMutation,
    useUpdatePushTokenMutation,
} from '~/graphql/generated/generated';
import LocalStorage, { LocalStorageProps, LocalStorageUserProps } from '~/utils/LocalStorage';
import { ValidatorLogin } from '~/utils/voterautil';
import { AUTHCONTEXT_AUTH_COOKIE } from '../../config/keys';
import { generateHashPin } from '~/utils/crypto';
import client, { setToken, resetToken } from '~/graphql/client';
import pushService from '~/services/FcmService';
import { PushStatusType } from '~/types/pushType';

export type User = {
    memberId: string; // 현재 사용중인 memberId
    nodename: string; // 노드 이름
    userId: string; // 사용자 계정 userId
    username: string; // 사용자 계정 이름
    mail: string; // 로그인 identifier
    validator: string; // PIN 검증용 validator
    token?: string; // ID PWD 로그인 시 JWT Token
};

export type Member = {
    memberId: string;
    nodename: string;
    address: string;
    expiresIn: number;
};

type LoginResultType = {
    succeeded: boolean;
    user?: User;
    token?: string;
    message?: string;
};

type AuthContextState = {
    user?: User;
    login: (password: string) => Promise<LoginResultType>;
    changePassword: (password: string) => Promise<void>;
    signOut: () => void;
    routeLoaded: boolean;
    setRouteLoaded: (loaded: boolean) => void;
    myMemberIds: string[];
    feedAddress: string | undefined;
    feedCount: number;
    refetchFeedConnection: any;
    loaded: boolean; // LocalStorage Loading 여부
    isGuest: boolean;
    setGuestMode: (flag: boolean) => void;
    enrolled: boolean;
    resetEnroll: () => void;
    registerVoterCard: (
        memberId: string,
        nodeName: string,
        address: string,
        validatorLogin?: ValidatorLogin,
        reset?: boolean,
    ) => Promise<void>;
    addVoterCard: (nodeName: string, validatorLogin: ValidatorLogin) => Promise<string>;
    changeVoterCard: (memberId: string) => Promise<void>;
    changeVoterName: (memberId: string, nodeName: string) => Promise<void>;
    updateVoterCard: (memberId: string, validatorLogin: ValidatorLogin) => Promise<void>;
    deleteVoterCard: (memberId: string, recovery?: boolean) => Promise<void>;
    getVoterCard: (memberId: string) => ValidatorLogin | null;
    getVoterName: (memberId: string) => string | null;
    getVoteSequence: () => number;
    isValidVoterCard: (memberId: string) => boolean;
    setLocalUser: (user: User) => Promise<void>;
    getLocalUser: () => User;
    getMember: (memberId: string) => Member | null;
};

type UserCookieType = {
    locale?: string;
};

export const AuthContext = React.createContext<AuthContextState>(null);

export const useUser = (): User | undefined => {
    const { user } = React.useContext(AuthContext);
    return user;
};

type AuthProviderProps = {
    children: React.ReactNode;
};

let userCookie: UserCookieType;

function normalizeUserCookie(storage: UserCookieType): UserCookieType {
    if (!storage) {
        return {};
    }
    return storage;
}

let localStorage: LocalStorageProps = {
    user: {},
    members: [],
    groupBookmarks: [],
    activityBookmarks: [],
    searchHistory: [],
};

function normalizeLocalStorage(storage: LocalStorageProps): LocalStorageProps {
    if (!storage) {
        return {
            user: {},
            members: [],
            groupBookmarks: [],
            activityBookmarks: [],
            searchHistory: [],
        };
    }
    if (
        storage.user &&
        storage.members &&
        storage.groupBookmarks &&
        storage.activityBookmarks &&
        storage.searchHistory
    ) {
        return storage;
    }
    return {
        user: storage.user || {},
        members: storage.members || [],
        groupBookmarks: storage.groupBookmarks || [],
        activityBookmarks: storage.activityBookmarks || [],
        searchHistory: storage.searchHistory || [],
    };
}

function getVoterCard(memberId: string): ValidatorLogin | null {
    const found = localStorage.members.find((member) => member.memberId === memberId);
    return found && found.votercard ? ValidatorLogin.fromString(found.votercard) : null;
}

function getVoterName(memberId: string): string | null {
    const found = localStorage.members.find((member) => member.memberId === memberId);
    return found ? found.nodeName : null;
}

function isValidVoterCard(memberId: string): boolean {
    const found = localStorage.members.find((member) => member.memberId === memberId);
    if (found && found.votercard) {
        const validatorLogin = ValidatorLogin.fromString(found.votercard);
        if (!validatorLogin) {
            return false;
        }
        if (!validatorLogin.private_key || !validatorLogin.validator || !validatorLogin.voter_card) {
            return false;
        }
        if (!validatorLogin.voter_card.verify()) {
            return false;
        }

        const expiresIn = new Date(validatorLogin.voter_card.expires);
        return expiresIn.getTime() > Date.now();
    }
    return false;
}

function getLocalStorageUser(): LocalStorageUserProps {
    return localStorage.user;
}

async function setLocalStorageUser(user: LocalStorageUserProps) {
    localStorage.user = user;
    await LocalStorage.set(localStorage);
}

function getMember(memberId: string): Member | null {
    const found = localStorage.members.find((member) => member.memberId === memberId);
    return found
        ? {
              memberId: found.memberId,
              nodename: found.nodeName,
              address: found.validator,
              expiresIn: found.expiresIn,
          }
        : null;
}

function getLocalUser(): User {
    const stUser = getLocalStorageUser();
    const localUser: User = {
        memberId: stUser.memberId || '',
        nodename: '',
        userId: '',
        username: stUser.userName || '',
        mail: stUser.userEmail || '',
        validator: stUser.userValidator || '',
    };
    return localUser;
}

const MAX_VOTE_SEQUENCE = 2^31 - 1;

function getVoteSequence() {
    return Math.floor(Date.now() / 1000);
}

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
    const [userState, setUserState] = useState<User>();
    const [routeLoaded, setRouteLoaded] = useState(false);
    const [feedAddress, setFeedAddress] = useState<string | undefined>();
    const [feedCount, setFeedCount] = useState<number>(0);
    const [myMemberIds, setMyMemberIds] = useState<string[]>([]);

    const [loaded, setLoaded] = useState(false);
    const [isGuest, setGuestMode] = useState(false);
    const [enrolled, setEnrolled] = useState(false);
    const [loginMutate] = useLoginMutation({ fetchPolicy: 'no-cache' });
    const [updatePasswordMutate] = useUpdatePasswordMutation({ fetchPolicy: 'no-cache' });
    const [createMemberMutate] = useCreateMemberMutation();
    const [updateMemberMutate] = useUpdateMemberMutation();
    const [deleteMemberMutate] = useDeleteMemberMutation();

    const [updatePushTokenMutate] = useUpdatePushTokenMutation();

    const [
        getFeedsConnections,
        { data: feedsConnectionData, refetch: refetchFeedConnection },
    ] = useGetFeedsConnectionLazyQuery({
        fetchPolicy: 'no-cache',
        onCompleted: (data) => {
            if (data.feedsConnection?.aggregate) {
                setFeedCount(data.feedsConnection.aggregate.count || 0);
            }
        }
    });

    const initializeAuthContext = useCallback(async () => {
        localStorage = normalizeLocalStorage(await LocalStorage.get());
        if (localStorage.user.userEmail && localStorage.user.userValidator) {
            setEnrolled(true);
        }

        userCookie = normalizeUserCookie(await LocalStorage.getByKey(AUTHCONTEXT_AUTH_COOKIE));
        if (userCookie.locale) {
            localStorage.user.locale = userCookie.locale;
        }
        if (localStorage.user.locale) {
            setLocale(localStorage.user.locale);
        }

        console.log('localStorage : ', localStorage);

        setLoaded(true);
    }, []);

    // 최초 시점에 LocalStorage에서 읽어와서 Loading
    useEffect(() => {
        initializeAuthContext().catch((err) => {
            console.log('init error = ', err);
        });

        let unsubMessage: () => void;
        let unsubNotification: () => void;
        let unsubRefresh: () => void;

        const pushInit = async () => {
            const tokenOnDevice = await pushService.getPushNotificationTokenOnDevice();
            if (tokenOnDevice) {
                unsubNotification = messaging().onNotificationOpenedApp((message) => {
                });
                unsubMessage = messaging().onMessage((message) => {
                });
                unsubRefresh = messaging().onTokenRefresh((token) => {
                    pushService.updateRefreshTokenOnLocalStorage(token)
                        .catch((err) => {
                            console.log('updateRefreshTokenOnLocalStorage error : ', err);
                        });
                });
            }
        };

        pushInit().catch((err) => {
            console.log('pushInit error : ', err);
        })

        return () => {
            if (unsubMessage) unsubMessage();
            if (unsubNotification) unsubNotification();
            if (unsubRefresh) unsubRefresh();
        }
    }, []);

    const pushUpdate = useCallback(
        async (userId: string) => {
            const pushChanged = await pushService.checkPushTokenChangeOnLocalStorage();
            if (!pushChanged) {
                return;
            }

            const tokenOnDevice = await pushService.getPushNotificationTokenOnDevice();
            if (!tokenOnDevice) {
                await pushService.disablePushTokenOnLocalStorage();
            } else if (tokenOnDevice.tokenStatus === PushStatusType.NEW_TOKEN) {
                const result = await updatePushTokenMutate({
                    variables: {
                        input: {
                            where: { id: userId },
                            data: { pushToken: tokenOnDevice.token },
                        },
                    },
                });
                if (result.data?.updateUserPushToken?.userFeed?.id
                    && result.data?.updateUserPushToken?.userFeed?.pushes
                    && result.data?.updateUserPushToken?.userFeed?.pushes.length > 0) {
                    const push = result.data.updateUserPushToken.userFeed.pushes[0];
                    if (push?.id) {
                        await pushService.updatePushTokenOnLocalStorage(push.id, tokenOnDevice.token, push.isActive);
                    }
                }
            } else if (tokenOnDevice.tokenStatus === PushStatusType.RENEW_TOKEN) {
                const data = await pushService.getCurrentPushLocalStorage();
                if (data?.id) {
                    const result = await updatePushTokenMutate({
                        variables: {
                            input: {
                                where: { id: userId },
                                data: {
                                    pushId: data.id,
                                    pushToken: tokenOnDevice.token,
                                },
                            },
                        },
                    });
                    if (result.data?.updateUserPushToken?.userFeed?.id
                        && result.data?.updateUserPushToken?.userFeed?.pushes
                        && result.data?.updateUserPushToken?.userFeed?.pushes.length > 0) {
                        const push = result.data.updateUserPushToken.userFeed.pushes[0];
                        if (push?.id) {
                            await pushService.updatePushTokenOnLocalStorage(data.id, tokenOnDevice.token, push.isActive);
                        }
                    }
                }
            } else {
                const data = await pushService.getCurrentPushLocalStorage();
                if (data?.id) {
                    // TODO : read current status from database
                    await pushService.updatePushTokenOnLocalStorage(data.id, tokenOnDevice.token, data.enablePush);
                }
            }
        },
        [updatePushTokenMutate],
    );

    const login = useCallback(
        async (pin: string): Promise<LoginResultType> => {
            if (!localStorage.user.userValidator || !localStorage.user.userEmail) {
                return {
                    succeeded: false,
                    message: 'not enrolled device',
                };
            }

            const mail = localStorage.user.userEmail;
            const password = generateHashPin(pin, localStorage.user.userValidator);

            try {
                resetToken();

                if (userState) {
                    const loginResult = await loginMutate({ variables: { input: { identifier: mail, password } } });
                    if (loginResult.data?.loginEx) {
                        if (!loginResult.data.loginEx.jwt) {
                            return {
                                succeeded: false,
                                message: 'password mismatched',
                            };
                        }

                        setToken(loginResult.data.loginEx.jwt);

                        await pushUpdate(userState.userId).catch((err) => {
                            console.log('pushUpdate error : ', err);
                        });

                        if (loginResult.data.loginEx.user?.user_feed) {
                            const userFeed = loginResult.data.loginEx.user?.user_feed;
                            pushService.setUserAlarmStatus({
                                isMyProposalsNews: userFeed.myProposalsNews,
                                isNewProposalNews: userFeed.newProposalsNews,
                                isLikeProposalsNews: userFeed.likeProposalsNews,
                                isMyCommentNews: userFeed.myCommentsNews,
                                isEtcNews: userFeed.etcNews,
                            });
                        }

                        return {
                            succeeded: true,
                            user: { ...userState, token: loginResult.data.loginEx.jwt },
                        };
                    }
                } else {
                    const loginResult = await loginMutate({ variables: { input: { identifier: mail, password } } });
                    if (loginResult.data?.loginEx) {
                        if (!loginResult.data.loginEx.jwt) {
                            return {
                                succeeded: false,
                                message: 'password mismatched',
                            };
                        }

                        const memberId = localStorage.user.memberId || localStorage.members[0].memberId;
                        const nodename = getVoterName(memberId) || '';
                        const userData = loginResult.data.loginEx.user;
                        const loginUser: User = {
                            memberId,
                            nodename,
                            userId: userData.id,
                            username: userData.username,
                            mail,
                            validator: localStorage.user.userValidator,
                            token: loginResult.data.loginEx.jwt,
                        };

                        setToken(loginResult.data.loginEx.jwt);
                        setFeedAddress(userData.user_feed?.id);
                        setUserState(loginUser);
                        setMyMemberIds(localStorage.members.map((member) => member.memberId));

                        await pushUpdate(userData.id).catch((err) => {
                            console.log('pushUpdate error : ', err);
                        });

                        if (loginResult.data.loginEx.user.user_feed) {
                            const userFeed = loginResult.data.loginEx.user.user_feed;
                            pushService.setUserAlarmStatus({
                                isMyProposalsNews: userFeed.myProposalsNews,
                                isNewProposalNews: userFeed.newProposalsNews,
                                isLikeProposalsNews: userFeed.likeProposalsNews,
                                isMyCommentNews: userFeed.myCommentsNews,
                                isEtcNews: userFeed.etcNews,
                            });
                        }
                        
                        return {
                            succeeded: true,
                            user: loginUser,
                        };
                    }
                }

                return {
                    succeeded: false,
                    message: 'server response error',
                };
            } catch (err) {
                console.log('login exception : ', err);
                if (err.graphQLErrors) {
                    console.log('graphQLErrors = ', err.graphQLErrors);
                }
                if (err.networkError) {
                    console.log('networkError = ', err.networkError);
                }
                return {
                    succeeded: false,
                    message: 'internal error',
                };
            }
        },
        [loginMutate, userState],
    );

    const changePassword = useCallback(
        async (pin: string) => {
            if (!userState) {
                throw new Error('not authenticated user');
            }

            const id = userState.userId;
            const password = generateHashPin(pin, userState.validator);

            try {
                const updateResult = await updatePasswordMutate({
                    variables: {
                        input: {
                            where: {
                                id,
                            },
                            data: {
                                password,
                            },
                        },
                    },
                });

                if (updateResult.data?.updatePassword?.user) {
                    return;
                } else {
                    throw new Error('update password failed');
                }
            } catch (err) {
                console.log('updateUser exception : ', err);
                throw new Error('update password failed');
            }
        },
        [updatePasswordMutate, userState],
    );

    const signOut = useCallback(() => {
        setFeedAddress(undefined);
        setUserState(undefined);
        setMyMemberIds([]);
        setFeedCount(0);
        resetToken();
        client.clearStore().catch((err) => {
            console.log('clearStore error ', err);
        });
    }, []);

    const setLocalUser = useCallback(async (user: User) => {
        const localUser = getLocalStorageUser();

        localUser.userEmail = user.mail;
        localUser.userValidator = user.validator;
        localUser.userName = user.username;
        localUser.memberId = user.memberId;

        await setLocalStorageUser(localUser);
    }, []);

    const resetEnroll = useCallback(() => {
        localStorage.user = {};
        localStorage.members = [];
        LocalStorage.set(localStorage)
            .then(() => {
                setFeedAddress(undefined);
                setUserState(undefined);
                setMyMemberIds([]);
                setEnrolled(false);
                setFeedCount(0);
                resetToken();
            })
            .catch((err) => {
                console.log('LocalStorage.set error = ', err);
            });
    }, []);

    /**
     *
     */
    const fetchFeedConnection = useCallback(() => {
        if (userState?.userId) {
            getFeedsConnections({
                variables: {
                    where: {
                        target: userState.userId,
                        isRead: false,
                    },
                },
            });
        }
    }, [userState?.userId, getFeedsConnections]);

    const registerVoterCard = useCallback(
        async (
            memberId: string,
            nodeName: string,
            address: string,
            validatorLogin?: ValidatorLogin,
            reset?: boolean,
        ) => {
            const expires = validatorLogin ? new Date(validatorLogin.voter_card.expires) : new Date(0);
            const validator = validatorLogin ? validatorLogin.validator : address;
            if (reset) {
                localStorage.members = [
                    {
                        memberId,
                        nodeName,
                        validator,
                        votercard: validatorLogin?.toString() || '',
                        expiresIn: expires.getTime(),
                    },
                ];
            } else {
                const findIndex = localStorage.members.findIndex((member) => member.memberId === memberId);
                if (findIndex < 0) {
                    localStorage.members.push({
                        memberId,
                        nodeName,
                        validator,
                        votercard: validatorLogin?.toString() || '',
                        expiresIn: expires.getTime(),
                    });
                } else {
                    localStorage.members[findIndex].nodeName = nodeName;
                    localStorage.members[findIndex].validator = validator;
                    localStorage.members[findIndex].votercard = validatorLogin?.toString() || '';
                    localStorage.members[findIndex].expiresIn = expires.getTime();
                }
            }
            await LocalStorage.set(localStorage);
            setMyMemberIds(localStorage.members.map((member) => member.memberId));
        },
        [],
    );

    const addVoterCard = useCallback(
        async (nodeName: string, validatorLogin: ValidatorLogin) => {
            if (!validatorLogin?.validator || !validatorLogin.voter_card) {
                throw new Error('invalid VoterCard');
            } else if (!validatorLogin.voter_card.verify()) {
                throw new Error('invalid VoterCard');
            }

            const addResult = await createMemberMutate({
                variables: {
                    input: {
                        data: {
                            username: nodeName,
                            address: validatorLogin.validator,
                            voterCard: validatorLogin.getStringVoterCard(),
                        },
                    },
                },
            });

            if (!addResult.data?.createMember?.member) {
                throw new Error('Fail to add Node');
            }

            const addMember = addResult.data.createMember.member;
            const findIndex = localStorage.members.findIndex((member) => member.memberId === addMember.id);
            const expires = new Date(validatorLogin.voter_card.expires);
            if (findIndex < 0) {
                localStorage.members.push({
                    memberId: addMember.id,
                    nodeName,
                    validator: validatorLogin.validator,
                    votercard: validatorLogin.toString(),
                    expiresIn: expires.getTime(),
                });
            } else {
                localStorage.members[findIndex].nodeName = nodeName;
                localStorage.members[findIndex].validator = validatorLogin.validator;
                localStorage.members[findIndex].votercard = validatorLogin.toString();
                localStorage.members[findIndex].expiresIn = expires.getTime();
            }

            await LocalStorage.set(localStorage);
            setMyMemberIds(localStorage.members.map((member) => member.memberId));
            return addMember.id;
        },
        [createMemberMutate],
    );

    const changeVoterCard = useCallback(
        async (memberId: string) => {
            const findIndex = localStorage.members.findIndex((member) => member.memberId === memberId);
            if (findIndex < 0) {
                throw new Error('invalid input');
            } else if (!userState) {
                throw new Error('invalid user state');
            }

            const localUser = getLocalStorageUser();
            localUser.memberId = localStorage.members[findIndex].memberId;
            await setLocalStorageUser(localUser);

            const newUser: User = { ...userState };
            newUser.memberId = localStorage.members[findIndex].memberId;
            newUser.nodename = localStorage.members[findIndex].nodeName;
            setUserState(newUser);
        },
        [userState],
    );

    const changeVoterName = useCallback(
        async (memberId: string, nodeName: string) => {
            const updateResult = await updateMemberMutate({
                variables: {
                    input: {
                        where: {
                            id: memberId,
                        },
                        data: {
                            username: nodeName,
                        },
                    },
                },
            });

            if (!updateResult?.data?.updateMember?.member) {
                throw new Error('Fail to update node name');
            }

            const findIndex = localStorage.members.findIndex((member) => member.memberId === memberId);
            if (findIndex >= 0) {
                localStorage.members[findIndex].nodeName = nodeName;
            }
            if (memberId === userState?.memberId) {
                const newUser = { ...userState };
                newUser.nodename = nodeName;
                setUserState(newUser);
            }
            await LocalStorage.set(localStorage);
        },
        [updateMemberMutate, userState],
    );

    const updateVoterCard = useCallback(
        async (memberId: string, validatorLogin: ValidatorLogin) => {
            if (!validatorLogin?.validator || !validatorLogin.voter_card) {
                throw new Error('invalid VoterCard');
            } else if (!validatorLogin.voter_card.verify()) {
                throw new Error('invalid VoterCard');
            }

            const findIndex = localStorage.members.findIndex((member) => member.memberId === memberId);
            if (findIndex < 0) {
                throw new Error('member notFound');
            } else if (localStorage.members[findIndex].validator !== validatorLogin.validator) {
                throw new Error('member inconsistent validator');
            }

            const expires = validatorLogin ? new Date(validatorLogin.voter_card.expires) : new Date(0);
            const voterCard = validatorLogin.getStringVoterCard();

            const updateResult = await updateMemberMutate({
                variables: {
                    input: {
                        where: {
                            id: memberId,
                        },
                        data: {
                            voterCard,
                        }
                    },
                },
            });

            if (updateResult.data?.updateMember?.member?.id) {
                localStorage.members[findIndex].votercard = validatorLogin?.toString() || '',
                localStorage.members[findIndex].expiresIn = expires.getTime();

                await LocalStorage.set(localStorage);
            }
        },
        [updateMemberMutate],
    );

    const deleteVoterCard = useCallback(
        async (memberId: string, recovery?: boolean) => {
            if (!recovery) {
                await deleteMemberMutate({
                    variables: {
                        input: {
                            where: {
                                id: memberId,
                            },
                        },
                    },
                });
            }

            const findIndex = localStorage.members.findIndex((member) => member.memberId === memberId);
            if (findIndex < 0) {
                return;
            }

            localStorage.members = localStorage.members.filter((member) => member.memberId !== memberId);
            if (memberId === userState?.memberId) {
                const newUser = { ...userState };
                if (localStorage.members.length > 0) {
                    newUser.memberId = localStorage.members[0].memberId;
                    newUser.nodename = localStorage.members[0].nodeName;
                } else {
                    newUser.memberId = '';
                    newUser.nodename = '';
                }
                setUserState(newUser);
            }
            await LocalStorage.set(localStorage);
            setMyMemberIds(localStorage.members.map((member) => member.memberId));
        },
        [deleteMemberMutate, userState],
    );

    return (
        <AuthContext.Provider
            value={{
                user: userState,
                login,
                changePassword,
                signOut,
                routeLoaded,
                setRouteLoaded,
                myMemberIds,
                feedAddress,
                feedCount,
                refetchFeedConnection,
                loaded,
                isGuest,
                setGuestMode,
                enrolled,
                resetEnroll,
                registerVoterCard,
                addVoterCard,
                changeVoterCard,
                changeVoterName,
                updateVoterCard,
                deleteVoterCard,
                getVoterCard,
                getVoterName,
                isValidVoterCard,
                setLocalUser,
                getLocalUser,
                getMember,
                getVoteSequence,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const currentLocale = (): string => {
    return localStorage.user.locale || getLocale();
};

export const changeLocale = (locale: string): void => {
    setLocale(locale);
    // locale 설정 변경건으로는 백업하지 않음
    localStorage.user.locale = locale;
    userCookie.locale = locale;
    LocalStorage.setByKey(AUTHCONTEXT_AUTH_COOKIE, userCookie).catch((err) => {
        console.log('LocalStorage setByKey error : ', err);
    });
};
