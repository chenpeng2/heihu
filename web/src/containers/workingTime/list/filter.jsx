import React, { Component } from 'react';

import { Input, withForm, FilterSortSearchBar, Select, Button } from 'components';
import { middleGrey } from 'src/styles/color';

import { STATUS_DISPLAY } from '../constant';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;

type Props = {
  style: {},
  fetchData: () => {},
  form: any,
};

class Filter extends Component {
  props: Props;
  state = {};

  renderStatusOptions = () => {
    const status_options = Object.entries(STATUS_DISPLAY).map(([key, value]) => {
      return (
        <Option key={key} value={key}>
          {value}
        </Option>
      );
    });

    status_options.unshift(
      <Option key={'all'} value={null}>
        {'全部'}
      </Option>,
    );

    return status_options;
  };

  render() {
    const { form, fetchData } = this.props;
    const { getFieldDecorator, getFieldsValue, resetFields } = form || {};

    return (
      <div>
        <FilterSortSearchBar searchDisabled>
          <ItemList>
            <Item labelStyle={{ width: 'auto' }} label={'名称'}>
              {getFieldDecorator('name')(<Input placeholder={null} className="select-input" />)}
            </Item>
            <Item label="状态">
              {getFieldDecorator('status', {
                initialValue: null,
              })(
                <Select placeholder={null} allowClear>
                  {this.renderStatusOptions()}
                </Select>,
              )}
            </Item>
          </ItemList>
          <Button
            icon="search"
            onClick={() => {
              const value = getFieldsValue();

              fetchData({ ...value, page: 1 });
            }}
          >
            查询
          </Button>
          <div
            style={{ color: middleGrey, cursor: 'pointer', margin: '0 5px', lineHeight: '28px' }}
            onClick={() => {
              resetFields();
              fetchData({
                page: 1,
                status: null,
                name: null,
              });
            }}
          >
            重置
          </div>
        </FilterSortSearchBar>
      </div>
    );
  }
}

export default withForm({}, Filter);
