import React, { Component } from 'react';
import { Dropdown, Menu } from 'antd';
import PropTypes from 'prop-types';
import { Icon } from 'components';
import LocalStorage from 'utils/localStorage';
import { FIELDS } from 'src/constants';

/**
 * @api {ActionInfo} 展示用户信息的按钮.
 * @APIGroup ActionInfo.
 * @apiParam {Obj} viewer 包含了用户的name和id.
 * @apiExample {js} Example usage:
 * <AccountInfo viewer={viewer} />
 */

const inlineBlockStyle = {
  display: 'inline-block',
  marginLeft: 4,
};

export const logout = () => {
  LocalStorage.remove(FIELDS.TOKEN_NAME);
  LocalStorage.remove(FIELDS.AUTH);
  if (sensors) {
    sensors.logout();
  }
  setTimeout(() => {
    window.location.pathname = '/login';
  }, 500);
};

class AccountInfo extends Component {
  props: {
    user: any,
  };

  state = {};

  renderMenu = () => {
    const { changeChineseToLocale } = this.context;

    return (
      <Menu onClick={() => logout()}>
        <Menu.Item>
          <span>{changeChineseToLocale('退出')}</span>
        </Menu.Item>
      </Menu>
    );
  };

  render() {
    const { user, ...rest } = this.props;
    return (
      <Dropdown trigger={['click']} overlay={this.renderMenu()}>
        <div style={{ cursor: 'pointer' }} {...rest}>
          <Icon iconType="gc" type="yonghu" style={{ fontSize: '20px' }} />
          <span style={{ ...inlineBlockStyle, fontSize: '14px' }}>{user && user.name}</span>
        </div>
      </Dropdown>
    );
  }
}

AccountInfo.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default AccountInfo;
