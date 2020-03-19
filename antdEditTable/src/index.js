// react
import React from 'react';
import ReactDOM from 'react-dom';
import './static/style/reset.less'

// redux
import { Provider } from "react-redux";
import reducer  from 'redux/reducers/reducer'
import thunk from "redux-thunk"
import { createStore, applyMiddleware } from "redux"

import App from './App';
import * as serviceWorker from './serviceWorker';

const createLogger = require("redux-logger").createLogger;
const logger = createLogger({ collapsed: true });
const store = createStore(reducer, {}, applyMiddleware(thunk, logger));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
