import React from 'react';
import {
  FilterSortSearchBar,
  withForm,
  Select,
  Searchselect,
  Button,
  Link,
  Input,
  DatePicker,
  Text,
} from 'src/components';
import WorkstationAndAreaSelect from 'src/components/select/workstationAndAreaSelect';
import { CHECK_TYPE, QUALITY_STATUS } from 'src/views/qualityManagement/constants';
import { white } from 'src/styles/color';
import PropTypes from 'prop-types';

import { getOrgQcTaskStatusMap } from '../../utils';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;

type Props = {
  form: {
    getFieldDecorator: () => {},
    resetFields: () => {},
    getFieldValue: () => {},
    setFieldsValue: () => {},
  },
  handleSearch: () => {},
};

const QcTaskFilter = (props: Props, context) => {
  const { form, handleSearch } = props;
  const { changeChineseToLocale } = context;
  const { getFieldDecorator, resetFields } = form;
  const QCTASK_STATUS = getOrgQcTaskStatusMap();

  return (
    <FilterSortSearchBar style={{ backgroundColor: white, width: '100%' }} searchDisabled>
      <ItemList>
        <Item label="任务编号">
          {getFieldDecorator('qcTaskCode')(<Input placeholder={changeChineseToLocale('请输入任务编号')} />)}
        </Item>
        <Item label="状态">
          {getFieldDecorator('status', {
            initialValue: '1',
          })(
            <Select>
              <Option key="all">
                <Text>全部</Text>
              </Option>
              {Object.keys(QCTASK_STATUS).map(x => (
                <Option key={`${x}`}>
                  <Text>{QCTASK_STATUS[x]}</Text>
                </Option>
              ))}
            </Select>,
          )}
        </Item>
        <Item label="类型">
          {getFieldDecorator('checkType', {
            initialValue: 'all',
          })(
            <Select>
              <Option key="all">
                <Text>全部</Text>
              </Option>
              {Object.keys(CHECK_TYPE).map(x => (
                <Option key={x}>
                  <Text>{CHECK_TYPE[x]}</Text>
                </Option>
              ))}
            </Select>,
          )}
        </Item>
        <Item label="工位">
          {getFieldDecorator('workstation')(
            <WorkstationAndAreaSelect
              onlyWorkstations
              params={{ enabled: null }}
              style={{ width: '100%' }}
              placeholder={changeChineseToLocale('请选择区域')}
            />,
          )}
        </Item>
        <Item label="执行人">
          {getFieldDecorator('operator')(
            <Searchselect labelInValue placeholder="请选择执行人" type="qcMembers" className="select-input" />,
          )}
        </Item>
        <Item label="工序">
          {getFieldDecorator('process')(
            <Searchselect placeholder="请选择工序" type="processName" params={{ status: null }} />,
          )}
        </Item>
        <Item label="物料">
          {getFieldDecorator('material')(<Searchselect placeholder="请选择物料" type="materialBySearch" />)}
        </Item>
        <Item label="订单编号">
          {getFieldDecorator('purchaseOrderCode')(<Searchselect placeholder="请输入订单编号" type="purchaseOrder" />)}
        </Item>
        <Item label="项目编号">
          {getFieldDecorator('projectCode')(<Searchselect type={'project'} placeholder="请输入项目编号" />)}
        </Item>
        <Item label="任务开始时间">{getFieldDecorator('taskStartTime')(<DatePicker.RangePicker />)}</Item>
        <Item label="质检计划">
          {getFieldDecorator('qcPlanCode')(
            <Searchselect type="qcPlan" labelInValue={false} placeholder="请输入质检计划编号" />,
          )}
        </Item>
        <Item label="质检方案">{getFieldDecorator('qcConfigName')(<Input placeholder="请输入质检方案" />)}</Item>
        <Item label="任务结束时间">{getFieldDecorator('taskEndTime')(<DatePicker.RangePicker />)}</Item>
        <Item label="质检结果">
          {getFieldDecorator('qcStatus', {
            initialValue: '0',
          })(
            <Select>
              <Option key="0">
                <Text>全部</Text>
              </Option>
              {Object.keys(QUALITY_STATUS).map(x => (
                <Option key={x}>
                  <Text>{QUALITY_STATUS[x].name}</Text>
                </Option>
              ))}
            </Select>,
          )}
        </Item>
      </ItemList>
      <Button icon="search" onClick={handleSearch}>
        查询
      </Button>
      <Link
        style={{ lineHeight: '30px', height: '28px', color: '#8C8C8C', paddingLeft: 16 }}
        onClick={() => {
          resetFields();
          handleSearch();
        }}
      >
        重置
      </Link>
    </FilterSortSearchBar>
  );
};

QcTaskFilter.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export default withForm({}, QcTaskFilter);
