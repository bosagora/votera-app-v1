import types from '../actions/types';
import { LoadingAniModalState, LoadingAniModalAction } from '../actions/loadingAniModalAction';

const initialState: LoadingAniModalState = {
    visibility: false,
    step: 0,
};

const LoadingAniModalReducer = (
    state: LoadingAniModalState = initialState,
    action: LoadingAniModalAction,
): LoadingAniModalState => {
    switch (action.type) {
        case types.LOADING_ANI_MODAL_VISIBILITY: {
            return {
                ...state,
                visibility: action.payload.visibility,
            };
        }
        default:
            return state;
    }
};

export default LoadingAniModalReducer;
