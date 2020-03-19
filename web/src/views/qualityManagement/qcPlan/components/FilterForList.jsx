import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FilterSortSearchBar, Button, Link, Input, Select, Searchselect, DatePicker, Text } from 'components';
import { TASK_DISPATCH_TYPE } from 'utils/organizationConfig';

import { getOrganizationTaskDispatchType } from '../utils';
import { QCPLAN_STATUS, QCPLAN_CHECK_TYPE } from '../../constants';
import styles from '../styles.scss';

const { ItemList, Item } = FilterSortSearchBar;
const { Option } = Select;
const { RangePicker } = DatePicker;

type Props = {
  form: any,
  fetchData: () => {},
  dispatchType: TASK_DISPATCH_TYPE,
};

class FilterForList extends Component {
  props: Props;

  onReset = () => {
    this.props.form.resetFields();
    this.onSearch();
  };

  onSearch = () => {
    const filter = this.props.form.getFieldsValue();
    const _params = { ...filter, size: 10, page: 1 };
    if (sensors) {
      sensors.track('web_quanlity_planList_search', {
        FilterCondition: filter,
      });
    }
    this.props.fetchData(_params);
  };

  render() {
    const {
      form: { getFieldDecorator },
      dispatchType,
    } = this.props;
    const { changeChineseToLocale } = this.context;

    const workOrderItem =
      dispatchType === TASK_DISPATCH_TYPE.manager ? (
        <Item label="计划工单">
          {getFieldDecorator('planWorkOrderCode')(<Searchselect type="workOrderListAllLike" />)}
        </Item>
      ) : null;

    const projectItem =
      dispatchType === TASK_DISPATCH_TYPE.manager ? null : (
        <Item label={changeChineseToLocale('项目')}>
          {getFieldDecorator('projectCode')(<Searchselect type="project" />)}
        </Item>
      );

    return (
      <FilterSortSearchBar className={styles['qcPlan-filter-for-list']}>
        <ItemList>
          <Item label={changeChineseToLocale('编号')}>{getFieldDecorator('qcPlanCode')(<Input />)}</Item>
          <Item label={changeChineseToLocale('计划类型')}>
            {getFieldDecorator('checkType')(
              <Select allowClear>
                {Object.keys(QCPLAN_CHECK_TYPE).map(key => (
                  <Option key={key}>{changeChineseToLocale(QCPLAN_CHECK_TYPE[key])}</Option>
                ))}
              </Select>,
            )}
          </Item>
          <Item label={changeChineseToLocale('物料')}>
            {getFieldDecorator('materialCode')(<Searchselect type="materialBySearch" />)}
          </Item>
          <Item label={changeChineseToLocale('创建人')}>
            {getFieldDecorator('creatorId')(<Searchselect type="account" />)}
          </Item>
          <Item label={changeChineseToLocale('创建时间')}>
            {getFieldDecorator('createdAt')(<RangePicker format="YYYY-MM-DD HH:mm:ss" showTime allowClear />)}
          </Item>
          {workOrderItem}
          {projectItem}
          <Item label="质检计划状态">
            {getFieldDecorator('status')(
              <Select allowClear>
                {Object.keys(QCPLAN_STATUS).map(key => (
                  <Option key={key}>
                    <Text>{QCPLAN_STATUS[key].display}</Text>
                  </Option>
                ))}
              </Select>,
            )}
          </Item>
        </ItemList>
        <Button icon="search" onClick={this.onSearch}>
          {changeChineseToLocale('查询')}
        </Button>
        <Link className={styles.qcPlan_reset_link} onClick={this.onReset}>
          {changeChineseToLocale('重置')}
        </Link>
      </FilterSortSearchBar>
    );
  }
}

const mapStateToProps = () => {
  const dispatchType = getOrganizationTaskDispatchType();
  return { dispatchType };
};

FilterForList.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export default connect(mapStateToProps)(FilterForList);
