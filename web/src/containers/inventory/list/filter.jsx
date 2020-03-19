import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { StorageSelectWithWorkDepartments, Link, withForm, FilterSortSearchBar, Button, Select } from 'src/components';
import SearchSelect from 'src/components/select/searchSelect';
import { middleGrey } from 'src/styles/color';
import { QUALITY_STATUS } from 'src/views/qualityManagement/constants';
import { getParams } from 'src/utils/url';

const Option = Select.Option;
const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;

// 将filer的数据格式化
export const formatFilterValueForSearch = value => {
  if (!value) return {};
  const { qcStatus, area, material, ...rest } = value;

  // 获取仓位id，主要是将仓位id分类

  const _value = {
    qcStatus,
    materialCode: material ? material.key : null,
    page: 1,
    ...rest,
  };

  if (area && area.length) {
    let id = '';
    const level = area[0].split(',')[2];
    if (level === '3') {
      id = area.map(n => n.split(',')[0]).join(',');
    } else {
      id = area[0].split(',')[0];
    }
    _value.houseId = level === '1' ? id : null;
    _value.firstStorageId = level === '2' ? id : null;
    _value.secondStorageId = level === '3' ? id : null;
  }

  return _value;
};

type Props = {
  style: {},
  form: any,
  fetchData: () => {},
  match: any,
};

class Filter extends Component {
  props: Props;
  state = {};

  componentDidMount() {
    this.setFormValue();
  }

  setFormValue = () => {
    const { form, fetchData } = this.props;
    const { queryObj } = getParams();
    const { filter } = queryObj || {};
    if (typeof fetchData === 'function') fetchData({ filter });
    if (filter) {
      form.setFieldsValue(filter);
    }
  };

  onClickForFilter = () => {
    const { form, fetchData } = this.props;
    const { getFieldsValue } = form || {};
    const value = getFieldsValue();

    if (sensors) {
      sensors.track('web_stock_inventory_search', {
        FilterCondition: value,
      });
    }
    if (typeof fetchData === 'function') fetchData({ filter: value, page: 1 });
  };

  renderQcStatusSelect = () => {
    const { changeChineseToLocale } = this.context;
    const options = Object.entries(QUALITY_STATUS).map(([value, content]) => {
      const { name } = content || {};
      return (
        <Option key={value} value={value}>
          {changeChineseToLocale(name)}
        </Option>
      );
    });
    options.unshift(
      <Option value={null} key={'all'}>
        {changeChineseToLocale('全部')}
      </Option>,
    );

    return <Select>{options}</Select>;
  };

  render() {
    const { form, match } = this.props;
    const { getFieldDecorator, resetFields } = form || {};

    return (
      <div>
        <FilterSortSearchBar searchDisabled>
          <ItemList>
            <Item label={'区域'}>{getFieldDecorator('area')(<StorageSelectWithWorkDepartments match={match} />)}</Item>
            <Item label={'质量状态'}>
              {getFieldDecorator('qcStatus', {
                initialValue: null,
              })(this.renderQcStatusSelect())}
            </Item>
            <Item label={'物料'}>{getFieldDecorator('material')(<SearchSelect type={'materialBySearch'} />)}</Item>
          </ItemList>
          <div>
            <Button icon="search" onClick={this.onClickForFilter}>
              查询
            </Button>
            <Link
              style={{ color: middleGrey, margin: '0 10px', cursor: 'pointer', verticalAlign: 'middle' }}
              onClick={() => {
                resetFields();
                this.setState({ isReset: true }, () => {
                  this.setState({ isReset: false });
                });
                this.onClickForFilter();
              }}
            >
              重置
            </Link>
          </div>
        </FilterSortSearchBar>
      </div>
    );
  }
}

Filter.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, withRouter(Filter));
