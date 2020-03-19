/**
 * @description: 转移申请占用的filter
 *
 * @date: 2019/5/8 上午10:19
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Input, Icon, Button, FilterSortSearchBar } from 'src/components';
import { middleGrey } from 'src/styles/color';

const Item = FilterSortSearchBar.Item;
const ItemList = FilterSortSearchBar.ItemList;

const formatFilterValue = formValue => {
  if (!formValue) return null;
  const { transferApplyCode } = formValue;
  return { code: transferApplyCode };
};

class Filter extends Component {
  state = {};

  renderButtons = () => {
    const { form, refetch } = this.props;
    const { changeChineseToLocale } = this.context;

    return (
      <div>
        <Button
          style={{ width: 86 }}
          onClick={() => {
            form.validateFieldsAndScroll((err, value) => {
              if (!err && typeof refetch === 'function') {
                refetch({ ...(formatFilterValue(value) || {}), page: 1 });
              }
            });
          }}
        >
          <Icon type={'search'} />
          {changeChineseToLocale('查询')}
        </Button>
        <span
          onClick={() => {
            form.resetFields();
            form.validateFieldsAndScroll((err, value) => {
              if (!err && typeof refetch === 'function') {
                refetch({ ...(formatFilterValue(value) || {}), page: 1 });
              }
            });
          }}
          style={{ color: middleGrey, margin: '0px 10px', lineHeight: '28px', cursor: 'pointer' }}
        >
          {changeChineseToLocale('重置')}
        </span>
      </div>
    );
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <FilterSortSearchBar>
        <ItemList>
          <Item labelStyle={{ width: 'auto' }} label={'转移申请'} itemWrapperStyle={{ paddingRight: 0 }}>
            {getFieldDecorator('transferApplyCode')(<Input />)}
          </Item>
        </ItemList>
        <div>{this.renderButtons()}</div>
      </FilterSortSearchBar>
    );
  }
}

Filter.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
};

Filter.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default Filter;
