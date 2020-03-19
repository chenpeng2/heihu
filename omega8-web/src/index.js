import React from 'react';
import ReactDOM from 'react-dom'
import './styles/common/basic.less'
import App from 'component/App'
import * as serviceWorker from './serviceWorker'
import { Provider } from "react-redux"
import reducer  from 'redux/reducers/reducer'
import thunk from "redux-thunk"
import { createStore, applyMiddleware } from "redux"

const createLogger = require("redux-logger").createLogger
const logger = createLogger({ collapsed: true })
const store = createStore(reducer, {}, applyMiddleware(thunk, logger))

const rootElement = document.getElementById("root")

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
)

serviceWorker.unregister();
