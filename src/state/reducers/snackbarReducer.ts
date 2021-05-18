import types from '../actions/types';
import { SnackBarAction, SnackBarState } from '../actions/snackBarAction';

const initialState: SnackBarState = {
    visibility: false,
    text: '',
};

const SnackBarReducer = (state: SnackBarState = initialState, action: SnackBarAction): SnackBarState => {
    switch (action.type) {
        case types.SNACKBAR_VISIBILITY: {
            return {
                ...state,
                visibility: action.payload.visibility,
                text: action.payload.text,
            };
        }
        default:
            return initialState;
    }
};

export default SnackBarReducer;
