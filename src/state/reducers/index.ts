import { combineReducers } from 'redux';

import LoadingAniModalReducer from './loadingAniModalReducer';
import BottomSheetReducer from './bottomSheetReducer';
import SnackBarReducer from './snackbarReducer';
import QRCodeScannerReducer from './qrcodeScannerReducer';
import SelectDatePickerReducer from './selectDatePickerReducer';

export default combineReducers({
    loadingAniModal: LoadingAniModalReducer,
    snackBar: SnackBarReducer,
    qrcodeScanner: QRCodeScannerReducer,
    bottomSheetState: BottomSheetReducer,
    selectDatePicker: SelectDatePickerReducer,
});
