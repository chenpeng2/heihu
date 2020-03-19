import React from 'react';
import ReactDOM from 'react-dom';

import Raven from 'raven-js';
import conf from 'configs/conf';
import { checkLoginStatus } from 'utils/request';
import logger from 'utils/log';
import LocalStorage from 'utils/localStorage';
import 'handsontable/dist/handsontable.full.min.css';

import App from './routes';
import './styles/index.scss';
import './styles/antdBL.scss';

global.log = logger;

if (conf.ENV !== 'development' && conf.ENV !== 'feature') {
  Raven.config('https://8c85de035a8f4cf2be724019dc6d13be@sentry.blacklake.cn/4', {
    tags: conf,
    environment: conf.ENV,
    release: conf.COMMIT,
  }).install();
  const loginInfo = LocalStorage.get('loginInfo');
  Raven.setUserContext({
    username: loginInfo && loginInfo.phone,
    gccode: loginInfo && loginInfo.code,
  });
}

checkLoginStatus();

ReactDOM.render(<App />, document.getElementById('root'));
