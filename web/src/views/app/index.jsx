import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import LocalStorage from 'src/utils/localStorage';
import { withRouter, Link } from 'react-router-dom';
import { Breadcrumb, Spin } from 'antd';
import { getAllColumnConfig } from 'services/account/config';
import { blacklakeGreen } from 'src/styles/color/index';
import BodyLayout from 'src/layouts/bodyLayout';
import { getUserInfo } from 'src/services/auth/user';
import { getCustomLanguage } from 'src/services/organization';
import { setSensorsUserProfile } from 'utils/sensors';
import { hot } from 'react-hot-loader/root';
import SpinContainer from 'components/loading/spinContainer';
import { defaultLanguage } from 'src/constants';
import { arrayIsEmpty } from 'utils/array';
import 'src/icons/antIcon/iconfont.css';
import 'src/icons/gcIcon/iconfont.css';

import UserPrivacy from './userPrivacy';

import PageHeader from './pageHeader';
import BlMenu from './menu';
import './App.scss';

type Props = {
  children: ?[React.Element],
  location: any,
  match: {
    params: ?any,
  },
  history: any,
  intl: any,
};

class App extends Component {
  props: Props;
  state = {
    customLanguage: defaultLanguage,
    loading: true,
  };

  async componentWillMount() {
    const {
      data: { data: user },
    } = await getUserInfo();
    this.setColumnConfig();
    await setSensorsUserProfile();
    const _language = {};
    getCustomLanguage()
      .then(res => {
        const language = _.get(res, 'data.data');
        if (Array.isArray(language) && language.length > 0) {
          language.forEach(n => {
            _language[n.moduleType] = n.moduleName;
          });
          LocalStorage.set('customLanguage', _language);
          const customLanguage = _language || defaultLanguage;
          this.setState({ customLanguage });
        }
      })
      .finally(() => {
        this.setState({ loading: false });
      });
    this.setState({ user });
  }

  setColumnConfig = async () => {
    const {
      data: { data },
    } = await getAllColumnConfig();
    if (!arrayIsEmpty(data)) {
      data.forEach(({ configKey, configValue }) => {
        LocalStorage.set(configKey, JSON.parse(configValue));
      });
    }
  };

  getMatchingRoutes = () => {
    const { location } = this.props;
    const routes = location.pathname.split('/');
    const matchingRoutes = [];
    routes.forEach((n, i) => {
      matchingRoutes.push(routes.slice(0, i + 1).join('/'));
    });
    return matchingRoutes;
  };

  replaceBreadcrumbName = breadcrumbName => {
    const { customLanguage } = this.state;
    const reg = /\$[a-zA-Z_]+\$/gim;
    const matchStrs = breadcrumbName && breadcrumbName.match(reg);
    if (matchStrs && matchStrs.length) {
      const variable = matchStrs[0].substring(1, matchStrs[0].length - 1);
      return breadcrumbName.replace(reg, customLanguage[variable]);
    }
    return breadcrumbName;
  };

  getRoutes = data => {
    const routes = [];
    const matchingRoutes = this.getMatchingRoutes();
    data.forEach(n => {
      if (Array.isArray(n.path)) {
        n.path.slice(1).forEach((m, i) => {
          data.push({
            path: n.path[i],
            breadcrumbName: n.breadcrumbName,
          });
        });
        n.path = n.path[0];
      }
    });
    matchingRoutes.forEach((path, index) => {
      data.forEach(n => {
        const paths = n.path.split('/');
        const matchPaths = path.split('/');
        const paramsIdx = [];
        paths.forEach((m, i) => {
          if (m.indexOf(':') !== -1) {
            paramsIdx.push(i);
          }
        });
        if (paramsIdx.length) {
          paramsIdx.forEach((m, i) => {
            paths.splice(m - i, 1);
            matchPaths.splice(m - i, 1);
          });
          if (
            matchPaths.join('/') === paths.join('/') &&
            path.split('/').length - paramsIdx.length === matchPaths.length
          ) {
            const breadcrumbName = this.replaceBreadcrumbName(n.breadcrumbName);
            routes.push({ path, breadcrumbName });
          }
        } else if (path === paths.join('/')) {
          const breadcrumbName = this.replaceBreadcrumbName(n.breadcrumbName);
          routes.push({ path, breadcrumbName });
        }
      });
    });
    return routes;
  };

  // 国际化面包屑
  intlBreadcrumb = defaultMessage => {
    const { changeChineseToLocale } = this.context;
    return changeChineseToLocale(defaultMessage);
  };

  getBreadcrumb = routes => {
    return (
      <Breadcrumb
        style={{ fontSize: '14px' }}
        routes={routes}
        params={this.props.match.params}
        separator=">"
        itemRender={(route, params, _routes) => {
          const { breadcrumbName } = route || {};
          if (!breadcrumbName) return null;

          const _breadcrumbName = this.intlBreadcrumb(breadcrumbName);

          const routes = _routes.filter(route => route.breadcrumbName);
          const lastOne = routes.indexOf(route) === routes.length - 1;

          const baseItemStyle = {
            maxWidth: 200,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            display: 'inline-block',
            whiteSpace: 'nowrap',
            verticalAlign: 'middle',
          };

          if (lastOne) {
            return (
              <span
                key={_breadcrumbName}
                style={{ color: blacklakeGreen, cursor: 'pointer', ...baseItemStyle }}
                onClick={() => {
                  window.location.reload();
                }}
              >
                {_breadcrumbName}
              </span>
            );
          }

          // 如果对应的route的path为空字符串，那么不可以点击
          if (route && route.path === '') {
            return (
              <span key={_breadcrumbName} className={'breadcrumbName1'} style={baseItemStyle}>
                {_breadcrumbName}
              </span>
            );
          }

          return (
            <Link className="breadcrumbName1" key={_breadcrumbName} to={route.path}>
              <span style={baseItemStyle}>{_breadcrumbName}</span>
            </Link>
          );
        }}
      />
    );
  };

  renderMenu() {
    const { customLanguage } = this.state;
    return (
      <div style={{ flex: '0 0 0', display: 'flex' }}>
        <BlMenu customLanguage={customLanguage} {...this.props} />
      </div>
    );
  }

  renderContent() {
    const { children } = this.props;
    const routesArr = children.props.children[0].map(n => n.props);
    const data = _.compact(_.cloneDeep(routesArr)).filter(route => route.path !== undefined);
    const routes = this.getRoutes(data);
    const breadcrumb = this.getBreadcrumb(routes);
    const { user, loading } = this.state;

    if (!loading) {
      return (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <SpinContainer>
            <BodyLayout header={<PageHeader user={user} header={breadcrumb} />}>{this.props.children}</BodyLayout>
          </SpinContainer>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', flex: 1, overflow: 'auto', alignItems: 'center', justifyContent: 'center' }}>
        <Spin spinning={this.state.loading} />
      </div>
    );
  }

  render() {
    return (
      <div className="layout-aside" style={{ display: 'flex', flex: '1 0 auto' }}>
        {this.renderMenu()}
        {this.renderContent()}
        <UserPrivacy />
      </div>
    );
  }
}

App.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default hot(withRouter(App));
