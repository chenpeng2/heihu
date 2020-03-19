/**
 * @description: 为item中需要使用FormItem实现的，如果不需要使用formItem无需使用这个组件。
 * 无法使用item的原因：1. label的存在，2. 需要对antd的样式复写
 *
 * 使用方式：将FormItem作为这个组件的children即可
 *
 * 可以和Item一起使用
 *
 * 实现中不使用React.cloneElement改变width的原因是因为改变FormItem样式的效果，无法影响FormItem下面组件的样式
 * FormItem不会将样式传递下去。所以有时候要在FormItem下的元素上加上width: 100%
 *
 * @date: 2019/4/15 下午12:13
 */
import React from 'react';
import PropTypes from 'prop-types';

import styles from './item.scss';

const ItemForFormItem = ({ children }) => {
  return (
    <div
      className={styles.itemForFormItem}
      style={{
        width: '33%',
        paddingRight: 40,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
};

ItemForFormItem.propTypes = {
  style: PropTypes.object,
};

export default ItemForFormItem;
