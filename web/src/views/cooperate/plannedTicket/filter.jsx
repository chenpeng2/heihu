import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import moment, { formatToUnix, dayStart, dayEnd } from 'utils/time';
import { getBaitingWorkOrderConfig, getInjectWorkOrderConfig } from 'utils/organizationConfig';
import { AutoComplete, withForm, Button, Link, Select, Input, FilterSortSearchBar, DatePicker } from 'src/components';
import SelectWithIntl from 'components/select/selectWithIntl';
import { getQuery } from 'src/routes/getRouteParams';
import SearchSelect from 'src/components/select/searchSelect';
import { white } from 'src/styles/color';
import { getAuditConfig } from 'src/containers/plannedTicket/util';
import { planTicketMap } from 'constants';
import { organizationPlanTicketCategory } from './utils';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;
const { MaterialAutoComplete } = AutoComplete;
const auditConfig = getAuditConfig('workOrderAudit');

type propsTypes = {
  match: any,
  customFields: [],
  form: {
    getFieldDecorator: () => {},
    getFieldsValue: () => {},
    resetFields: () => {},
    setFieldsValue: () => {},
  },
  fetchData: () => {},
};

const ticketType = [
  {
    key: '全部',
    label: '全部',
  },
  {
    key: 2,
    label: '面向销售订单',
  },
  {
    key: 1,
    label: '面向库存',
  },
];

export const statusGroup = [
  {
    key: 1,
    label: '新建',
    visible: true,
  },
  {
    key: 2,
    label: '已排程',
    visible: true,
  },
  {
    key: 3,
    label: '已下发',
    visible: true,
  },
  {
    key: 4,
    label: '已取消',
    visible: true,
  },
  {
    key: 5,
    label: '审批中',
    visible: auditConfig === 'true',
  },
  {
    key: 6,
    label: '已审批',
    visible: auditConfig === 'true',
  },
];

const executeGroup = [
  {
    key: 1,
    label: '未开始',
  },
  {
    key: 2,
    label: '进行中',
  },
  {
    key: 3,
    label: '暂停中',
  },
  {
    key: 4,
    label: '已结束',
  },
  {
    key: 5,
    label: '已取消',
  },
];

const categories = [
  { key: 1, label: '普通' },
  getBaitingWorkOrderConfig() && { key: 2, label: '下料' },
  getInjectWorkOrderConfig() && { key: 3, label: '注塑' },
].filter(n => n);

class FilterForList extends Component {
  props: propsTypes;
  state = {};

  setInitialValue = value => {
    this.props.form.setFieldsValue(value);
  };

  onReset = () => {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  };

  onSearch = () => {
    const values = this.props.form.getFieldsValue();
    this.props.fetchData({ ...values, page: 1 });
  };

  render() {
    const { form, customFields, ...rest } = this.props;
    const { getFieldDecorator, setFieldsValue, getFieldValue, resetFields } = form || {};

    return (
      <FilterSortSearchBar
        searchFn={this.onSearch}
        style={{
          backgroundColor: white,
          width: '100%',
          borderBottom: '1px solid rgb(232, 232, 232)',
        }}
        {...rest}
      >
        <ItemList>
          <Item label="订单编号">{getFieldDecorator('purchaseCode')(<Input placeholder="请输入订单编号" />)}</Item>
          <Item label="工单编号">{getFieldDecorator('workOrderCode')(<Input placeholder="请输入工单编号" />)}</Item>
          <Item label="工单类型">
            {getFieldDecorator('type', {
              initialValue: '全部',
            })(
              <SelectWithIntl placeholder="请选择工单类型">
                {ticketType.map(({ key, label }) => (
                  <Option value={key} key={key}>
                    {label}
                  </Option>
                ))}
              </SelectWithIntl>,
            )}
          </Item>
          <Item label="计划员">
            {getFieldDecorator('plannerId')(<SearchSelect type="account" loadOnFocus placeholder="请选择计划员" />)}
          </Item>
          <Item label="生产主管">
            {getFieldDecorator('managerId')(<SearchSelect type="account" loadOnFocus placeholder="请选择生产主管" />)}
          </Item>
          <Item label="产出物料">
            {getFieldDecorator('materialCode')(
              <SearchSelect
                loadOnFocus
                type="materialBySearch"
                placeholder="请选择产出物料"
                className="select-input"
                allowClear
              />,
            )}
          </Item>
          <Item label="产出物料类型">
            {getFieldDecorator('materialType')(
              <SearchSelect
                type="materialTypeByName"
                placeholder="请选择产出物料类型"
                className="select-input"
                params={{ status: 1 }}
              />,
            )}
          </Item>
          <Item label="计划状态">
            {getFieldDecorator('status', {})(
              <Select mode="multiple" placeholder="请选择计划状态">
                {statusGroup
                  .filter(({ visible }) => visible)
                  .map(({ key, label }) => (
                    <Option value={key} key={key}>
                      {label}
                    </Option>
                  ))}
              </Select>,
            )}
          </Item>
          <Item label="执行状态">
            {getFieldDecorator('executeStatus', {})(
              <Select mode="multiple" placeholder="请选择执行状态">
                {executeGroup.map(({ key, label }) => (
                  <Option value={key} key={key}>
                    {label}
                  </Option>
                ))}
              </Select>,
            )}
          </Item>
          <Item label="创建时间">
            {getFieldDecorator('createdAt', {})(
              <RangePicker
                showTime={{
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                }}
                format="YYYY-MM-DD HH:mm:ss"
                allowClear
              />,
            )}
          </Item>
          <Item label="成品批次">{getFieldDecorator('productBatch', {})(<Input placeholder="请输入成品批次" />)}</Item>
          <Item label="计划开始时间">
            {getFieldDecorator('planBeginTime', {})(<RangePicker format="YYYY-MM-DD" allowClear />)}
          </Item>
          <Item label="计划结束时间">
            {getFieldDecorator('planEndTime', {})(<RangePicker format="YYYY-MM-DD" allowClear />)}
          </Item>
          {organizationPlanTicketCategory().length > 1 && (
            <Item label="计划工单分类">
              {getFieldDecorator('category', { initialValue: 1 })(
                <SelectWithIntl>
                  {organizationPlanTicketCategory().map(key => (
                    <Option value={key}>{planTicketMap.get(key)}</Option>
                  ))}
                </SelectWithIntl>,
              )}
            </Item>
          )}
          <Item
            label="自定义字段"
            itemWrapperStyle={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Fragment>
              {getFieldDecorator('fieldName')(
                <Select
                  allowClear
                  placeholder="请选择"
                  style={{ width: '40%' }}
                  onChange={v => {
                    if (!v) {
                      resetFields(['fieldValue']);
                    }
                  }}
                >
                  {customFields.map(({ name }) => (
                    <Option value={name} key={name}>
                      {name}
                    </Option>
                  ))}
                </Select>,
              )}
              {getFieldDecorator('fieldValue')(
                <Input disabled={!getFieldValue('fieldName')} style={{ width: '58%' }} />,
              )}
            </Fragment>
          </Item>
        </ItemList>
        <Button icon="search" style={{ float: 'right', width: 86 }} onClick={this.onSearch}>
          查询
        </Button>
        <Link
          style={{
            lineHeight: '30px',
            height: '28px',
            color: '#8C8C8C',
            paddingLeft: '10px',
          }}
          onClick={this.onReset}
        >
          重置
        </Link>
      </FilterSortSearchBar>
    );
  }
}

FilterForList.contextTypes = {
  router: PropTypes.object,
  changeChineseToLocale: PropTypes.func,
};

export default withForm({}, FilterForList);
