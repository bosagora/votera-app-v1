/* eslint-disable @typescript-eslint/no-floating-promises */
import React, { useState, useCallback, useEffect } from 'react';
import { getLocale, setLocale } from '@utils/locales/STRINGS';
import {
    useGetFeedsConnectionLazyQuery,
    useLoginMutation,
    useUpdateUserMutation,
    useCreateMemberMutation,
    useUpdateMemberMutation,
    useDeleteMemberMutation,
} from '~/graphql/generated/generated';
import LocalStorage, {
    LocalStorageProps,
    LocalStorageUserProps,
    LocalStorageVoterCardProps,
} from '~/utils/LocalStorage';
import { ValidatorLogin } from '~/utils/voterautil';
import { AUTHCONTEXT_AUTH_COOKIE } from '../../config/keys';
import { generateHashPin } from '~/utils/crypto';
import client, { setToken, resetToken } from '~/graphql/client';
import push from '~/services/FcmService';
import { useCreatePush, useUpdatePush } from '~/graphql/hooks/Push';
import { useCreateFollow } from '~/graphql/hooks/Follow';

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
    setSnackbarMessage: (meesage: string) => void;
    setSnackbarVisible: (value: boolean) => void;
    visible: boolean;
    message: string;
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
    deleteVoterCard: (memberId: string, recovery?: boolean) => Promise<void>;
    getVoterCard: (memberId: string) => ValidatorLogin | null;
    getVoterName: (memberId: string) => string | null;
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
    feed: {},
};

