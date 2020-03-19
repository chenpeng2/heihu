import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withForm, FilterSortSearchBar, Input, Select, Button, Link } from 'components';
import SearchSelect from 'src/components/select/searchSelect';
import { PURCHASE_LIST_STATUS } from 'src/constants';
import { setLocation } from 'utils/url';
import { ORGANIZATION_CONFIG, getOrganizationConfigFromLocalStorage } from 'src/utils/organizationConfig';
import { getFormatParams } from 'src/containers/purchase_list/util/getFormatParams';
import { getQuery } from 'src/routes/getRouteParams';
import { middleGrey } from 'src/styles/color';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;

type Props = {
  match: {},
  style: {},
  location: any,
  history: any,
  fetch_purchase_list_data: () => {},
  form: any,
};

class Purchase_List_Filter extends Component {
  props: Props;
  state = {};

  componentWillMount() {
    const config = getOrganizationConfigFromLocalStorage();
    this.setState({ config });
  }

  componentDidMount() {
    const { match, form } = this.props;
    const queryMatch = getQuery(match);
    form.setFieldsValue(queryMatch);
  }

  onSearch = () => {
    const { form, fetch_purchase_list_data } = this.props;
    const { getFieldsValue } = form;
    const value = { ...getFieldsValue(), page: 1 };
    fetch_purchase_list_data(value);
  };

  render_status_options = () => {
    const { changeChineseToLocale } = this.context;
    const status_options = Object.entries(PURCHASE_LIST_STATUS).map(([key, value]) => {
      return (
        <Option key={key} value={key.slice(1)}>
          {changeChineseToLocale(value)}
        </Option>
      );
    });
    status_options.unshift(
      <Option key={'all'} value={null}>
        {changeChineseToLocale('全部')}
      </Option>,
    );
    return status_options;
  };

  render() {
    const { form, fetch_purchase_list_data } = this.props;
    const { config } = this.state;
    const { getFieldDecorator, resetFields } = form || {};
    const configValue =
      config &&
      config[ORGANIZATION_CONFIG.taskDispatchType] &&
      config[ORGANIZATION_CONFIG.taskDispatchType].configValue;

    return (
      <FilterSortSearchBar searchFn={this.onSearch}>
        <ItemList>
          <Item label={'编号'}>
            {getFieldDecorator('procureOrder')(<SearchSelect placeholder="请选择" type="procureOrder" />)}
          </Item>
          <Item label="状态">
            {getFieldDecorator('status')(
              <Select labelInValue placeholder="请选择" allowClear>
                {this.render_status_options()}
              </Select>,
            )}
          </Item>
          <Item label="订单编号">
            {getFieldDecorator('purchaseOrder')(<SearchSelect placeholder="请选择销售订单" type="purchaseOrder" />)}
          </Item>
          <Item label={configValue === 'manager' ? '计划工单编号' : '项目编号'}>
            {getFieldDecorator('project')(
              <SearchSelect placeholder="请选择" type={configValue === 'manager' ? 'plannedTicketList' : 'project'} />,
            )}
          </Item>
          <Item label="供应商">
            {getFieldDecorator('supplier')(<SearchSelect placeholder="请选择供应商" type="supplier" />)}
          </Item>
          <Item label="物料编号">{getFieldDecorator('materialCode')(<Input placeholder="请输入物料编号" />)}</Item>
        </ItemList>
        <Button icon="search" onClick={this.onSearch}>
          查询
        </Button>
        <Link
          style={{ lineHeight: '30px', height: '28px', color: '#8C8C8C', paddingLeft: 16 }}
          onClick={() => {
            resetFields();
            fetch_purchase_list_data({
              ...form.getFieldsValue(),
              page: 1,
            });
          }}
        >
          重置
        </Link>
      </FilterSortSearchBar>
    );
  }
}

Purchase_List_Filter.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export default withForm({}, withRouter(Purchase_List_Filter));
