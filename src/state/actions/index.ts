import * as loadingAniModalAction from './loadingAniModalAction';
import * as snackBarAction from './snackBarAction';
import * as QRCodeScannerAction from './qrcodeScannerAction';
import * as bottomSheetAction from './bottomSheetAction';
import * as selectDatePickerAction from './selectDatePicker';

const ActionCreators = {
    ...loadingAniModalAction,
    ...snackBarAction,
    ...QRCodeScannerAction,
    ...bottomSheetAction,
    ...selectDatePickerAction
};

export interface ActionCreatorsState {
    loadingAniModal: loadingAniModalAction.LoadingAniModalState;
    snackBar: snackBarAction.SnackBarState;
    qrcodeScanner: QRCodeScannerAction.QRCodeScannerState;
    bottomSheetState: bottomSheetAction.BottomSheetState;
    selectDatePicker: selectDatePickerAction.SelectDatePickerState;
}

export default ActionCreators;
