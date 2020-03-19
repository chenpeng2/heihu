import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';

import { Input, Link, Button, withForm, Searchselect, Select, FilterSortSearchBar } from 'components';
import { getQuery } from 'src/routes/getRouteParams';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';

import { ProductSelect, EbomSelect, WorkstationSelect } from '../../base';

const Option = Select.Option;
const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const baseFormItemStyle = {
  width: 200,
};

type Props = {
  form: any,
  match: any,
  fetchData: () => {},
};

class FilterForList extends Component {
  props: Props;
  state = {};

  componentDidMount() {
    this.setLastFilterData();
  }

  setLastFilterData = () => {
    const lastQuery = getQuery(this.props.match);
    this.props.form.setFieldsValue(lastQuery);
  };

  onSearch = () => {
    const values = this.props.form.getFieldsValue();
    this.props.fetchData({ ...values, page: 1, size: 10 });
  };

  render() {
    const {
      form: { getFieldDecorator, resetFields, getFieldValue },
    } = this.props;

    return (
      <div
        style={{
          borderBottom: '1px solid rgb(232, 232, 232)',
          marginBottom: 20,
        }}
        onKeyDown={e => {
          if (e.keyCode === 13) {
            this.onSearch();
          }
        }}
      >
        <FilterSortSearchBar>
          <ItemList>
            <Item label="定义编码">
              {getFieldDecorator('code')(
                <Input placeholder="请输入定义编码" style={baseFormItemStyle} autocomplete="off" trim="true" />,
              )}
            </Item>
            <Item label="成品物料">
              {getFieldDecorator('productCode')(
                <ProductSelect allowClear placeholder="请选择成品物料" style={baseFormItemStyle} />,
              )}
            </Item>
            <Item label="物料清单版本">
              {getFieldDecorator('ebomVersion')(
                <EbomSelect allowClear placeholder="请选择物料清单版本号" style={baseFormItemStyle} />,
              )}
            </Item>
            <Item label="工位">
              {getFieldDecorator('workstationId')(
                <WorkstationSelect allowClear style={baseFormItemStyle} placeholder="请选择工位" />,
              )}
            </Item>
            <Item label="当前状态">
              {getFieldDecorator('status', {
                initialValue: null,
              })(
                <Select style={baseFormItemStyle}>
                  <Option value={null}>{changeChineseToLocaleWithoutIntl('全部')}</Option>
                  <Option value={1}>{changeChineseToLocaleWithoutIntl('启用中')}</Option>
                  <Option value={2}>{changeChineseToLocaleWithoutIntl('停用中')}</Option>
                </Select>,
              )}
            </Item>
          </ItemList>
          <div>
            <Button onClick={this.onSearch}>查询</Button>
            <Link
              style={{
                color: '#8C8C8C',
                paddingLeft: 10,
              }}
              onClick={() => {
                resetFields();
                this.onSearch();
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

export default withForm({}, withRouter(FilterForList));
