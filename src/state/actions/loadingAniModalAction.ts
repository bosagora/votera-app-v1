import types from './types';

interface LoadingAniModalState {
    visibility: boolean;
    step?: number;
}

interface LoadingAniModalAction {
    type: typeof types.LOADING_ANI_MODAL_VISIBILITY;
    payload: LoadingAniModalState;
}

const loadingAniModal = (payload: LoadingAniModalState): LoadingAniModalAction => {
    return {
        type: types.LOADING_ANI_MODAL_VISIBILITY,
        payload,
    };
};

export { loadingAniModal, LoadingAniModalAction, LoadingAniModalState };
