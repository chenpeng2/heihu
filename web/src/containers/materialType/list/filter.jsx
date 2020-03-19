import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Input, Select, FilterSortSearchBar, withForm, FormattedMessage } from 'src/components';
import { middleGrey, white } from 'src/styles/color';
import { getSearchInLocation } from 'src/routes/getRouteParams';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { MATERIAL_TYPE_STATUS } from '../utils';

const RESET = changeChineseToLocaleWithoutIntl('重置');
const { Option } = Select;
const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;

class Filter extends Component {
  state = {};

  componentDidMount() {
    const { form } = this.props;
    const { setFieldsValue } = form || {};
    const { filter } = getSearchInLocation();

    setFieldsValue(filter);
  }

  renderStatusSelect = props => {
    const options = Object.values(MATERIAL_TYPE_STATUS).map(i => {
      const { name, value } = i || {};
      return <Option value={value}> {name}</Option>;
    });
    options.unshift(
      <Option value={'all'}>
        <FormattedMessage defaultMessage={'全部'} />
      </Option>,
    );

    return (
      <Select allowClear {...props}>
        {options}
      </Select>
    );
  };

  reFetchData = (value, originalValue) => {
    const { fetchData } = this.props;
    if (fetchData && typeof fetchData === 'function') fetchData({ ...value, page: 1 }, originalValue);
  };

  fetchDataForSearch = p => {
    const { form } = this.props;
    const { getFieldsValue } = form || {};
    const value = getFieldsValue();
    const _value = { page: 1, ...value, ...p };
    if (typeof _value.status !== 'number') _value.status = null;
    this.reFetchData(_value, value);
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator, getFieldsValue, resetFields } = form || {};

    return (
      <div
        onKeyDown={e => {
          if (e.keyCode === 13) {
            this.fetchDataForSearch();
          }
        }}
      >
        <FilterSortSearchBar style={{ backgroundColor: white, width: '100%' }} searchDisabled>
          <ItemList>
            <Item labelStyle={{ width: null }} label="编号">
              {getFieldDecorator('code')(<Input />)}
            </Item>
            <Item label="名称">{getFieldDecorator('name')(<Input />)}</Item>
            <Item label="状态">
              {getFieldDecorator('status', {
                initialValue: 'all',
              })(this.renderStatusSelect())}
            </Item>
          </ItemList>
          <Button
            icon="search"
            onClick={() => {
              this.fetchDataForSearch();
            }}
          >
            查询
          </Button>
          <span
            style={{ color: middleGrey, marginLeft: 10, paddingTop: '5px', cursor: 'pointer' }}
            onClick={() => {
              resetFields();
              const value = getFieldsValue();
              value.status = null;
              this.reFetchData({ ...value, page: 1 });
            }}
          >
            {RESET}
          </span>
        </FilterSortSearchBar>
      </div>
    );
  }
}

Filter.propTypes = {
  style: PropTypes.object,
  fetchData: PropTypes.any,
  form: PropTypes.any,
};

export default withForm({}, Filter);
