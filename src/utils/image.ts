import { Image } from 'react-native';

export interface ISize {
    width: number;
    height: number;
}

export const getImageSize = (uri: string): Promise<ISize> => {
    const success = (resolve: (value?: ISize | PromiseLike<ISize>) => void) => (width: number, height: number) => {
        resolve({
            width,
            height,
        });
    };
    const error = (reject: (reason?: any) => void) => (failure: Error) => {
        reject(failure);
    };

    return new Promise<ISize>((resolve, reject) => {
        Image.getSize(uri, success(resolve), error(reject));
    });
};
