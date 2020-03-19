import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import BlIcon from 'components/icon';
import { Layout } from 'antd';
import { Input, Icon } from 'components';
import { orgInfo } from 'services/auth/user';
import { defaultLanguage } from 'src/constants';
import { toggleMenu } from 'store/redux/actions';
import { primary } from 'src/styles/color';
import LocalStorage from 'utils/localStorage';
import { arrayIsEmpty } from 'utils/array';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { VERSION } from 'configs/conf';
import styles from './index.scss';
import AppMenu from './appMenu';
import { filterMenuDataByOrganizationConfigAndAuth, genParentAuth, getDirectoryStructre } from './menuData';

const { Sider } = Layout;

type Props = {
  style: {},
  menuState: {
    visible: boolean,
  },
  toggleMenu: () => {},
  customLanguage: any,
  location: any,
  config: any,
};

class BlMenu extends Component {
  props: Props;
  state = {
    showOpenIcon: false,
    showOpenIconTest: true,
    collapsed: false,
    orgName: '',
    searchWord: '',
    openKeys: [],
  };

  componentDidMount() {
    orgInfo().then(res => {
      const name = _.get(res, 'data.data.name');
      LocalStorage.set('orgName', name);
      this.setState({ orgName: name });
    });
  }

  onOpenChange() {
    this.props.toggleMenu();
  }

  toggleCollapesd = () => {
    this.setState({ collapsed: !this.state.collapsed });
  };

  onOpenIconChange() {
    this.setState({ showOpenIcon: !this.state.showOpenIcon });
  }

  getCurrentLocation = () => this.props.location.pathname.split('/');

  renderGcIconWithTitle = (props: { type: string, title: string, showText: boolean }) => {
    const { type, title, showText } = props;
    const FONT_SIZE = '26px';
    const iconStyle = {
      fontSize: FONT_SIZE,
      verticalAlign: 'middle',
      color: primary,
    };
    const titleStyle = {
      lineHeight: FONT_SIZE,
      height: FONT_SIZE,
      display: 'inline-block',
    };

    return (
      <div style={{ whiteSpace: 'nowrap' }}>
        <BlIcon iconType="gc" type={type} style={iconStyle} />
        {showText ? <span style={titleStyle}>{title}</span> : null}
      </div>
    );
  };

  render() {
    const { changeChineseToLocale } = this.context;
    const { menuState, customLanguage } = this.props;
    const { orgName, searchWord, openKeys } = this.state;
    const { visible: open } = menuState;
    const urls = this.getCurrentLocation();
    const curSelectedPath = `${urls[1]}/${urls[2]}`; // url中的的前两路径
    const curOpennedMenu = curSelectedPath.split('/')[0];
    const hostname = window.location.hostname;
    const directoryStructure = getDirectoryStructre(customLanguage || defaultLanguage);
    const directoryStructureAfterFilter = filterMenuDataByOrganizationConfigAndAuth(directoryStructure);
    const filterMenu = menu => {
      return (
        menu &&
        menu
          .map(node => {
            const { title, children } = node;
            if (
              title &&
              changeChineseToLocaleWithoutIntl(title)
                .toLowerCase()
                .indexOf(searchWord.trim().toLowerCase()) !== -1
            ) {
              return node;
            } else if (!arrayIsEmpty(children)) {
              const filterChildren = filterMenu(children);
              if (filterChildren.length > 0) {
                return { ...node, children: filterChildren };
              }
            }
            return undefined;
          })
          .filter(n => n)
      );
    };
    return (
      <Layout
        className="aside-menu"
        style={{ height: '100%', minHeight: '100%', position: 'relative' }}
        onMouseOver={() => this.setState({ showOpenIcon: true })}
        onMouseOut={() => this.setState({ showOpenIcon: false })}
      >
        <div
          className={`openIcon ${!open || this.state.showOpenIcon ? 'openIcon-show' : 'openIcon-hidden'}`}
          onClick={() => this.onOpenChange()}
        >
          <span>{!open ? <BlIcon type="right" /> : <BlIcon type="left" />}</span>
        </div>

        <Sider
          style={{
            height: '100%',
            left: 0,
            overflow: !open ? 'visible' : 'auto',
          }}
          width={220}
          collapsedWidth={64}
          trigger={null}
          collapsible
          collapsed={!open}
        >
          <div className="layout-logo" style={{ textAlign: 'center', height: 50, width: '100%' }}>
            <div
              style={{
                fontSize: '18px',
                color: '#FFF',
                padding: 18,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {orgName}
            </div>
          </div>
          <Input
            placeholder="搜索"
            className={styles.inputSearch}
            onChange={searchWord => this.setState({ searchWord })}
            prefix={<Icon type={'search'} />}
          />
          <AppMenu
            mode="inline"
            theme="dark"
            selectedKeys={[curSelectedPath]}
            defaultSelectedKeys={[curSelectedPath]}
            defaultOpenKeys={[curOpennedMenu]}
            openKeys={openKeys}
            onOpenChange={openKeys => this.setState({ openKeys })}
            directoryData={filterMenu(directoryStructureAfterFilter)}
          />
          <div className={'extra-container'}>
            <a rel="noopener noreferrer" target="_blank" href="https://qrcode2.blacklake.cn/" className={'extra-link'}>
              {this.renderGcIconWithTitle({
                type: 'dayinerweima',
                title: changeChineseToLocale('打印二维码'),
                showText: menuState && menuState.visible,
              })}
            </a>
          </div>
          {hostname && !hostname.endsWith('genormis.com') ? (
            <div className={'extra-container'}>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://jinshuju.net/f/K0KX3E"
                className={'extra-link'}
              >
                {this.renderGcIconWithTitle({
                  type: '_yijianyufankui_Webcelan',
                  title: changeChineseToLocale('意见与反馈'),
                  showText: menuState && menuState.visible,
                })}
              </a>
            </div>
          ) : null}
          {menuState && menuState.visible ? (
            <div className="footer-title">
              <p>
                {window.companyName} {VERSION}
              </p>
            </div>
          ) : null}
        </Sider>
      </Layout>
    );
  }
}

BlMenu.contextTypes = {
  router: PropTypes.object,
  changeChineseToLocale: PropTypes.func,
};

export default connect(
  ({ menuState }) => ({ menuState }),
  { toggleMenu },
)(withRouter(BlMenu));
