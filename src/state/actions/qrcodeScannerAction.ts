import types from './types';

enum QRCodeActionType {
    Validator,
    Vote,
}

interface QRCodeScannerState {
    visibility: boolean;
    action?: QRCodeActionType,
    onComplete?: (data: string) => void;
    onCancel?: () => void;
}

interface QRCodeScannerAction {
    type: typeof types.QRCODE_SCANNER_VISIBILITY;
    payload: QRCodeScannerState;
}

const qrcodeScanner = (payload: QRCodeScannerState): QRCodeScannerAction => {
    return {
        type: types.QRCODE_SCANNER_VISIBILITY,
        payload,
    };
};

export { qrcodeScanner, QRCodeScannerAction, QRCodeScannerState, QRCodeActionType };
