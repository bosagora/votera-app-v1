import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptLocalData, decryptLocalData, generateKey } from '@utils/crypto';
import { LOCALSTORAGE_KEY, LOCALSTORAGE_SERVICE, LOCAL_TEMP_PROPOSALS } from '../../../config/keys';
import { LocalStorageProps, LocalStorageProposalProps } from './LocalStorageTypes';

export * from './LocalStorageTypes';

let localStorageKey: Buffer | undefined;

async function getLocalStorageKey(): Promise<Buffer> {
    if (!localStorageKey) {
        const options: SecureStore.SecureStoreOptions = {
            keychainService: LOCALSTORAGE_SERVICE,
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        };
        try {
            console.log('call getLocalStorageKey');
            let value = await SecureStore.getItemAsync(LOCALSTORAGE_KEY, options);
            if (!value || value === '') {
                console.log('detect no LocalStorageKey, initailize');
                await SecureStore.setItemAsync(LOCALSTORAGE_KEY, await generateKey(), options);
                value = await SecureStore.getItemAsync(LOCALSTORAGE_KEY, options);
                if (!value || value === '') {
                    throw new Error('Read Failed from SecureStore');
                }
            }

            localStorageKey = Buffer.from(value, 'hex');
        } catch (error) {
            console.log('getLocalStorageKey exception = ', error);
            throw error;
        }
    }

    return localStorageKey;
}

async function encryptData(data: any): Promise<string> {
    const key = await getLocalStorageKey();
    return encryptLocalData(data, key);
}

async function decryptData(data: string | null): Promise<any> {
    if (!data) {
        return null;
    }

    const key = await getLocalStorageKey();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return decryptLocalData(data, key);
}

const get = async (): Promise<LocalStorageProps> => {
    try {
        const localData = await AsyncStorage.getItem(LOCALSTORAGE_KEY);
        if (localData) {
            const storageData = (await decryptData(localData)) as LocalStorageProps;
            return storageData;
        }
    } catch (err) {
        console.log('Exception while localStorage.get = ', err);
    }
    return {
        user: {},
        members: [],
        groupBookmarks: [],
        activityBookmarks: [],
        searchHistory: [],
        feed: {},
    };
};

const set = async (data: LocalStorageProps): Promise<LocalStorageProps> => {
    try {
        const localData = await encryptData(data);
        if (localData) {
            await AsyncStorage.setItem(LOCALSTORAGE_KEY, localData);
        }
    } catch (err) {
        console.log('Exception while localStorage.set = ', err);
    }
    return data;
};

export const reset = async (): Promise<void> => {
    await AsyncStorage.removeItem(LOCALSTORAGE_KEY);
    await SecureStore.deleteItemAsync(LOCALSTORAGE_KEY);
    localStorageKey = undefined;
};

const getByKey = async (key: string): Promise<any> => {
    try {
        const localData = await AsyncStorage.getItem(key);
        if (localData !== null) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return JSON.parse(localData);
        }
    } catch (e) {
        console.log('LocalStorage get error : ', e);
    }
    return undefined;
};

const setByKey = async (key: string, data: any): Promise<void> => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.log('LocalStorage set error : ', e);
    }
};

const resetByKey = async (key: string): Promise<void> => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (e) {
        console.log('LocalStorage reset error : ', e);
    }
};

const getByKeyEncrypt = async (key: string): Promise<any> => {
    try {
        const localData = await AsyncStorage.getItem(key);
        if (localData !== null) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return await decryptData(localData);
        }
    } catch (e) {
        console.log('LocalStorage getByKeyEncrypt error : ', e);
    }
    return undefined;
};

const setByKeyEncrypt = async (key: string, data: any): Promise<void> => {
    try {
        const localData = await encryptData(data);
        if (localData) {
            await AsyncStorage.setItem(key, localData);
        }
    } catch (e) {
        console.log('LocalStorage setByKeyEncyrpt error : ', e);
    }
};

const updateBookmark = async (type: 'GROUP' | 'ACTIVITY', id: string): Promise<LocalStorageProps> => {
    try {
        const localData: LocalStorageProps = await get();
        const bookmarks = (type === 'GROUP' ? localData.groupBookmarks : localData.activityBookmarks) || [];

        const index = bookmarks.findIndex((bm) => bm === id);
        if (index !== -1) {
            bookmarks.splice(index, 1);
        } else {
            bookmarks.push(id);
        }
        if (type === 'GROUP') localData.groupBookmarks = bookmarks;
        else localData.activityBookmarks = bookmarks;

        await set(localData);
        return localData;
    } catch (e) {
        throw Error(e);
    }
};

const getTemporaryProposals = async (): Promise<LocalStorageProposalProps[]> => {
    try {
        const localData = await AsyncStorage.getItem(LOCAL_TEMP_PROPOSALS);
        if (localData !== null) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return JSON.parse(localData) as LocalStorageProposalProps[];
        }
    } catch (e) {
        console.log('LocalStorage getTemporaryProposals error : ', e);
    }
    return [];
}

const addTemporaryProposal = async (data: LocalStorageProposalProps): Promise<void> => {
    try {
        const localProposals = await getTemporaryProposals();
        let id = data.id;
        let index;
        if (id) {
            index = localProposals.findIndex((proposal) => proposal.id === id);
        } else {
            do {
                id = Math.random().toString(36).substr(2, 9);
                index = localProposals.findIndex((proposal) => proposal.id === id);
            } while (index >= 0);
        }

        const tempData = {...data, ...{ id, status: 'TEMP', timestamp: new Date().getTime() }};
        if (index < 0) {
            localProposals.push(tempData);
        } else {
            localProposals[index] = tempData;
        }

        await AsyncStorage.setItem(LOCAL_TEMP_PROPOSALS, JSON.stringify(localProposals));
    } catch (err) {
        console.log('LocalStorage addTemporaryProposal error : ', err);
        throw new Error('save temporary proposal failed');
    }
};

const deleteTemporaryProposal = async (id: string): Promise<LocalStorageProposalProps | null> => {
    try {
        const localProposals = await getTemporaryProposals();
        const index = localProposals.findIndex((proposal) => proposal.id === id);
        if (index < 0) {
            return null;
        }

        const tempData = localProposals[index];
        localProposals.splice(index, 1);

        await AsyncStorage.setItem(LOCAL_TEMP_PROPOSALS, JSON.stringify(localProposals));
        return tempData;
    } catch (err) {
        console.log('LocalStorage deleteTemporaryProposal error : ', err);
        throw new Error('delete temporary proposal failed');
    }
}

export default {
    get,
    set,
    reset,
    getByKey,
    resetByKey,
    setByKey,
    getByKeyEncrypt,
    setByKeyEncrypt,
    updateBookmark,
    getTemporaryProposals,
    addTemporaryProposal,
    deleteTemporaryProposal
};
