// React and ReactDOM
import React from 'react';
import ReactDOM from 'react-dom';

// 状态管理
import { Provider } from 'react-redux';
import store from '../redux/store'

// Framework7
import Framework7 from 'framework7/framework7.esm.bundle.js';
import Framework7React from 'framework7-react';
import '../static/style/f7.css'
Framework7.use(Framework7React)

window.axios = require('../http').default;

// 自定义样式
import '../static/style/app.less';

// 根组件
import App from '../App';

// 渲染
ReactDOM.render(
  <Provider store={ store }>
    { React.createElement(App) }
  </Provider>,
  document.getElementById('root'),
);