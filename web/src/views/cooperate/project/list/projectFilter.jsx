import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  getOrganizationConfigFromLocalStorage,
  ORGANIZATION_CONFIG,
  TASK_DISPATCH_TYPE,
  getInjectWorkOrderConfig,
  getBaitingWorkOrderConfig,
} from 'src/utils/organizationConfig';
import { getQuery } from 'src/routes/getRouteParams';
import moment, { formatRangeUnix, formatRangeTimeToMoment } from 'src/utils/time';
import { withForm, FilterSortSearchBar, Input, Select, Button, DatePicker } from 'src/components';
import SelectWithIntl from 'components/select/selectWithIntl';
import SearchSelect from 'src/components/select/searchSelect';
import { white } from 'src/styles/color/index';
import CONSTANTS, {
  PROJECT_STATUS,
  projectCategoryMap,
  PROJECT_CATEGORY_NORMAL,
  PROJECT_CATEGORY_INJECTION_MOULDING,
  PROJECT_CATEGORY_BAITING,
} from 'src/constants';
import MaterialSelect from 'src/components/select/materialSelect';
import { saveProjectListStatuses, getProjectListStatuses } from 'src/containers/project/utils';
import { organizationPlanTicketCategory } from 'views/cooperate/plannedTicket/utils';

import styles from './styles.scss';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const RangePicker = DatePicker.RangePicker;
const Option = Select.Option;

