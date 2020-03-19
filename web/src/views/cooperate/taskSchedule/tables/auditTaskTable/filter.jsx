import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { AuditorSelect, withForm, FilterSortSearchBar, Input, Select, Button, DatePicker } from 'components';
import LocalStorage from 'src/utils/localStorage';
import SearchSelect from 'src/components/select/searchSelect';
import { white } from 'src/styles/color/index';
import { PROJECT_STATUS, ROLES_HAS_AUDIT_AUTHORITY } from 'src/constants';
import { formatToUnix } from 'utils/time';
import { checkUserAuditAuthority } from './utils';

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
    const user = LocalStorage.get('USER');
    const hasAuditAuthority = checkUserAuditAuthority(user);
    const { initialValue } = this.props;
    const value = { ...initialValue, filterDistribute: filterDistribute || 'all' };
    if (hasAuditAuthority) {
      value.auditorId = user.id;
    } else {
      value.auditorId = 'all';
    }
    this.props.form.setFieldsValue(value);
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
    if (value.auditorId && value.auditorId === 'all') {
      value.auditorId = undefined;
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
    const { getFieldDecorator } = form || {};

    return (
      <FilterSortSearchBar searchFn={this.onSearch} style={{ backgroundColor: white, width: '100%' }}>
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
          <Item label="工单计划员">
            {getFieldDecorator('workOrderPlannerId')(
              <SearchSelect type="account" loadOnFocus placeholder="请选择计划员" />,
            )}
          </Item>
          <Item label="计划开始时间">{getFieldDecorator('range')(<RangePicker />)}</Item>
          <Item label="当前可审批人">
            {getFieldDecorator('auditorId')(
              <AuditorSelect
                preOptions={
                  <Option value="all" id="all">
                    全部
                  </Option>
                }
                params={{ roleIds: ROLES_HAS_AUDIT_AUTHORITY.join(',') }}
              />,
            )}
          </Item>
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
