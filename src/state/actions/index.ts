import * as loadingAniModalAction from './loadingAniModalAction';
import * as snackBarAction from './snackBarAction';
import * as QRCodeScannerAction from './qrcodeScannerAction';
import * as bottomSheetAction from './bottomSheetAction';

const ActionCreators = {
    ...loadingAniModalAction,
    ...snackBarAction,
    ...QRCodeScannerAction,
    ...bottomSheetAction
};

export interface ActionCreatorsState {
    loadingAniModal: loadingAniModalAction.LoadingAniModalState;
    snackBar: snackBarAction.SnackBarState;
    qrcodeScanner: QRCodeScannerAction.QRCodeScannerState;
    bottomSheetState: bottomSheetAction.BottomSheetState;
}

export default ActionCreators;
