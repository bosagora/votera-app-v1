import types from './types';

export interface BottomSheetState {
    visibility: boolean;
    sheetHeight?: number;
    bodyComponent?: () => JSX.Element;
}

export interface BottomSheetActionUpdate {
    type: typeof types.BOTTOM_SHEET_VISIBILITY | typeof types.BOTTOM_SHEET_UPDATE;
    payload: BottomSheetState;
}

export const bottomSheetAction = (params: BottomSheetState): BottomSheetActionUpdate => {
    return {
        type: types.BOTTOM_SHEET_VISIBILITY,
        payload: params,
    };
};

export const bottomSheetUpdate = (params: BottomSheetState): BottomSheetActionUpdate => {
    return {
        type: types.BOTTOM_SHEET_UPDATE,
        payload: params,
    };
};
