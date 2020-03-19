import { combineReducers, compose, createStore, applyMiddleware } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import { createBrowserHistory } from 'history';
import { routerMiddleware, connectRouter } from 'connected-react-router';
import createSagaMiddleware from 'redux-saga';
import sagas from './redux/sagas';

// 自己的reducer
import reducers from './redux/reducers';
import * as quality from './quality';

const history = createBrowserHistory();
const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const sagaMiddleware = createSagaMiddleware();

const createMyStore = () => {
  return createStore(
    combineReducers({
      ...reducers,
      quality: quality.reducer,
      menuState: reducers.menu,
      router: connectRouter(history),
    }),
    composeEnhancer(applyMiddleware(routerMiddleware(history), promiseMiddleware(), sagaMiddleware)),
  );
};

const store = createMyStore();
sagaMiddleware.run(sagas);

export default store;
