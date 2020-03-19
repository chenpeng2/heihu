import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withForm, FilterSortSearchBar, Input, Select, Button, DatePicker, PlainText } from 'src/components';
import SelectWithIntl from 'components/select/selectWithIntl';
import LocalStorage from 'src/utils/localStorage';
import SearchSelect from 'src/components/select/searchSelect';
import { white } from 'src/styles/color/index';
import { getInjectWorkOrderConfig } from 'utils/organizationConfig';
import { PROJECT_STATUS } from 'src/constants';
import { formatToUnix } from 'utils/time';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const RangePicker = DatePicker.RangePicker;
const Option = Select.Option;

type Props = {
  onFilter: () => {},
  form: any,
  match: {},
};

class Filter extends Component {
  props: Props;
  state = {};

  componentDidMount() {
    const filterSchedule = LocalStorage.get('taskScheduleProcessTableFilterSchedule');
    const filterDistribute = LocalStorage.get('taskScheduleProcessTableFilterDistribute');
    this.props.form.setFieldsValue({
      filterSchedule: filterSchedule || 'all',
      filterDistribute: filterDistribute || 'all',
    });
    this.onSearch();
  }

  onSearch = () => {
    const { form, onFilter } = this.props;
    const { getFieldsValue } = form;
    const value = getFieldsValue();
    LocalStorage.set('taskScheduleProcessTableFilterSchedule', value.filterSchedule);
    LocalStorage.set('taskScheduleProcessTableFilterDistribute', value.filterDistribute);
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
    if (Array.isArray(value.planBeginTime) && value.planBeginTime.length > 0) {
      const { planBeginTime } = value;
      value.planBeginTimeFrom = formatToUnix(planBeginTime[0]);
      value.planBeginTimeTill = formatToUnix(planBeginTime[1]);
      value.planBeginTime = undefined;
    } else {
      value.planBeginTimeFrom = undefined;
      value.planBeginTimeTill = undefined;
    }
    if (Array.isArray(value.planEndTime) && value.planEndTime.length > 0) {
      const { planEndTime } = value;
      value.planEndTimeFrom = formatToUnix(planEndTime[0]);
      value.planEndTimeTill = formatToUnix(planEndTime[1]);
      value.planEndTime = undefined;
    } else {
      value.planEndTimeFrom = undefined;
      value.planEndTimeTill = undefined;
    }
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
      <FilterSortSearchBar searchFn={this.onSearch} style={{ backgroundColor: white, width: '100%' }}>
        <ItemList>
          <Item label="订单编号">{getFieldDecorator('purchaseCode')(<Input className="select-input" />)}</Item>
          <Item label="工单编号">{getFieldDecorator('workOrderCode')(<Input className="select-input" />)}</Item>
          <Item label="工序名称">{getFieldDecorator('processCode')(<SearchSelect type="processName" />)}</Item>
          <Item label="排程进度">
            {getFieldDecorator('filterSchedule')(
              <SelectWithIntl>
                <Option value={'all'}>
                  <PlainText text="全部" />
                </Option>
                <Option value={2}>
                  <PlainText text="已全部排程" />
                </Option>
                <Option value={1}>
                  <PlainText text="排程中" />
                </Option>
                <Option value={0}>
                  <PlainText text="未排程" />
                </Option>
              </SelectWithIntl>,
            )}
          </Item>
          <Item label="下发进度">
            {getFieldDecorator('filterDistribute')(
              <SelectWithIntl>
                <Option value={'all'}>全部</Option>
                <Option value={'allDistributed'}>已全部下发</Option>
                <Option value={'notAllDistributed'}>未全部下发</Option>
              </SelectWithIntl>,
            )}
          </Item>
          <Item label="成品批次">{getFieldDecorator('productBatch')(<Input className="select-input" />)}</Item>
          <Item label="工单计划员">
            {getFieldDecorator('workOrderPlannerId')(
              <SearchSelect type="account" loadOnFocus placeholder="请选择计划员" />,
            )}
          </Item>
          <Item label="工单产出物料">
            {getFieldDecorator('materialCode')(<SearchSelect type="materialBySearch" params={{ status: 1 }} />)}
          </Item>
          <Item label="工单创建时间">
            {getFieldDecorator('createdAt')(<RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />)}
          </Item>
          <Item label="工单计划开始时间">
            {getFieldDecorator('planBeginTime', {})(<RangePicker format="YYYY-MM-DD" allowClear />)}
          </Item>
          <Item label="工单计划结束时间">
            {getFieldDecorator('planEndTime', {})(<RangePicker format="YYYY-MM-DD" allowClear />)}
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
            <Item label="模具定义编号">{getFieldDecorator('toolCode')(<Input className="select-input" />)}</Item>
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
