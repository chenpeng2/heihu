import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Input } from 'antd';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { Searchselect, FilterSortSearchBar, Icon, Select, withForm, Button } from 'src/components';
import { white, borderGrey, middleGrey } from 'src/styles/color/index';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;

type Props = {
  form: any,
  handleSearch: () => {},
  match: {
    location: {},
  },
};

class FilterForStorage extends Component {
  props: Props;
  state = {};

  renderButton = () => {
    const { handleSearch, form } = this.props;
    const { changeChineseToLocale } = this.context;
    return (
      <div>
        <Button style={{ width: 86 }} onClick={handleSearch}>
          <Icon type={'search'} />
          {changeChineseToLocale('查询')}
        </Button>
        <span
          onClick={() => {
            form.resetFields();
            handleSearch();
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
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator } = form;
    const field = [
      {
        label: '全部',
        key: '',
      },
      {
        label: '仓库',
        key: '1',
      },
      {
        label: '车间库',
        key: '2',
      },
    ];
    const status = [
      {
        label: '全部',
        key: '',
      },
      {
        label: '启用',
        key: '1',
      },
      {
        label: '停用',
        key: '0',
      },
    ];

    return (
      <div className="search-select-input">
        <FilterSortSearchBar
          style={{ backgroundColor: white, width: '100%', borderBottom: `1px solid ${borderGrey}` }}
          searchDisabled
        >
          <ItemList>
            <Item label={'仓库状态'}>
              {getFieldDecorator('warehouseStatus', {
                initialValue: { key: '1', label: '启用' },
                onChange: v => {
                  this.setState({ warehouseStatus: _.get(v, 'key', 1) }, () => {
                    form.resetFields(['warehouseCode']);
                  });
                },
              })(
                <Select allowClear placeholder="请选择" key="status" labelInValue>
                  {status.map(({ key, label }) => (
                    <Select.Option key={key} value={key}>
                      {changeChineseToLocale(label)}
                    </Select.Option>
                  ))}
                </Select>,
              )}
            </Item>
            <Item label={'仓库类型'}>
              {getFieldDecorator('warehouseType', {
                initialValue: { key: '', label: '全部' },
                onChange: v => {
                  this.setState({ warehouseTypeValue: _.get(v, 'key', null) }, () => {
                    form.resetFields(['warehouseCode']);
                  });
                },
              })(
                <Select allowClear placeholder="请选择" key="category" labelInValue>
                  {field.map(({ key, label }) => (
                    <Select.Option key={key} value={key}>
                      {changeChineseToLocale(label)}
                    </Select.Option>
                  ))}
                </Select>,
              )}
            </Item>
            <Item label={'仓库'}>
              {getFieldDecorator('warehouseCode')(
                <Searchselect
                  params={{
                    category: this.state.warehouseTypeValue || null,
                    status: this.state.warehouseStatus || null,
                  }}
                  type={'wareHouseWithCode'}
                />,
              )}
            </Item>
            <Item label="仓位">
              {getFieldDecorator('search')(
                <Input
                  placeholder={changeChineseToLocale('请输入搜索内容')}
                  style={{ margin: '0 100px 0 5px', width: 200, height: 32 }}
                />,
              )}
            </Item>
            <Item label="仓位状态">
              {getFieldDecorator('storageStatus', { initialValue: { key: '1', label: '启用' } })(
                <Select allowClear placeholder="请选择" key="status" labelInValue>
                  {status.map(({ key, label }) => (
                    <Select.Option key={key} value={key}>
                      {changeChineseToLocale(label)}
                    </Select.Option>
                  ))}
                </Select>,
              )}
            </Item>
          </ItemList>
          {this.renderButton()}
        </FilterSortSearchBar>
      </div>
    );
  }
}

FilterForStorage.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export const SEARCH_TYPE = {
  storage: 'storage',
  warehouse: 'warehouse',
};

export const formatFilerValue = (value, type) => {
  if (!value) return null;
  const { warehouseStatus, warehouseType, warehouseCode, search, storageStatus, ...rest } = value || {};
  if (type === SEARCH_TYPE.storage) {
    return {
      search,
      warehouseStatus: warehouseStatus ? warehouseStatus.key : null, // 仓库status
      status: storageStatus ? storageStatus.key : null, // 仓位状态
      warehouseCodes: warehouseCode ? warehouseCode.key : null,
      category: warehouseType ? warehouseType.key : null,
      ...rest,
    };
  }

  return {
    search,
    status: warehouseStatus ? warehouseStatus.key : null,
    storageStatus: storageStatus ? storageStatus.key : null,
    warehouseCode: warehouseCode ? warehouseCode.key : null,
    category: warehouseType ? warehouseType.key : null,
    ...rest,
  };
};

export default withForm({}, withRouter(FilterForStorage));
