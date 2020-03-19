import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './main.less';
import App from 'component/App'
import * as serviceWorker from './serviceWorker';
import { Provider } from "react-redux";
import reducer  from 'redux/reducers/reducer'
import thunk from "redux-thunk"
import { createStore, applyMiddleware } from "redux"

const createLogger = require("redux-logger").createLogger;
const logger = createLogger({ collapsed: true });
const store = createStore(reducer, {}, applyMiddleware(thunk, logger));

// ReactDOM.render(<App />, document.getElementById('root'));

const rootElement = document.getElementById("root");
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
