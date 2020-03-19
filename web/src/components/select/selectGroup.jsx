/**
 * @description: 更新传入的group数组自动生成select
 *
 * @date: 2019/6/17 下午3:06
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';

import { arrayIsEmpty } from 'src/utils/array';

const Option = Select.Option;

const SelectGroup = props => {
  const { groupData, intl, ...rest } = props;
  return (
    <Select placeholder={'请选择'} {...rest}>
      {arrayIsEmpty(groupData)
        ? null
        : groupData.map(i => {
            const { value, label } = i || {};
            return (
              <Option value={value} key={value}>
                {changeChineseToLocale(label, intl)}
              </Option>
            );
          })}
    </Select>
  );
};

SelectGroup.propTypes = {
  style: PropTypes.any,
  groupData: PropTypes.any, // groupData的格式：[{ value: xx label: xx }]，value需要保证唯一性
};

export default injectIntl(SelectGroup);
