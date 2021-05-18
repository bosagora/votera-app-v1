import crypto from 'crypto';
import { Keccak } from 'sha3';

const keySize = 32;
const ivSize = 16;
const macSize = 16;
const iterCount = 1000;
const keyLen = 64; // keySize + ivSize + macSize

export const encryptLocalData = async (data: any, keyBuf: Buffer): Promise<string> => {
    const iv = Buffer.from(crypto.randomBytes(ivSize));
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuf.slice(0, keySize), iv);
    let result = cipher.update(JSON.stringify(data), 'utf8', 'base64');
    result += cipher.final('base64');
    return `E$${result}.${cipher.getAuthTag().toString('base64')}.${iv.toString('base64')}`;
};

export const decryptLocalData = (data: string, keyBuf: Buffer): any => {
    if (!data) {
        return data;
    }
    if (!data.startsWith('E$')) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return JSON.parse(data);
    }

    const encrypted = data.slice(2).split('.');
    if (encrypted.length < 2) {
        throw new Error('invalid encrypted local data');
    }

    const iv = encrypted.length === 2 ? keyBuf.slice(keySize, keySize + ivSize) : Buffer.from(encrypted[2], 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuf.slice(0, keySize), iv);
    decipher.setAuthTag(Buffer.from(encrypted[1], 'base64'));
    let result = decipher.update(encrypted[0], 'base64', 'utf8');
    result += decipher.final('utf8');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(result);
};

export const encryptText = async (text: string, eKey: string): Promise<string> => {
    const keyBuf = Buffer.from(eKey, 'hex');
    const iv = Buffer.from(crypto.randomBytes(ivSize));
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuf.slice(0, keySize), iv);
    let result = cipher.update(text, 'utf8', 'base64');
    result += cipher.final('base64');

    return `E$${result}.${cipher.getAuthTag().toString('base64')}.${iv.toString('base64')}`;
};

export const decryptText = (data: string, eKey: string): string => {
    if (!data || !data.startsWith('E$')) {
        return data;
    }

    const encrypted = data.slice(2).split('.');
    if (encrypted.length < 2) {
        return data;
    }

    const keyBuf = Buffer.from(eKey, 'hex');
    const iv = encrypted.length === 2 ? keyBuf.slice(keySize, keySize + ivSize) : Buffer.from(encrypted[2], 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuf.slice(0, keySize), iv);
    decipher.setAuthTag(Buffer.from(encrypted[1], 'base64'));
    let result = decipher.update(encrypted[0], 'base64', 'utf8');
    result += decipher.final('utf8');

    return result;
};

export const generateKey = async (size = keySize + ivSize + macSize): Promise<string> => {
    return Buffer.from(crypto.randomBytes(size)).toString('hex');
};

export const hashWorkspaceKey = (workspaceKey: string): string => {
    const keccak = new Keccak(256);
    keccak.update(Buffer.from(workspaceKey, 'utf8'));
    return keccak.digest().toString('base64');
};

export const generateHashPin = (pin: string, privateKey: string): string => {
    const buf = Buffer.from(pin, 'utf8');

    const keccak = new Keccak(256);
    keccak.update(buf);
    const hash1 = keccak.digest();

    const pb = Buffer.from(privateKey.slice(2), 'hex');

    keccak.reset();
    keccak.update(pb);
    keccak.update(hash1);
    let hash2 = keccak.digest();
    for (let i = 1; i < 10; i += 1) {
        keccak.reset();
        keccak.update(hash2);
        hash2 = keccak.digest();
    }

    return hash2.toString('base64');
};

export const makeSignatureCheck = (signature: string, address: string): string => {
    const keccak = new Keccak(256);
    keccak.update(signature);
    keccak.update(address);
    return keccak.digest('base64');
};
