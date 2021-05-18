import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import reducers from '../reducers';
import storeLogger from './storeLogger';

const store = createStore(reducers, applyMiddleware(thunkMiddleware, promiseMiddleware, storeLogger));

export default store;
