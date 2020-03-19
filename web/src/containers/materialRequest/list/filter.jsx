import React, { Component } from 'react';

import { Input, withForm, FilterSortSearchBar, Select, Button } from 'components';
import { middleGrey } from 'src/styles/color';
import SearchSelect from 'src/components/select/searchSelect';

import { STATUS } from '../constant';
import FirstStorageSelect from '../base/form/firstStorageSelect';

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
    const status_options = Object.entries(STATUS).map(([key, v]) => {
      const { value, name } = v || {};
      return (
        <Option key={value} value={value}>
          {name}
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
            <Item label={'编号'}>
              {getFieldDecorator('searchRequestCode')(<Input placeholder={null} className="select-input" />)}
            </Item>
            <Item label="状态">
              {getFieldDecorator('searchRequestStatus', {
                initialValue: null,
              })(
                <Select placeholder={null} allowClear>
                  {this.renderStatusOptions()}
                </Select>,
              )}
            </Item>
            <Item label="仓位">{getFieldDecorator('searchSourceStorage')(<FirstStorageSelect />)}</Item>
            <Item label="订单编号">
              {getFieldDecorator('searchpurchaseOrderCode')(<SearchSelect type={'purchaseOrder'} />)}
            </Item>
            <Item label="项目编号">{getFieldDecorator('searchProjectCode')(<SearchSelect type={'project'} />)}</Item>
          </ItemList>
          <Button
            icon="search"
            onClick={() => {
              const value = getFieldsValue();
              const { searchSourceStorage, searchpurchaseOrderCode, searchProjectCode } = value || {};

              const res = {
                ...value,
                searchProjectCode: searchProjectCode ? searchProjectCode.key : null,
                searchpurchaseOrderCode: searchpurchaseOrderCode ? searchpurchaseOrderCode.key : null,
                searchSourceStorageId:
                  searchSourceStorage && searchSourceStorage.value ? searchSourceStorage.value.split('-')[1] : null,
              };
              fetchData({ ...res, page: 1 });
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
                searchRequestCode: null,
                searchRequestStatus: null,
                searchSourceStorageId: null,
                searchpurchaseOrderCode: null,
                searchProjectCode: null,
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
