import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { getQuery } from 'src/routes/getRouteParams';

import { Input, Button, Select, withForm, FilterSortSearchBar, FormattedMessage } from 'src/components';
import { white } from 'src/styles/color/index';

const { Option } = Select;
const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;

type Props = {
  form: any,
  match: any,
  fetchData: () => {},
};

class FilterForProcessRoutesList extends Component {
  props: Props;

  state = {};

  componentDidMount() {
    const { match, form } = this.props;
    const { code, name, status, processCode, processName } = getQuery(match);
    form.setFieldsValue({
      code,
      name,
      status: status === null ? 'all' : status && Number(status),
      processCode,
      processName,
    });
  }

  reFetchData = p => {
    const { fetchData, form } = this.props;
    const { getFieldsValue } = form || {};
    const value = getFieldsValue();
    const _value = { page: 1, ...value, ...p };
    if (typeof _value.status !== 'number') _value.status = null;
    if (fetchData && typeof fetchData === 'function') fetchData(_value);
  };

  render() {
    const { form, fetchData } = this.props;
    const { getFieldDecorator, getFieldsValue } = form;

    return (
      <div
        onKeyDown={e => {
          if (e.keyCode === 13) {
            this.reFetchData();
          }
        }}
      >
        <FilterSortSearchBar style={{ backgroundColor: white, width: '100%' }} searchDisabled>
          <ItemList>
            <Item label="编号">{getFieldDecorator('code')(<Input />)}</Item>
            <Item label="名称">{getFieldDecorator('name')(<Input />)}</Item>
            <Item label="发布状态">
              {getFieldDecorator('status', {
                initialValue: 'all',
              })(
                <Select allowClear>
                  <Option value={'all'}>
                    <FormattedMessage defaultMessage={'全部'} />
                  </Option>
                  <Option value={1}>
                    <FormattedMessage defaultMessage={'已发布'} />
                  </Option>
                  <Option value={0}>
                    <FormattedMessage defaultMessage={'未发布'} />
                  </Option>
                </Select>,
              )}
            </Item>
            <Item label="工序编号">{getFieldDecorator('processCode')(<Input />)}</Item>
            <Item label="工序名称">{getFieldDecorator('processName')(<Input />)}</Item>
          </ItemList>
          <Button
            icon="search"
            onClick={() => {
              this.reFetchData();
            }}
          >
            查询
          </Button>
        </FilterSortSearchBar>
      </div>
    );
  }
}

export default withForm({}, withRouter(FilterForProcessRoutesList));
