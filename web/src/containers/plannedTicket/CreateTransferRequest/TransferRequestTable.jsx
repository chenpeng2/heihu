import React, { Fragment, useState, useEffect } from 'react';
import _ from 'lodash';

import WorkOrderTransReqModel from 'models/cooperate/planWorkOrder/WorkOrderTransReqModel';
import {
  Tooltip,
  DatePicker,
  Table,
  withForm,
  FormItem,
  Input,
  Select,
  SearchSelect,
  SingleStorageSelect,
  InputNumber,
} from 'components';
import { thousandBitSeparator, isNumber } from 'utils/number';
import { replaceSign } from 'src/constants';
import { arrayIsEmpty } from 'utils/array';
import { error } from 'src/styles/color';

import RequiredSymbol from '../base/RequiredSymbol';
import { formatColumns } from '../util';
import styles from '../styles.scss';

const tableFormItemStyle = { width: '100%' };
const hiddenStyle = { display: 'none' };
const Option = Select.Option;

type TablePropsType = {
  form: any,
  dataSource: Array<WorkOrderTransReqModel>,
  fieldName: String,
  onChangeForSourceWarehouse: () => {},
  updateDataSource: () => {},
};

function FormItemWrapper(props) {
  return <FormItem style={tableFormItemStyle}>{props && props.children}</FormItem>;
}

type FormItemPropsType = {
  form: any,
  style: Object,
  fieldName: String,
  initialValue: any,
  options: Array,
  disabled: Boolean,
  onChange: () => {},
};

/** 物料 */
function MaterialFormItem(props: FormItemPropsType) {
  const { form, initialValue, fieldName, style, ...rest } = props;
  const { getFieldDecorator } = form;
  const rules = [{ required: true, message: '物料必填' }];

  return (
    <FormItem style={style}>
      {getFieldDecorator(fieldName, {
        initialValue,
        rules,
      })(<Input className={styles.select} />)}
    </FormItem>
  );
}

/** 工单 */
function WorkOrderFormItem(props: FormItemPropsType) {
  const { form, initialValue, fieldName, disabled, ...rest } = props;
  const { getFieldDecorator } = form;
  const rules = [{ required: true, message: '工单号必填' }];

  return (
    <FormItem {...rest}>
      {getFieldDecorator(fieldName, {
        initialValue,
        rules,
      })(<Input disabled={disabled} className={styles.select} />)}
    </FormItem>
  );
}

/** 发出仓库 */
function SourceWarehouseFormItem(props: FormItemPropsType) {
  const { form, initialValue, fieldName, ...rest } = props;
  const { getFieldDecorator } = form;
  const rules = [{ required: true, message: '发出仓库必填' }];

  return (
    <FormItem>
      {getFieldDecorator(fieldName, {
        initialValue,
        rules,
      })(<SearchSelect className={styles.select} params={{ status: 1 }} type="wareHouseWithCode" {...rest} />)}
    </FormItem>
  );
}

/** 目标仓位 */
function TargetStorageFormItem(props: FormItemPropsType) {
  const { form, initialValue, fieldName, ...rest } = props;
  const { getFieldDecorator } = form;
  const rules = [{ required: true, message: '目标仓位必填' }];

  return (
    <FormItem style={tableFormItemStyle}>
      {getFieldDecorator(fieldName, {
        initialValue,
        rules,
      })(<SingleStorageSelect style={{ width: 180 }} />)}
    </FormItem>
  );
}

/** 需求时间 */
function DemandDateFormItem(props: FormItemPropsType) {
  const { form, initialValue, fieldName, ...rest } = props;
  const { getFieldDecorator } = form;
  const rules = [{ required: true, message: '需求时间必填' }];

  return (
    <FormItem>
      {getFieldDecorator(fieldName, {
        initialValue,
        rules,
      })(<DatePicker format="YYYY-MM-DD" className={styles['small-select']} {...rest} />)}
    </FormItem>
  );
}

/** 需求数量 */
function DemandQuantityFormItem(props: FormItemPropsType) {
  const { form, initialValue, fieldName, ...rest } = props;
  const { getFieldDecorator } = form;
  const rules = [{ required: true, message: '需求数量必填' }];

  return (
    <FormItem {...rest}>
      {getFieldDecorator(fieldName, {
        initialValue,
        rules,
      })(<InputNumber />)}
    </FormItem>
  );
}

