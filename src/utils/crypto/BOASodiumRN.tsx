// @ts-ignore
import Sodium from 'react-native-sodium-boa';
import * as Base64 from 'base64-js';

export interface ISodiumBridgeResult
{
    code: string;
    data: string;
}

export class BOASodiumRN
{
    public crypto_core_ed25519_BYTES: number = 32;
    public crypto_core_ed25519_UNIFORMBYTES: number = 32;
    public crypto_core_ed25519_SCALARBYTES: number = 32;
    public crypto_core_ed25519_NONREDUCEDSCALARBYTES: number = 64;
    public crypto_aead_xchacha20poly1305_ietf_KEYBYTES: number = 32;
    public crypto_aead_xchacha20poly1305_ietf_NPUBBYTES: number = 24;

    public init(): Promise<void> {
        return new Promise<void>((resolve) => {
            resolve();
        });
    }

    public crypto_core_ed25519_random (): Uint8Array
    {
        let result: ISodiumBridgeResult
            = JSON.parse(Sodium.crypto_core_ed25519_random_sync());

        if (result.code !== "SUCCESS")
            throw new Error("An error has occurred.");

        return Base64.toByteArray(result.data);
    }

    public crypto_core_ed25519_from_uniform (r: Uint8Array): Uint8Array
    {
        if (r.length !== this.crypto_core_ed25519_BYTES)
            throw new Error("Invalid input size");

        let in_r = Base64.fromByteArray(r);
        let result: ISodiumBridgeResult
            = JSON.parse(Sodium.crypto_core_ed25519_from_uniform_sync(in_r));

        if (result.code !== "SUCCESS")
            throw new Error("An error has occurred.");

        return Base64.toByteArray(result.data);
    }

    public crypto_core_ed25519_add (p: Uint8Array, q: Uint8Array): Uint8Array
    {
        if (p.length !== this.crypto_core_ed25519_BYTES)
            throw new Error("Invalid input size");

        if (q.length != this.crypto_core_ed25519_BYTES)
            throw new Error("Invalid input size");

        let in_p = Base64.fromByteArray(p);
        let in_q = Base64.fromByteArray(q);
        let result: ISodiumBridgeResult
            = JSON.parse(Sodium.crypto_core_ed25519_add_sync(in_p, in_q));

        if (result.code !== "SUCCESS")
            throw new Error("An error has occurred.");

        return Base64.toByteArray(result.data);
    }

    public crypto_core_ed25519_sub (p: Uint8Array, q: Uint8Array): Uint8Array
    {
        if (p.length !== this.crypto_core_ed25519_BYTES)
            throw new Error("Invalid input size");

        if (q.length != this.crypto_core_ed25519_BYTES)
            throw new Error("Invalid input size");

        let in_p = Base64.fromByteArray(p);
        let in_q = Base64.fromByteArray(q);
        let result: ISodiumBridgeResult
            = JSON.parse(Sodium.crypto_core_ed25519_sub_sync(in_p, in_q));

        if (result.code !== "SUCCESS")
            throw new Error("An error has occurred.");

        return Base64.toByteArray(result.data);
    }

    public crypto_core_ed25519_is_valid_point (p: Uint8Array): boolean
    {
        if (p.length !== this.crypto_core_ed25519_BYTES)
            throw new Error("Invalid input size");

        let in_p = Base64.fromByteArray(p);
        let result: ISodiumBridgeResult
            = JSON.parse(Sodium.crypto_core_ed25519_is_valid_point_sync(in_p));

        if (result.code !== "SUCCESS")
            throw new Error("An error has occurred.");

        return result.data !== "0";
    }

    public crypto_core_ed25519_scalar_random (): Uint8Array
    {
        let result: ISodiumBridgeResult
            = JSON.parse(Sodium.crypto_core_ed25519_scalar_random_sync());

        if (result.code !== "SUCCESS")
            throw new Error("An error has occurred.");

        return Base64.toByteArray(result.data);
    }

    public crypto_core_ed25519_scalar_add (x: Uint8Array, y: Uint8Array): Uint8Array
    {
        if (x.length !== this.crypto_core_ed25519_SCALARBYTES)
            throw new Error("Invalid input size");

        if (y.length !== this.crypto_core_ed25519_SCALARBYTES)
            throw new Error("Invalid input size");

        let in_x = Base64.fromByteArray(x);
        let in_y = Base64.fromByteArray(y);
        let result: ISodiumBridgeResult
            = JSON.parse(Sodium.crypto_core_ed25519_scalar_add_sync(in_x, in_y));

        if (result.code !== "SUCCESS")
            throw new Error("An error has occurred.");

        return Base64.toByteArray(result.data);
    }