// 项目类型
const projectType = [
  {
    key: null,
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

// 项目分类
const projectCategory = [
  PROJECT_CATEGORY_NORMAL,
  getBaitingWorkOrderConfig() && PROJECT_CATEGORY_BAITING,
  getInjectWorkOrderConfig() && PROJECT_CATEGORY_INJECTION_MOULDING,
].filter(n => n);

type Props = {
  onFilter: () => {},
  form: any,
  match: {},
};

// 格式化form中的数据
export const formatValueForSearch = value => {
  if (!value) return {};
  const {
    plannerIds,
    managerIds,
    statuses,
    createdAt,
    plannedStartTime,
    plannedEndTime,
    product,
    productBatch,
    productMaterialType,
    ...rest
  } = value;

  const productCode = product ? product.key : null;
  const _plannerIds = Array.isArray(plannerIds) && plannerIds.length ? plannerIds.map(i => i.key).join(',') : null;
  const _managerIds = Array.isArray(managerIds) && managerIds.length ? managerIds.map(i => i.key).join(',') : null;
  const _statuses = Array.isArray(statuses) && statuses.length ? statuses.join(',') : null;
  const _productBatch = productBatch === '' ? null : productBatch;

  const _createdAt = formatRangeUnix(createdAt);
  const _plannedStartTime = formatRangeUnix(plannedStartTime);
  const _plannedEndTime = formatRangeUnix(plannedEndTime);
  const createdAtTill = _createdAt && _createdAt[1] ? _createdAt[1] : null;
  const createdAtFrom = _createdAt && _createdAt[0] ? _createdAt[0] : null;
  const startTimePlannedFrom = _plannedStartTime && _plannedStartTime[0] ? _plannedStartTime[0] : null;
  const startTimePlannedTill = _plannedStartTime && _plannedStartTime[1] ? _plannedStartTime[1] : null;
  const endTimePlannedFrom = _plannedEndTime && _plannedEndTime[0] ? _plannedEndTime[0] : null;
  const endTimePlannedTill = _plannedEndTime && _plannedEndTime[1] ? _plannedEndTime[1] : null;
  const _productMaterialType = _.get(productMaterialType, 'label', undefined);

  return {
    ...rest,
    plannerIds: _plannerIds,
    managerIds: _managerIds,
    statuses: _statuses,
    createdAtFrom,
    createdAtTill,
    productCode,
    startTimePlannedFrom,
    startTimePlannedTill,
    endTimePlannedFrom,
    endTimePlannedTill,
    productBatch: _productBatch,
    productMaterialType: _productMaterialType,
  };
};

// 从query中获取form的值
export const getInitialValue = match => {
  if (!match) return {};
  const query = getQuery(match);
  const {
    plannedEndTime,
    plannedStartTime,
    type,
    statuses,
    managerIds,
    createdAt,
    projectCode,
    purchaseOrderCode,
    product,
    plannerIds,
    page,
    productBatch,
    productMaterialType,
  } = query || {};

  return {
    plannedEndTime,
    plannedStartTime,
    type,
    statuses,
    managerIds,
    projectCode,
    purchaseOrderCode,
    product,
    createdAt,
    plannerIds,
    page,
    productBatch,
    productMaterialType,
  };
};

class FilterForProjectTable extends Component {
  props: Props;
  state = {};

  componentDidMount() {
    const { form, match } = this.props;
    const initialValue = getInitialValue(match);
    const { createdAt, plannedStartTime, plannedEndTime } = initialValue || {};

    // 时间需要进行moment处理
    initialValue.createdAt = _.get(createdAt, 'length') > 0 ? [moment(createdAt[0]), moment(createdAt[1])] : null;
    initialValue.plannedStartTime =
      _.get(plannedStartTime, 'length') > 0 ? [moment(plannedStartTime[0]), moment(plannedStartTime[1])] : null;
    initialValue.plannedEndTime =
      _.get(plannedEndTime, 'length') > 0 ? [moment(plannedEndTime[0]), moment(plannedEndTime[1])] : null;
    form.setFieldsValue(initialValue);
  }

  onSearch = () => {
    const { form, onFilter } = this.props;
    const { getFieldsValue } = form;

    const value = getFieldsValue();
    const { statuses } = value || {};

    if (typeof onFilter === 'function') {
      onFilter(value, { locationValue: value });
      saveProjectListStatuses(statuses);
    }
  };

  renderStatusElement = () => {
    const { changeChineseToLocale } = this.context;
    return Object.entries(PROJECT_STATUS).map(([key, value]) => {
      return (
        <Option key={`option-${key}`} value={key}>
          {changeChineseToLocale(value)}
        </Option>
      );
    });
  };

  render() {
    const { form } = this.props;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator, getFieldValue } = form || {};
    const dispatchType = getOrganizationConfigFromLocalStorage()[ORGANIZATION_CONFIG.taskDispatchType].configValue;
    return (
      <div
        className={styles.projectFilter}
        onKeyDown={e => {
          if (e.keyCode === 13) {
            this.onSearch();
          }
        }}
      >
        <FilterSortSearchBar style={{ backgroundColor: white, width: '100%' }} searchDisabled>
          <ItemList>
            <Item label="产出物料编号／名称">
              {getFieldDecorator('product')(
                <SearchSelect
                  type="materialBySearch"
                  className="select-input"
                  loadOnFocus
                  hideCreateButton
                  allowClear
                />,
              )}
            </Item>
            <Item label="产出物料类型">
              {getFieldDecorator('productMaterialType')(
                <SearchSelect
                  type="materialTypeByName"
                  placeholder="请选择产出物料类型"
                  className="select-input"
                  params={{ status: 1 }}
                />,
              )}
            </Item>
            <Item label="订单编号">{getFieldDecorator('purchaseOrderCode')(<Input className="select-input" />)}</Item>
            <Item label="项目编号">{getFieldDecorator('projectCode')(<Input className="select-input" />)}</Item>
            <Item label="项目类型">
              {getFieldDecorator('type')(
                <Select placeholder="请选择工单类型">
                  {projectType.map(({ key, label }) => (
                    <Option value={key} key={key}>
                      {changeChineseToLocale(label)}
                    </Option>
                  ))}
                </Select>,
              )}
            </Item>
            {dispatchType === TASK_DISPATCH_TYPE.manager && (
              <Item label="计划员">
                {getFieldDecorator('plannerIds')(
                  <SearchSelect
                    mode={'multiple'}
                    type={'account'}
                    loadOnFocus
                    placeholder="请选择计划员"
                    params={{ roleId: 4 }}
                  />,
                )}
              </Item>
            )}
            <Item label="生产主管">
              {getFieldDecorator('managerIds')(
                <SearchSelect
                  mode={'multiple'}
                  type={'account'}
                  loadOnFocus
                  placeholder="请选择生产主管"
                  params={{ roleId: 5 }}
                />,
              )}
            </Item>
            <Item label="状态">
              {getFieldDecorator('statuses', {
                initialValue: getProjectListStatuses() || undefined,
              })(
                <Select placeholder="请选择状态" className={styles.selectInput} allowClear mode={'multiple'}>
                  {this.renderStatusElement()}
                </Select>,
              )}
            </Item>
            <Item label="创建时间">
              {getFieldDecorator('createdAt')(
                <RangePicker
                  placeholder={[changeChineseToLocale('开始时间'), changeChineseToLocale('结束时间')]}
                  className="select-input"
                />,
              )}
            </Item>
            <Item label="计划开始时间">
              {getFieldDecorator('plannedStartTime')(
                <RangePicker
                  placeholder={[changeChineseToLocale('开始时间'), changeChineseToLocale('结束时间')]}
                  className="select-input"
                />,
              )}
            </Item>
            <Item label="计划结束时间">
              {getFieldDecorator('plannedEndTime')(
                <RangePicker
                  placeholder={[changeChineseToLocale('开始时间'), changeChineseToLocale('结束时间')]}
                  className="select-input"
                />,
              )}
            </Item>
            <Item label="成品批次">
              {getFieldDecorator('productBatch')(<Input placeholder="请输入成品批次" className="select-input" />)}
            </Item>
            {organizationPlanTicketCategory().length > 1 && (
              <Item label="项目分类">
                {getFieldDecorator('category', {
                  initialValue: PROJECT_CATEGORY_NORMAL,
                })(
                  <SelectWithIntl
                    onChange={v => {
                      if (organizationPlanTicketCategory().length > 1 && !_.isEqual(v, PROJECT_CATEGORY_NORMAL)) {
                        this.props.form.resetFields(['productProgress']);
                      }
                    }}
                  >
                    {organizationPlanTicketCategory().map(key => (
                      <Option value={key}>{projectCategoryMap.get(key)}</Option>
                    ))}
                  </SelectWithIntl>,
                )}
              </Item>
            )}
            <Item label="项目进度">
              {getFieldDecorator('productProgress', {
                initialValue: null,
              })(
                <SelectWithIntl
                  disabled={
                    organizationPlanTicketCategory().length > 1 &&
                    !_.isEqual(PROJECT_CATEGORY_NORMAL, getFieldValue('category'))
                  }
                >
                  <Option value={null}>{'全部'}</Option>
                  <Option value={1}>{'已完成'}</Option>
                  <Option value={0}>{'未完成'}</Option>
                </SelectWithIntl>,
              )}
            </Item>
          </ItemList>
          <Button icon="search" onClick={this.onSearch}>
            查询
          </Button>
        </FilterSortSearchBar>
      </div>
    );
  }
}

FilterForProjectTable.contextTypes = {
  account: PropTypes.object,
  changeChineseToLocale: PropTypes.func,
};

export default withForm({}, withRouter(FilterForProjectTable));
