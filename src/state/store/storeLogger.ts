const logger = (store) => (next) => (action) => {
    if (action.type.indexOf('ACCOUNTS') !== -1) next(action);
    else if (action.type.indexOf('MODAL') !== -1) next(action);
    else {
        console.group(action.type);
        console.info('dispatch', action);
        next(action);
        // console.log('next state', store.getState());
        console.groupEnd(action.type);
    }
};

export default logger;