function normalizeLocalStorage(storage: LocalStorageProps): LocalStorageProps {
    if (!storage) {
        return {
            user: {},
            members: [],
            groupBookmarks: [],
            activityBookmarks: [],
            searchHistory: [],
            feed: {
                isEtcNews: false,
                isLikeProposalsNews: false,
                isMyProposalsNews: false,
                isNewProposalNews: false,
            },
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
        feed: storage.feed || {
            isEtcNews: false,
            isLikeProposalsNews: false,
            isMyProposalsNews: false,
            isNewProposalNews: false,
        },
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

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
    const [userState, setUserState] = useState<User>();
    const [routeLoaded, setRouteLoaded] = useState(false);
    const [feedAddress, setFeedAddress] = useState<string | undefined>();
    const [feedCount, setFeedCount] = useState<number>(0);
    const [myMemberIds, setMyMemberIds] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [visible, setVisible] = useState(false);

    const [loaded, setLoaded] = useState(false);
    const [isGuest, setGuestMode] = useState(false);
    const [enrolled, setEnrolled] = useState(false);
    const [loginMutate] = useLoginMutation({ fetchPolicy: 'no-cache' });
    const [updateUserMutate] = useUpdateUserMutation({ fetchPolicy: 'no-cache' });
    const [createMemberMutate] = useCreateMemberMutation();
    const [updateMemberMutate] = useUpdateMemberMutation();
    const [deleteMemberMutate] = useDeleteMemberMutation();

    const createPush = useCreatePush();
    const updatePush = useUpdatePush();
    const createFollow = useCreateFollow();

    const [
        getFeedsConnections,
        { data: feedsConnectionData, refetch: refetchFeedConnection },
    ] = useGetFeedsConnectionLazyQuery({ fetchPolicy: 'no-cache' });

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
    }, []);

    const usePushUpdate = useCallback(
        async (feedAddress: string, targetMemberId: string) => {
            const pushUpdateHandler = async (feedAddress: string) => {
                const pushNotificationToken = await push.getPushNotificationTokenOnDevice();
                if (!pushNotificationToken) {
                    throw new Error('Fail to create PushToken');
                }

                const { token: pushToken, tokenStatus, enablePush } = pushNotificationToken;

                if (tokenStatus === 'NEW_TOKEN') {
                    const createdPush = await createPush(pushToken);
                    const pushId = createdPush?.data?.createPush?.push?.id as string;
                    if (!pushId) {
                        console.log('createPush failed');
                    }
                    const createdPushLocalStorageData = await push.useCreateTokenToLocalPushStorage(
                        pushId,
                        pushToken,
                        enablePush,
                    );

                    await createFollow(
                        feedAddress,
                        ['appAll', targetMemberId],
                        pushId,
                        createdPushLocalStorageData.enablePush,
                    ).catch(console.log);
                } else if (tokenStatus === 'RENEW_TOKEN') {
                    const updateTokenSet = await push.useUpdateTokenToLocalPushStorage(pushToken);
                    updatePush(updateTokenSet.id, updateTokenSet.token).catch(console.log);
                }
            };
            return pushUpdateHandler(feedAddress).catch((err) => {
                console.log('pushUpdate exception : ', err);
            });
        },
        [createPush, updatePush],
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
                    if (loginResult.data?.login) {
                        if (!loginResult.data.login.jwt) {
                            return {
                                succeeded: false,
                                message: 'password mismatched',
                            };
                        }

                        await usePushUpdate(userState.userId, userState.memberId).catch(console.log);

                        return {
                            succeeded: true,
                            user: { ...userState, token: loginResult.data.login.jwt },
                        };
                    }
                } else {
                    const loginResult = await loginMutate({ variables: { input: { identifier: mail, password } } });
                    if (loginResult.data?.login) {
                        if (!loginResult.data.login.jwt) {
                            return {
                                succeeded: false,
                                message: 'password mismatched',
                            };
                        }

                        const memberId = localStorage.user.memberId || localStorage.members[0].memberId;
                        const nodename = getVoterName(memberId) || '';
                        const userData = loginResult.data.login.user;
                        const loginUser: User = {
                            memberId,
                            nodename,
                            userId: userData.id,
                            username: userData.username,
                            mail,
                            validator: localStorage.user.userValidator,
                            token: loginResult.data.login.jwt,
                        };

                        setToken(loginResult.data.login.jwt);
                        setFeedAddress(userData.id);
                        setUserState(loginUser);
                        setMyMemberIds(localStorage.members.map((member) => member.memberId));
                        await usePushUpdate(userData.id, memberId).catch(console.log);
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
                const updateResult = await updateUserMutate({
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

                if (updateResult.data?.updateUser?.user) {
                    return;
                } else {
                    throw new Error('update password failed');
                }
            } catch (err) {
                console.log('updateUser exception : ', err);
                throw new Error('update password failed');
            }
        },
        [updateUserMutate, userState],
    );

    const signOut = useCallback(() => {
        if (userState) {
            setUserState(undefined);
        }
        feedAddress && setFeedAddress(feedAddress);
        setMyMemberIds([]);
        resetToken();
        client.clearStore().catch((err) => {
            console.log('clearStore error ', err);
        });
    }, [userState]);

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
                feedAddress && setFeedAddress(feedAddress);
                setUserState(undefined);
                setMyMemberIds([]);
                resetToken();
                setEnrolled(false);
            })
            .catch((err) => {
                console.log('LocalStorage.set error = ', err);
            });
    }, []);

    /**
     *
     */
    const fetchFeedConnection = useCallback(() => {
        getFeedsConnections({
            variables: {
                where: {
                    target: feedAddress,
                    isRead: false,
                },
            },
        });
    }, [feedAddress, getFeedsConnections]);

    useEffect(() => {
        if (feedsConnectionData) {
            setFeedCount(feedsConnectionData.feedsConnection?.aggregate?.count || 0);
        }
    }, [feedsConnectionData]);

    useEffect(() => {
        if (feedCount) {
            setFeedCount(feedCount);
        }
    }, [feedCount]);

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

            // if (feedAddress) {
            //     //pushID, pushToken, enablePush 없음 에러나서 주석처리
            //     const createdPushLocalStorageData = await push.useCreateTokenToLocalPushStorage(pushId, pushToken, enablePush);

            //     await createFollow(
            //         feedAddress,
            //         [addMember.id],
            //         createdPushLocalStorageData.id,
            //         createdPushLocalStorageData.enablePush,
            //     ).catch(console.log);
            // }

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

    const setSnackbarMessage = useCallback((msg: string) => {
        setMessage(msg);
    }, []);
    const setSnackbarVisible = useCallback((value: boolean) => {
        setVisible(value);
    }, []);

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
                setSnackbarMessage,
                setSnackbarVisible,
                visible,
                message,
                loaded,
                isGuest,
                setGuestMode,
                enrolled,
                resetEnroll,
                registerVoterCard,
                addVoterCard,
                changeVoterCard,
                changeVoterName,
                deleteVoterCard,
                getVoterCard,
                getVoterName,
                isValidVoterCard,
                setLocalUser,
                getLocalUser,
                getMember,
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