    public crypto_core_ed25519_scalar_sub (x: Uint8Array, y: Uint8Array): Uint8Array
    {
        if (x.length !== this.crypto_core_ed25519_SCALARBYTES)
            throw new Error("Invalid input size");

        if (y.length !== this.crypto_core_ed25519_SCALARBYTES)
            throw new Error("Invalid input size");

        let in_x = Base64.fromByteArray(x);
        let in_y = Base64.fromByteArray(y);
        let result: ISodiumBridgeResult
            = JSON.parse(Sodium.crypto_core_ed25519_scalar_sub_sync(in_x, in_y));

        if (result.code !== "SUCCESS")
            throw new Error("An error has occurred.");

        return Base64.toByteArray(result.data);
    }

    public crypto_core_ed25519_scalar_negate (s: Uint8Array): Uint8Array
    {
        if (s.length !== this.crypto_core_ed25519_SCALARBYTES)
            throw new Error("Invalid input size");

        let in_s = Base64.fromByteArray(s);
        let result: ISodiumBridgeResult
            = JSON.parse(Sodium.crypto_core_ed25519_scalar_negate_sync(in_s));

        if (result.code !== "SUCCESS")
            throw new Error("An error has occurred.");

        return Base64.toByteArray(result.data);
    }

    public crypto_core_ed25519_scalar_complement (s: Uint8Array): Uint8Array
    {
        if (s.length !== this.crypto_core_ed25519_SCALARBYTES)
            throw new Error("Invalid input size");

        let in_s = Base64.fromByteArray(s);
        let result: ISodiumBridgeResult
            = JSON.parse(Sodium.crypto_core_ed25519_scalar_complement_sync(in_s));

        if (result.code !== "SUCCESS")
            throw new Error("An error has occurred.");

        return Base64.toByteArray(result.data);
    }

    public crypto_core_ed25519_scalar_mul (x: Uint8Array, y: Uint8Array): Uint8Array
    {
        if (x.length !== this.crypto_core_ed25519_SCALARBYTES)
            throw new Error("Invalid input size");

        if (y.length !== this.crypto_core_ed25519_SCALARBYTES)
            throw new Error("Invalid input size");

        let in_x = Base64.fromByteArray(x);
        let in_y = Base64.fromByteArray(y);
        let result: ISodiumBridgeResult
            = JSON.parse(Sodium.crypto_core_ed25519_scalar_mul_sync(in_x, in_y));

        if (result.code !== "SUCCESS")
            throw new Error("An error has occurred.");

        return Base64.toByteArray(result.data);
    }

    public crypto_core_ed25519_scalar_invert (s: Uint8Array): Uint8Array
    {
        if (s.length !== this.crypto_core_ed25519_SCALARBYTES)
            throw new Error("Invalid input size");

        let in_s = Base64.fromByteArray(s);
        let result: ISodiumBridgeResult
            = JSON.parse(Sodium.crypto_core_ed25519_scalar_invert_sync(in_s));

        if (result.code !== "SUCCESS")
            throw new Error("An error has occurred.");

        return Base64.toByteArray(result.data);
    }

    public crypto_core_ed25519_scalar_reduce (s: Uint8Array): Uint8Array
    {
        if (s.length !== this.crypto_core_ed25519_NONREDUCEDSCALARBYTES)
            throw new Error("Invalid input size");

        let in_s = Base64.fromByteArray(s);
        let result: ISodiumBridgeResult
            = JSON.parse(Sodium.crypto_core_ed25519_scalar_reduce_sync(in_s));

        if (result.code !== "SUCCESS")
            throw new Error("An error has occurred.");

        return Base64.toByteArray(result.data);
    }

    public crypto_scalarmult_ed25519 (n: Uint8Array, p: Uint8Array): Uint8Array
    {
        if (n.length !== this.crypto_core_ed25519_SCALARBYTES)
            throw new Error("Invalid input size");

        if (p.length !== this.crypto_core_ed25519_BYTES)
            throw new Error("Invalid input size");

        let in_n = Base64.fromByteArray(n);
        let in_p = Base64.fromByteArray(p);
        let result: ISodiumBridgeResult
            = JSON.parse(Sodium.crypto_scalarmult_ed25519_sync(in_n, in_p));

        if (result.code !== "SUCCESS")
            throw new Error("An error has occurred.");

        return Base64.toByteArray(result.data);
    }

    public crypto_scalarmult_ed25519_base (n: Uint8Array): Uint8Array
    {
        if (n.length !== this.crypto_core_ed25519_SCALARBYTES)
            throw new Error("Invalid input size");

        let in_n = Base64.fromByteArray(n);
        let result: ISodiumBridgeResult
            = JSON.parse(Sodium.crypto_scalarmult_ed25519_base_sync(in_n));

        if (result.code !== "SUCCESS")
            throw new Error("An error has occurred.");

        return Base64.toByteArray(result.data);
    }

