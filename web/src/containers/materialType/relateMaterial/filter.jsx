import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Input, FilterSortSearchBar, withForm, Link } from 'src/components';
import { middleGrey, white } from 'src/styles/color';
import SearchSelectForMaterialType from 'src/containers/materialType/baseComponent/searchSelectForMaterialType';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;

const formatFormValue = params => {
  const { materialTypeId, ...rest } = params || {};
  return { materialTypeIds: materialTypeId ? materialTypeId.key : undefined, ...rest };
};

class filter extends Component {
  state = {};

  reFetchData = params => {
    const { fetchData } = this.props;

    if (typeof fetchData === 'function') {
      fetchData({ ...(formatFormValue(params) || {}), page: 1 });
    }
  };

  render() {
    const { form, style, setPage } = this.props;
    const { getFieldDecorator, getFieldsValue, resetFields } = form || {};

    return (
      <div
        style={{
          backgroundColor: white,
          width: '100%',
          display: 'flex',
          justifyContent: 'space-around',
          padding: 20,
          ...style,
        }}
      >
        <ItemList>
          <Item itemWrapperStyle={{ paddingRight: 40 }} labelStyle={{ width: null }} label="物料编号">
            {getFieldDecorator('codeLike')(<Input style />)}
          </Item>
          <Item itemWrapperStyle={{ paddingRight: 40 }} label="物料名称">
            {getFieldDecorator('name')(<Input />)}
          </Item>
          <Item itemWrapperStyle={{ paddingRight: 55 }} label="规格描述">
            {getFieldDecorator('desc')(<Input />)}
          </Item>
          <Item itemWrapperStyle={{ paddingRight: 40 }} labelStyle={{ width: null }} label="物料类型">
            {getFieldDecorator('materialTypeId')(<SearchSelectForMaterialType style={{ width: '100%' }} status={1} />)}
          </Item>
        </ItemList>
        <Button
          icon="search"
          onClick={() => {
            const value = getFieldsValue();
            const _value = { page: 1, ...value, status: typeof value.status === 'number' ? value.status : null };
            this.reFetchData(_value);
            if (typeof setPage === 'function') setPage(1);
          }}
        >
          查询
        </Button>
        <Link
          type="grey"
          style={{ marginLeft: 10 }}
          onClick={() => {
            resetFields();
            const value = getFieldsValue();
            this.reFetchData(value);
            if (typeof setPage === 'function') setPage(1);
          }}
        >
          重置
        </Link>
      </div>
    );
  }
}

filter.propTypes = {
  style: PropTypes.object,
  fetchData: PropTypes.any,
  setPage: PropTypes.func,
};

export default withForm({ className: 'test' }, filter);
