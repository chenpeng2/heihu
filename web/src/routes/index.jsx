import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { Alert, LocaleProvider } from 'antd';
import { addLocaleData, IntlProvider } from 'react-intl';
import BrowserChecker from 'cn-browser-checker';
import { ConnectedRouter } from 'connected-react-router';
import store from 'store';
import { createBrowserHistory } from 'history';
import LocalStorage from 'src/utils/localStorage';
import { setLanguageTypeInLocalStorage, getLocale, getInitialLanguageType } from 'src/utils/locale/utils';
import GcLocaleProvider from 'src/utils/locale/GcLocaleProvider';

import RouteConfig from './routeConfig';

export const history = createBrowserHistory();
const hideBrowserTip = LocalStorage.get('hideBrowserTip');

export default () => {
  // 国际化
  // 项目的加载语言
  const [languageType, setLanguageType] = useState(getInitialLanguageType());
  const appLocale = getLocale(languageType);
  addLocaleData(...appLocale.data);

  return (
    <React.Fragment>
      {!hideBrowserTip &&
        BrowserChecker().browser !== 'Chrome' && (
          <Alert
            message={
              <span>
                继续使用目前的浏览器可能会影响访问体验，
                <a href="https://www.google.cn/intl/zh-CN/chrome/">点击下载推荐浏览器</a>
              </span>
            }
            banner
            closable
            style={{ width: '100%', zIndex: 100, position: 'fixed' }}
            onClose={() => {
              LocalStorage.set('hideBrowserTip', true, 60 * 60 * 24);
            }}
          />
        )}
      <LocaleProvider locale={appLocale.antd}>
        <IntlProvider locale={appLocale.locale} messages={appLocale.messages} formats={appLocale.formats}>
          <GcLocaleProvider
            changeLanguageType={value => {
              setLanguageType(value);
              setLanguageTypeInLocalStorage(value);
            }}
          >
            <Provider store={store}>
              <ConnectedRouter history={history}>
                <RouteConfig />
              </ConnectedRouter>
            </Provider>
          </GcLocaleProvider>
        </IntlProvider>
      </LocaleProvider>
    </React.Fragment>
  );
};
