import { Platform, PlatformOSType } from 'react-native';
import LocalStorage, { LocalStoragePushProps } from '~/utils/LocalStorage';
import messaging from '@react-native-firebase/messaging';
import Constants from 'expo-constants';
import { PushStatusType } from '~/types/pushType';

const PushServiceLocation = 'PushServiceProp';

function isValidPlatform() {
    if (!Constants.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return false;
    }
    return true;
}

async function getLocalPushStorage() {
    const localData: LocalStoragePushProps = (await LocalStorage.getByKey(
        PushServiceLocation,
    )) as LocalStoragePushProps;
    return localData;
}

async function updateLocalPushStorage(updatedLocalStorage: LocalStoragePushProps) {
    try {
        await LocalStorage.setByKey(PushServiceLocation, updatedLocalStorage);
    } catch (e) {
        console.log(e);
    }
    return updatedLocalStorage;
}
/**
 * 토큰을 얻습니다.
 * @returns
 */
async function getToken() {
    const token = await messaging().getToken();
    console.log('🚀 ~ getToken', token);
    return token;
}

/**
 * 토큰의 권한을 가져옵니다.
 * @returns
 */
async function getPushTokenPermission() {
    const pushTokenPermission = await messaging().hasPermission();
    return pushTokenPermission;
}

/**
 * 권한을 요청합니다
 */
async function requestPushTokenPermission() {
    const authorized = await messaging().requestPermission();
    return authorized;
}

async function getTokenStatus() {
    const fcmToken = await getToken();
    const pushLocalData: LocalStoragePushProps = await getLocalPushStorage();

    if (!pushLocalData) {
        return PushStatusType.NEW_TOKEN;
    }
    if (pushLocalData.token !== fcmToken) {
        return PushStatusType.RENEW_TOKEN;
    }
    return PushStatusType.USING_TOKEN;
}

async function getPushTokenRequestStatus() {
    const pushTokenPermissionOnDevice = await getPushTokenPermission();
    // if (pushTokenPermissionOnDevice === messaging.AuthorizationStatus.AUTHORIZED) {
    //     //토큰 활성화 됨, 생성인데 확인해야함. 로컬의 데이터와 비교 필요
    //     const localData: LocalStoragePushProps = await getLocalPushStorage();
    // }
    let enablePush = true;
    if (pushTokenPermissionOnDevice === messaging.AuthorizationStatus.NOT_DETERMINED) {
        // 토큰이 비활성화 상태 ,
        // .NOT_DETERMINED: 신청에 대한 권한이 아직 요청되지 않았습니다
        // 처음에 알림 뜨면 이곳이 발생함
        const selectedPermission = await requestPushTokenPermission();
        enablePush = selectedPermission === 1 ? true : false;
        // 토큰 저장 로직 필요 비교 후 저장 토큰 상태값 변경 필여
    }
    if (pushTokenPermissionOnDevice === messaging.AuthorizationStatus.DENIED) {
        // .DENIED: 사용자가 알림 권한을 거부했습니다.
        // 거부되어도 토큰상태는 확인해야함
        const selectedPermission = await requestPushTokenPermission();
        enablePush = selectedPermission === 1 ? true : false;
    }
    // .PROVISIONAL: 임시 권한 이 부여되었습니다. 요청 없이 활성화 하는 것.

    const fcmToken = await getToken();
    const tokenStatus = await getTokenStatus();
    return { token: fcmToken, tokenStatus, enablePush };
}

const push = {
    getPushNotificationTokenOnDevice: async () => {
        if (!isValidPlatform()) return;

        const pushTokenData = await getPushTokenRequestStatus();
        console.log('🚀 ~ pushTokenData', pushTokenData);
        return pushTokenData;
    },

    useCreateTokenToLocalPushStorage: async (pushId: string, pushToken: string, enablePush: boolean) => {
        const localData = { id: pushId, token: pushToken, enablePush };
        return await updateLocalPushStorage(localData);
    },

    useUpdateTokenToLocalPushStorage: async (pushToken: string) => {
        const token = pushToken;
        const localPush: LocalStoragePushProps = await getLocalPushStorage();

        const pushTokenPermissionOnDevice = await getPushTokenPermission();
        let enablePush = true;
        if (pushTokenPermissionOnDevice !== messaging.AuthorizationStatus.AUTHORIZED) {
            enablePush = false;
        }

        const currentPushId = localPush.id;
        localPush.token = token;
        localPush.enablePush = enablePush;

        updateLocalPushStorage(localPush).catch((err) => {
            console.log('updateLocalPushStorage exception : ', err);
        });
        return { id: currentPushId, token };
    },
    useGetCurrentPushLocalStorage: async () => {
        const pushData = await getLocalPushStorage();
        return pushData;
    },
    useGetPushPermission: async () => {
        const pushPermission = await getPushTokenPermission();
        return pushPermission;
    },
};

export default push;
