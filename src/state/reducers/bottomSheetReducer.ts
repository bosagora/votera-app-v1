import types from '../actions/types';
import { BottomSheetActionUpdate, BottomSheetState } from '../actions/bottomSheetAction';

const initialState: BottomSheetState = {
    visibility: false,
};

const BottomSheetReducer = (state = initialState, action: BottomSheetActionUpdate) => {
    switch (action.type) {
        case types.BOTTOM_SHEET_VISIBILITY: {
            return {
                visibility: action.payload.visibility,
                bodyComponent: action.payload.bodyComponent,
                sheetHeight: action.payload.sheetHeight,
            };
        }
        case types.BOTTOM_SHEET_UPDATE: {
            return {
                visibility: true,
                bodyComponent: action.payload.bodyComponent,
                sheetHeight: action.payload.sheetHeight,
            };
        }
        default:
            return initialState;
    }
};

export default BottomSheetReducer;
