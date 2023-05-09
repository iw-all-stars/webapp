import * as CryptoJS from 'crypto-js';

const secretKey = process.env.PASSWORD_ENCRYPTION_KEY ?? "";

export function encrypt(password: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return CryptoJS.AES.encrypt(password, secretKey).toString();
}

export function decrypt(hash: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return CryptoJS.AES.decrypt(hash, secretKey).toString(CryptoJS.enc.Utf8);
}