import React from 'react';
import Loadable from 'react-loadable';
import { Switch, Redirect } from 'react-router-dom';
import _ from 'lodash';

import { Route, loading } from 'src/components';
import viewsRoute from 'src/views';
import LocalStorage from 'utils/localStorage';
import { FIELDS } from 'constants';
import { defaultLanguage } from 'src/constants';
import { genParentAuth, getDirectoryStructre } from 'views/app/menu/menuData';
import { getOrganizationConfigFromLocalStorage } from 'src/utils/organizationConfig';
import { hot } from 'react-hot-loader/root';
import { arrayIsEmpty } from 'utils/array';

const AppLoadable = Loadable({
  loader: () => import('src/views/app'),
  loading,
});

const LoginLoadable = Loadable({
  loader: () => import('src/views/login'),
  loading,
});

const NotificationPageLoadable = Loadable({
  loader: () => import('src/views/app/notification/notificationPage/notificationPage'),
  loading,
});

const NotificationSettingLoadable = Loadable({
  loader: () => import('src/views/app/notification/notificationSetting/notificationSetting'),
  loading,
});

const NotificationModuleSettingLoadable = Loadable({
  loader: () => import('src/views/app/notification/notificationSetting/notificationModuleSetting'),
  loading,
});

const getRoutes = (viewsRoute, routesArr) => {
  viewsRoute.forEach(n => {
    const { routes, path, component, render, breadcrumbName, route } = n;
    if (routes && routes.length > 0) {
      getRoutes(routes, routesArr);
    }

    routesArr.push(
      route || <Route path={path} component={component} render={render} breadcrumbName={breadcrumbName} />,
    );
  });
  return routesArr;
};

const token = LocalStorage.get(FIELDS.TOKEN_NAME);
const isLogin = token && token !== 'expired';
const menuData = genParentAuth(getDirectoryStructre(defaultLanguage));

class RouteConfig extends React.Component {
  render() {
    return (
      <div style={{ height: '100%' }}>
        <Switch>
          <Route path="/login" component={LoginLoadable} />
          <Route
            render={() => (
              <AppLoadable>
                <Switch>
                  {getRoutes(viewsRoute, [
                    <Route
                      path="/messages/setting/moduleSetting"
                      breadcrumbName="设置"
                      component={NotificationModuleSettingLoadable}
                    />,
                    <Route
                      path="/messages/setting/allModules"
                      breadcrumbName="通知设置"
                      component={NotificationSettingLoadable}
                    />,
                    <Route path="/messages" breadcrumbName="全部通知" component={NotificationPageLoadable} />,
                  ])}
                  <Route
                    render={props => {
                      const { location, history } = props;
                      if (location.pathname === '/') {
                        const auths = LocalStorage.get('auth');
                        const recursionChildren = children => {
                          return children.some(({ auth, path, children, organizationConfig, disable }) => {
                            if (children) {
                              if (auth.length > 0 && !_.intersection(auths, auth).length) {
                                return false;
                              }
                              return recursionChildren(children);
                            } else if (auth.length === 0 && !disable && path) {
                              history.push(`/${path}`);
                              return true;
                            } else if (
                              !disable &&
                              Array.isArray(auth) &&
                              auth.length &&
                              _.intersection(auths, auth).length
                            ) {
                              if (
                                !arrayIsEmpty(organizationConfig) &&
                                organizationConfig.findIndex(({ key, value }) => {
                                  return getOrganizationConfigFromLocalStorage()[key].configValue === value;
                                }) === -1
                              ) {
                                return false;
                              }
                              history.push(`/${path}`);
                              return true;
                            }
                            return false;
                          });
                        };
                        menuData.some(menu => {
                          let jump = false;
                          if (menu.children) {
                            jump = recursionChildren(menu.children);
                          }
                          return jump;
                        });
                      }
                      return props.location.pathname !== '/login' && isLogin ? <Redirect to="/" /> : null;
                    }}
                  />
                </Switch>
              </AppLoadable>
            )}
          />
        </Switch>
      </div>
    );
  }
}

export default hot(RouteConfig);