/** 工序 */
function ProcessFormItem(props: FormItemPropsType) {
  const { form, initialValue, options, fieldName, ...rest } = props;
  const { getFieldDecorator } = form;

  return (
    <FormItem>
      {getFieldDecorator(fieldName, {
        initialValue,
      })(
        <Select labelInValue className={styles['large-select']} {...rest}>
          {arrayIsEmpty(options)
            ? []
            : options.map(({ seq, processDisplay }) => <Option value={seq}>{processDisplay}</Option>)}
        </Select>,
      )}
    </FormItem>
  );
}

export function getTableColumns(props: TablePropsType) {
  const { form, fieldName, onChangeForSourceWarehouse } = props;
  const columns = [
    {
      title: '物料编号/名称',
      dataIndex: 'material.materialDisplay',
      width: 150,
      render: (data, { material: { code } }, index) => {
        return (
          <Fragment>
            <Tooltip length={15} text={data} />
            <MaterialFormItem
              style={hiddenStyle}
              form={form}
              initialValue={code}
              fieldName={`${fieldName}[${index}].materialCode`}
            />
          </Fragment>
        );
      },
    },
    {
      title: '需求数量',
      dataIndex: 'demandQuantity',
      align: 'right',
      width: 100,
      render: (data, { material: { unitName }, availableInventory }, index) => {
        const noEnoughInventory = isNumber(data) && isNumber(availableInventory) && data > availableInventory;
        return (
          <Fragment>
            <div style={{ color: noEnoughInventory && error }}>
              {typeof data === 'number' ? `${thousandBitSeparator(data)} ${unitName}` : replaceSign}
              {noEnoughInventory && <div>库存不足!</div>}
            </div>
            <DemandQuantityFormItem
              style={hiddenStyle}
              initialValue={data}
              form={form}
              fieldName={`${fieldName}[${index}].demandQuantity`}
            />
          </Fragment>
        );
      },
    },
    {
      title: '发出仓库',
      dataIndex: 'sourceWarehouse.option',
      prefix: <RequiredSymbol />,
      width: 160,
      render: (data, record, index) => {
        const {
          material: { code },
        } = record;
        return (
          <SourceWarehouseFormItem
            form={form}
            initialValue={data}
            fieldName={`${fieldName}[${index}].sourceWarehouseOption`}
            onChange={v => {
              if (v) {
                onChangeForSourceWarehouse(code, v && v.key, record);
              }
            }}
          />
        );
      },
    },
    {
      title: '目标仓位',
      dataIndex: 'targetStorage',
      prefix: <RequiredSymbol />,
      width: 190,
      render: (data, record, index) => {
        return <TargetStorageFormItem form={form} fieldName={`${fieldName}[${index}].targetStorage`} />;
      },
    },
    {
      title: '可用库存',
      dataIndex: 'availableInventory',
      numeric: true,
    },
    {
      title: '需求时间',
      dataIndex: 'demandDate.moment',
      prefix: <RequiredSymbol />,
      width: 120,
      render: (data, record, index) => {
        return (
          <DemandDateFormItem form={form} initialValue={data} fieldName={`${fieldName}[${index}].demandDateMoment`} />
        );
      },
    },
    {
      title: '工单编号',
      dataIndex: 'workOrderCode',
      width: 150,
      render: (data, record, index) => {
        return (
          <Fragment>
            <Tooltip text={data} length={15} />
            <WorkOrderFormItem
              style={hiddenStyle}
              form={form}
              initialValue={data}
              fieldName={`${fieldName}[${index}].workOrderCode`}
            />
          </Fragment>
        );
      },
    },
    {
      title: '工序',
      dataIndex: 'process',
      width: 190,
      render: (data, { defaultProcessOption }, index) => {
        return (
          <ProcessFormItem
            form={form}
            options={data}
            initialValue={defaultProcessOption}
            fieldName={`${fieldName}[${index}].processOption`}
          />
        );
      },
    },
  ];
  return formatColumns(columns);
}

function TransferRequestTable(props: TablePropsType) {
  const { dataSource, form, fieldName, visible, ...rest } = props;

  return (
    <Table
      pagination={false}
      dataSource={dataSource}
      columns={getTableColumns(props)}
      rowKey={record => record.key}
      scroll={{ y: 400, x: true }}
      {...rest}
    />
  );
}

export default withForm({}, TransferRequestTable);
