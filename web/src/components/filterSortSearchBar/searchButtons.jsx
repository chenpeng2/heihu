/**
 * @description: filter的搜索和重置按钮。
 *
 * 如果需要回调函数自行添加props。但不能将这个组件改为其他用途。这个组件只包括filter中的右侧搜索和重置按钮
 *
 * @date: 2019/6/17 下午2:58
 */
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

import { middleGrey } from 'src/styles/color';
import { changeChineseToLocale } from 'src/utils/locale/utils';

import Button from '../button';
import Icon from '../icon';

// 搜索和重置按钮
const FilerSearchButtons = props => {
  const { form, refetch, style, intl, resetFn } = props;

  return (
    <div style={style}>
      <Button
        style={{ width: 86 }}
        onClick={() => {
          form.validateFieldsAndScroll((err, value) => {
            if (!err && typeof refetch === 'function') {
              refetch({ filter: value, size: 10, page: 1 });
            }
          });
        }}
      >
        <Icon type={'search'} />
        {changeChineseToLocale('查询', intl)}
      </Button>
      <span
        onClick={() => {
          form.resetFields();

          if (typeof resetFn === 'function') {
            resetFn();
          }

          form.validateFieldsAndScroll((err, value) => {
            if (!err && typeof refetch === 'function') {
              refetch({ filter: value, size: 10, page: 1 });
            }
          });
        }}
        style={{ color: middleGrey, margin: '0px 10px', lineHeight: '28px', cursor: 'pointer' }}
      >
        {changeChineseToLocale('重置', intl)}
      </span>
    </div>
  );
};

FilerSearchButtons.propTypes = {
  style: PropTypes.any,
  form: PropTypes.any,
  refetch: PropTypes.any,
  resetFn: PropTypes.any,
};

export default injectIntl(FilerSearchButtons);
