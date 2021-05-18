import types from './types';

interface SnackBarState {
    visibility: boolean;
    text?: string;
}

interface SnackBarAction {
    type: typeof types.SNACKBAR_VISIBILITY;
    payload: SnackBarState;
}

const snackBarVisibility = (payload: SnackBarState): SnackBarAction => {
    return {
        type: types.SNACKBAR_VISIBILITY,
        payload,
    };
};

export { snackBarVisibility, SnackBarAction, SnackBarState };
