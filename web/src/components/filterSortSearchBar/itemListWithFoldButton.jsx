/**
 * @description: 自带折叠按钮的ItemList。
 *
 * 点击折叠按钮就折叠本组件下的所有元素
 *
 * 使用方式：
 *
 * 1. 像ItemList那样使用
 * 2. 可以放在ItemList中使用。这样可以实现折叠部分Item
 *
 *
 * @date: 2019/7/16 下午5:47
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { fontSub } from 'src/styles/color';
import Icon from '../icon';
import Styles from './item.scss';

const ItemListWithFoldButton = props => {
  const [isOpen, setIsOpen] = useState(true);
  const { style, children, cbForFold } = props;

  return (
    <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', width: '80%', ...style }}>
      <div
        style={{ display: 'flex', flexWrap: 'wrap' }}
        className={isOpen ? Styles.itemListOpenState : Styles.itemListCloseState}
      >
        {children}
      </div>
      <div style={{ width: '100%', textAlign: 'center' }}>
        <div
          onClick={() => {
            setIsOpen(!isOpen);
            if (typeof cbForFold === 'function') cbForFold(!isOpen);
          }}
          style={{ display: 'inline-block', fontSize: 10, color: fontSub, cursor: 'pointer' }}
        >
          {isOpen ? <Icon type={'up'} /> : <Icon type={'down'} />}
        </div>
      </div>
    </div>
  );
};

ItemListWithFoldButton.propTypes = {
  style: PropTypes.any,
  children: PropTypes.any,
  cbForFold: PropTypes.any,
};

export default ItemListWithFoldButton;
