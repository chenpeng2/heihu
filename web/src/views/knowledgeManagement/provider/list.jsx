import React, { Component } from 'react';
import _ from 'lodash';
import { middleGrey } from 'src/styles/color';
import { Spin, withForm, Input, Button, FilterSortSearchBar, Select, FormattedMessage } from 'src/components';
import LinkToCreateProvider from 'src/containers/provider/base/linkToCreateProvider';
import Table from 'src/containers/provider/list/table';
import { getProviderList } from 'src/services/provider';
import { setLocation, getParams } from 'utils/url';

type Props = {
  match: any,
};

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;

class List extends Component {
  props: Props;
  state = {
    data: [],
    pagination: {},
    loading: false,
  };

  componentDidMount() {
    const { queryObj } = getParams();
    this.props.form.setFieldsValue(queryObj);
    this.fetchAndSetData();
  }

  fetchAndSetData = async q => {
    const {
      form: { getFieldsValue },
    } = this.props;
    this.setState({ loading: true });
    const params = setLocation(this.props, query => ({
      page: 1,
      ...query,
      ...getFieldsValue(),
      ...q,
    }));
    const {
      data: { data, count },
    } = await getProviderList(params).finally(() => {
      this.setState({ loading: false });
    });
    this.setState({
      data,
      pagination: {
        current: params && params.page,
        total: count,
        pageSize: (params && params.size) || 10,
      },
    });
  };

  renderHeader = () => {
    const {
      form: { getFieldDecorator, resetFields },
    } = this.props;
    return (
      <div style={{ padding: '10px 20px' }}>
        <FilterSortSearchBar
          searchFn={() => {
            this.fetchAndSetData({ page: 1 });
          }}
        >
          <ItemList>
            <Item label="供应商名称">{getFieldDecorator('name')(<Input />)}</Item>
            <Item label="供应商编号">{getFieldDecorator('codeSearch')(<Input />)}</Item>
            <Item label="状态">
              {getFieldDecorator('status', {
                initialValue: -1,
              })(
                <Select>
                  <Option value={-1}>
                    <FormattedMessage defaultMessage={'全部'} />
                  </Option>
                  <Option value={1}>
                    <FormattedMessage defaultMessage={'启用中'} />
                  </Option>
                  <Option value={0}>
                    <FormattedMessage defaultMessage={'停用中'} />
                  </Option>
                </Select>,
              )}
            </Item>
          </ItemList>
          <div>
            <Button
              icon={'search'}
              onClick={() => {
                this.fetchAndSetData({ page: 1 });
              }}
            >
              查询
            </Button>
            <FormattedMessage
              defaultMessage={'重置'}
              style={{ color: middleGrey, margin: '0 10px', cursor: 'pointer' }}
              onClick={() => {
                resetFields();
                this.fetchAndSetData({ page: 1 });
              }}
            />
          </div>
        </FilterSortSearchBar>
        <LinkToCreateProvider />
      </div>
    );
  };

  renderTable = () => {
    const { data, pagination } = this.state;

    return <Table fetchData={this.fetchAndSetData} pagination={pagination} data={data} />;
  };

  render() {
    const { loading } = this.state;

    return (
      <Spin spinning={loading}>
        {this.renderHeader()}
        {this.renderTable()}
      </Spin>
    );
  }
}

export default withForm({}, List);
