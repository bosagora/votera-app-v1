import types from '../actions/types';
import { QRCodeActionType, QRCodeScannerAction, QRCodeScannerState } from '../actions/qrcodeScannerAction';

const initialState: QRCodeScannerState = {
    visibility: false,
    action: QRCodeActionType.Validator,
    height: 0,
    onComplete: () => {},
};

const QRCodeScannerReducer = (
    state: QRCodeScannerState = initialState,
    action: QRCodeScannerAction,
): QRCodeScannerState => {
    switch (action.type) {
        case types.QRCODE_SCANNER_VISIBILITY: {
            return {
                ...state,
                visibility: action.payload.visibility,
                action: action.payload.action,
                height: action.payload.height,
                onComplete: action.payload.onComplete,
            };
        }
        default:
            return state;
    }
};

export default QRCodeScannerReducer;
