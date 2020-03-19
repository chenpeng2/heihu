import React, { Component } from 'react';
import { Menu } from 'antd';
import { injectIntl } from 'react-intl';

import { Icon } from 'src/components';
import { primary } from 'src/styles/color';
import { arrayIsEmpty } from 'src/utils/array';
import { changeChineseToLocale } from 'src/utils/locale/utils';

import Item from './Item';

const renderGcIconWithTitle = (props: { type: string, title: string }) => {
  const { type, title } = props;

  const COMMON_HEIGHT = '26px';
  const iconStyle = {
    fontSize: COMMON_HEIGHT,
    verticalAlign: 'middle',
    color: primary,
  };
  const titleStyle = {
    lineHeight: COMMON_HEIGHT,
    height: COMMON_HEIGHT,
    display: 'inline-block',
  };

  return (
    <React.Fragment>
      <Icon iconType="gc" type={type} style={iconStyle} />
      <span style={titleStyle}>{title}</span>
    </React.Fragment>
  );
};

const getNodeLocation = data => {
  if (!data) return null;

  const { children } = data;

  if (!Array.isArray(children)) return 'leaf';

  return 'branch';
};

const getTitle = (text, icon) => {
  if (!text) return null;

  if (text && icon) {
    return (
      <span>
        {renderGcIconWithTitle({
          type: icon,
          title: text,
        })}
      </span>
    );
  }

  if (text && !icon) {
    return text;
  }

  return null;
};

type Props = {
  style: {},
  directoryData: [],
};

class AppMenu extends Component {
  props: Props;
  state = {};

  // 递归render
  renderMenuItem = itemsArray => {
    const { intl } = this.props;
    if (!Array.isArray(itemsArray)) return null;

    return itemsArray.map(item => {
      if (!item) return null;

      const { title, children, icon, path, auth, disable, organizationConfig } = item;

      // 没有path或者disable都不显示
      if (!path) return null;
      if (disable) return null;

      const location = getNodeLocation(item);
      // 叶子节点使用MenuItem
      if (location === 'leaf') {
        // 如果需要扩展，可以从props中传递render函数
        return (
          <Item key={path} auth={auth} organizationConfig={organizationConfig}>
            {changeChineseToLocale(title, intl)}
          </Item>
        );
      }

      // 树干节点使用SubMenu
      if (location === 'branch' && !arrayIsEmpty(children)) {
        return (
          <Menu.SubMenu key={path} title={getTitle(changeChineseToLocale(title, intl), icon)}>
            {this.renderMenuItem(children)}
          </Menu.SubMenu>
        );
      }

      return null;
    });
  };

  render() {
    const { directoryData, ...rest } = this.props;
    const children = this.renderMenuItem(directoryData);

    return <Menu {...this.props}>{children}</Menu>;
  }
}

export default injectIntl(AppMenu);
