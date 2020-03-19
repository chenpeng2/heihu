import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withForm, FilterSortSearchBar, Input, Select, Button, DatePicker } from 'components';
import SelectWithIntl from 'components/select/selectWithIntl';
import LocalStorage from 'src/utils/localStorage';
import { getInjectWorkOrderConfig } from 'utils/organizationConfig';
import SearchSelect from 'src/components/select/searchSelect';
import { white } from 'src/styles/color/index';
import { PROJECT_STATUS } from 'src/constants';
import { formatToUnix } from 'utils/time';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const RangePicker = DatePicker.RangePicker;
const Option = Select.Option;

type Props = {
  onFilter: () => {},
  initialValue: {},
  form: any,
  match: {},
};

class Filter extends Component {
  props: Props;
  state = {};

  componentDidMount() {
    const filterDistribute = LocalStorage.get('taskScheduleProcessTableFilterDistribute');
    const { initialValue } = this.props;
    this.props.form.setFieldsValue({ ...initialValue, filterDistribute: filterDistribute || 'all' });
  }

  onSearch = () => {
    const { form, onFilter } = this.props;
    const { getFieldsValue } = form;
    const value = getFieldsValue();
    if (value.workOrderPlannerId) {
      value.workOrderPlannerId = value.workOrderPlannerId ? value.workOrderPlannerId.key : undefined;
    } else {
      value.workOrderPlannerId = undefined;
    }
    if (value.processCode) {
      value.processCode = value.processCode.key;
    } else {
      value.processCode = undefined;
    }
    if (value.workstationId) {
      value.workstationId = value.workstationId.key;
    } else {
      value.workstationId = undefined;
    }
    if (value.range && value.range.length) {
      value.startTime = formatToUnix(value.range[0].set({ hour: 0, minute: 0, second: 0, millisecond: 0 }));
      value.endTime = formatToUnix(value.range[1].set({ hour: 23, minute: 59, second: 59 }));
      delete value.range;
    } else {
      value.startTime = undefined;
      value.endTime = undefined;
    }
    if (value.materialCode) {
      value.materialCode = value.materialCode.key;
    } else {
      value.materialCode = undefined;
    }
    if (Array.isArray(value.createdAt) && value.createdAt.length > 0) {
      const { createdAt } = value;
      value.fromCreatedAt = formatToUnix(createdAt[0]);
      value.toCreatedAt = formatToUnix(createdAt[1]);
      value.createdAt = undefined;
    } else {
      value.fromCreatedAt = undefined;
      value.toCreatedAt = undefined;
    }
    LocalStorage.set('taskScheduleProcessTableFilterDistribute', value.filterDistribute);
    if (onFilter && value) {
      onFilter(value, {
        locationValue: value,
      });
    }
  };

  renderStatusElement = () => {
    const statusElement = Object.entries(PROJECT_STATUS).map(([key, value]) => {
      return (
        <Option key={key} value={key}>
          {value}
        </Option>
      );
    });
    statusElement.unshift(
      <Option key={'all'} value={''}>
        {'全部'}
      </Option>,
    );
    return statusElement;
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator, getFieldValue } = form || {};
    const injectWorkOrderConfig = getInjectWorkOrderConfig();

    return (
      <FilterSortSearchBar style={{ backgroundColor: white, width: '100%' }} searchFn={this.onSearch}>
        <ItemList>
          <Item label="任务编号">{getFieldDecorator('taskCode')(<Input className="select-input" />)}</Item>
          <Item label="订单编号">{getFieldDecorator('purchaseOrderCode')(<Input className="select-input" />)}</Item>
          <Item label="工单编号">{getFieldDecorator('workOrderCode')(<Input className="select-input" />)}</Item>
          <Item label="工序名称">
            {getFieldDecorator('processCode')(
              <SearchSelect placeholder={'名称'} type={'processName'} className="select-input" />,
            )}
          </Item>
          <Item label="工位">
            {getFieldDecorator('workstationId')(
              <SearchSelect
                placeholder={'请选择'}
                type={'workstation'}
                params={{ status: 1 }}
                className="select-input"
              />,
            )}
          </Item>
          <Item label="计划开始时间">{getFieldDecorator('range')(<RangePicker />)}</Item>
          <Item label="成品批次">{getFieldDecorator('productBatch')(<Input className="select-input" />)}</Item>
          <Item label="工单计划员">
            {getFieldDecorator('workOrderPlannerId')(
              <SearchSelect type="account" loadOnFocus placeholder="请选择计划员" />,
            )}
          </Item>
          <Item label="工单产出物料">
            {getFieldDecorator('materialCode')(<SearchSelect type="materialBySearch" params={{ status: 1 }} />)}
          </Item>
          <Item label="创建时间">
            {getFieldDecorator('createdAt')(<RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />)}
          </Item>
          {injectWorkOrderConfig ? (
            <Item label="是否合并">
              {getFieldDecorator('inject', {
                initialValue: false,
              })(
                <SelectWithIntl>
                  <Option value>已合并</Option>
                  <Option value={false}>未合并</Option>
                </SelectWithIntl>,
              )}
            </Item>
          ) : null}
          {getFieldValue('inject') ? (
            <Item label="模具编号">{getFieldDecorator('mouldUnitCode')(<Input className="select-input" />)}</Item>
          ) : null}
        </ItemList>
        <Button icon="search" onClick={this.onSearch}>
          查询
        </Button>
      </FilterSortSearchBar>
    );
  }
}

Filter.contextTypes = {
  account: PropTypes.object,
};

export default withForm({}, withRouter(Filter));
