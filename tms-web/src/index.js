import React from 'react';
import ReactDOM from 'react-dom'
import './styles/common/basic.less'
import App from 'component/App'
import * as serviceWorker from './serviceWorker'
import { Provider } from "react-redux"
import reducer  from 'redux/reducers/reducer'
import {BrowserRouter, Route} from 'react-router-dom'

import thunk from "redux-thunk"
import { createStore, applyMiddleware } from "redux"

const createLogger = require("redux-logger").createLogger
const logger = createLogger({ collapsed: true })
const store = createStore(reducer, {}, applyMiddleware(thunk, logger))
const rootElement = document.getElementById("root")

const Root = () => {
  return (
      <BrowserRouter basename='/'>
          <Route path={`/`} component={App}></Route>
      </BrowserRouter>
  )

}

ReactDOM.render(
  <Provider store={store}>
    <Root />
  </Provider>,
  rootElement
)

serviceWorker.unregister()




