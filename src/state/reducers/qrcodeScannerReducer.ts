import types from '../actions/types';
import { QRCodeScannerAction, QRCodeScannerState } from '../actions/qrcodeScannerAction';

const initialState: QRCodeScannerState = {
    visibility: false,
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
                onComplete: action.payload.onComplete,
            };
        }
        default:
            return state;
    }
};

export default QRCodeScannerReducer;