    public crypto_scalarmult_ed25519_base_noclamp (n: Uint8Array): Uint8Array
    {
        if (n.length !== this.crypto_core_ed25519_SCALARBYTES)
            throw new Error("Invalid input size");

        let in_n = Base64.fromByteArray(n);
        let result: ISodiumBridgeResult
            = JSON.parse(Sodium.crypto_scalarmult_ed25519_base_noclamp_sync(in_n));

        if (result.code !== "SUCCESS")
            throw new Error("An error has occurred.");

        return Base64.toByteArray(result.data);
    }

    public crypto_scalarmult_ed25519_noclamp (n: Uint8Array, p: Uint8Array): Uint8Array
    {
        if (n.length !== this.crypto_core_ed25519_SCALARBYTES)
            throw new Error("Invalid input size");

        if (p.length !== this.crypto_core_ed25519_BYTES)
            throw new Error("Invalid input size");

        let in_n = Base64.fromByteArray(n);
        let in_p = Base64.fromByteArray(p);
        let result: ISodiumBridgeResult
            = JSON.parse(Sodium.crypto_scalarmult_ed25519_noclamp_sync(in_n, in_p));

        if (result.code !== "SUCCESS")
            throw new Error("An error has occurred.");

        return Base64.toByteArray(result.data);
    }

    public randombytes_buf (n: number): Uint8Array
    {
        let result: ISodiumBridgeResult
            = JSON.parse(Sodium.randombytes_buf_sync(n));

        if (result.code !== "SUCCESS")
            throw new Error("An error has occurred.");

        return Base64.toByteArray(result.data);
    }

    public crypto_generichash (hash_length: number, message: Uint8Array, key?: Uint8Array): Uint8Array
    {
        let in_message = Base64.fromByteArray(message);
        let in_key = ((key !== undefined) ? Base64.fromByteArray(key) : "");
        let result: ISodiumBridgeResult
            = JSON.parse(Sodium.crypto_generichash_sync(hash_length, in_message, in_key));

        if (result.code !== "SUCCESS")
            throw new Error("An error has occurred.");

        return Base64.toByteArray(result.data);
    }

    public crypto_aead_chacha20poly1305_ietf_keygen (): Uint8Array
    {
        let result: ISodiumBridgeResult
            = JSON.parse(Sodium.crypto_aead_chacha20poly1305_ietf_keygen_sync());

        if (result.code !== "SUCCESS")
            throw new Error("An error has occurred.");

        return Base64.toByteArray(result.data);
    }

    public crypto_aead_xchacha20poly1305_ietf_encrypt (
        message: Uint8Array,
        additional_data: Uint8Array | null,
        secret_nonce: Uint8Array | null,
        public_nonce: Uint8Array,
        key: Uint8Array): Uint8Array
    {
        let in_message_chunk = Base64.fromByteArray(message);
        let in_additional_data = ((additional_data !== null) ? Base64.fromByteArray(additional_data) : "");
        let in_secret_nonce = ((secret_nonce !== null) ? Base64.fromByteArray(secret_nonce) : "");
        let in_public_nonce = Base64.fromByteArray(public_nonce);
        let in_key = Base64.fromByteArray(key);
        let result: ISodiumBridgeResult
            = JSON.parse(Sodium.crypto_aead_xchacha20poly1305_ietf_encrypt_sync(
            in_message_chunk,
            in_additional_data,
            in_secret_nonce,
            in_public_nonce,
            in_key
        ));

        if (result.code !== "SUCCESS")
            throw new Error("An error has occurred.");

        return Base64.toByteArray(result.data);
    }

    public crypto_aead_xchacha20poly1305_ietf_decrypt (
        secret_nonce: Uint8Array | null,
        ciphertext: Uint8Array,
        additional_data: Uint8Array | null,
        public_nonce: Uint8Array,
        key: Uint8Array): Uint8Array
    {
        let in_secret_nonce = ((secret_nonce !== null) ? Base64.fromByteArray(secret_nonce) : "");
        let in_ciphertext = Base64.fromByteArray(ciphertext);
        let in_additional_data = ((additional_data !== null) ? Base64.fromByteArray(additional_data) : "");
        let in_public_nonce = Base64.fromByteArray(public_nonce);
        let in_key = Base64.fromByteArray(key);
        let result: ISodiumBridgeResult
            = JSON.parse(Sodium.crypto_aead_xchacha20poly1305_ietf_decrypt_sync(
            in_secret_nonce,
            in_ciphertext,
            in_additional_data,
            in_public_nonce,
            in_key
        ));

        if (result.code !== "SUCCESS")
            throw new Error("An error has occurred.");

        return Base64.toByteArray(result.data);
    }
}