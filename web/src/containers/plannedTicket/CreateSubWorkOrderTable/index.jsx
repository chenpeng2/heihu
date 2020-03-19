import React, { useEffect, useState, useCallback } from 'react';
import _ from 'lodash';

import SubWorkOrderModel from 'models/cooperate/planWorkOrder/SubWorkOrderModel';
import WorkOrderModel from 'models/cooperate/planWorkOrder/WorkOrderModel';
import BaseMaterialModel from 'models/cooperate/planWorkOrder/BaseMaterialModel';
import { genSubPlanWorkOrderData } from 'src/services/cooperate/plannedTicket';
import { arrayIsEmpty } from 'utils/array';
import log from 'utils/log';

import SubWorkOrderTable from './SubWorkOrderTable';
import { PRODUCT_BATCH_TYPE_RULE } from '../constants';
import { formatFormValueForSubmit } from '../util';
import { tree as treeData } from './mock.json';
import styles from '../styles.scss';

type PropsType = {
  show: Boolean,
  data: Array<SubWorkOrderModel>,
  form: any,
  topWorkOrderData: Object,
};

export function formatApiValueToModel(data: Object): SubWorkOrderModel {
  if (!data) return null;
  const model = new SubWorkOrderModel();

  const {
    level,
    code,
    materialCode,
    materialName,
    materialUnit,
    materialDesc,
    planAmount,
    canUseInventory,
    amount,
    children,
    productBatchType,
    productBatch,
    selectType,
    planBeginTime,
    planEndTime,
    managers,
    planners,
    parentSeq,
    ...rest
  } = data;

  const outputMaterial = {
    code: materialCode,
    name: materialName,
    desc: materialDesc,
    unitName: materialUnit,
  };

  const _productBatch = {
    type: productBatchType,
    value: productBatch,
  };

  const parentProcess = arrayIsEmpty(parentSeq)
    ? null
    : parentSeq.map(({ processSeq, processCode, processName }) => ({
        seq: processSeq,
        code: processCode,
        name: processName,
      }));

  const _children = arrayIsEmpty(children) ? null : children.map(c => formatApiValueToModel(c));

  const format = {
    workOrderCode: code,
    workOrderLevel: level,
    availableInventory: canUseInventory,
    outputAmount: amount,
    demandQuantity: planAmount,
    outputMaterial,
    productBatch: _productBatch,
    planStartDate: planBeginTime,
    planEndDate: planEndTime,
    children: _children,
    plannerOptions: planners,
    managerOptions: managers,
    processType: selectType,
    parentProcess,
    ...rest,
  };

  model.fromJson(format);

  return model;
}

export function formatModelToFieldsValue(data: SubWorkOrderModel) {
  if (!data) return null;
  const {
    key,
    workOrderLevel,
    workOrderCode,
    outputMaterial,
    productBatch,
    outputAmount,
    planners,
    managers,
    priority,
    planStartDate,
    planEndDate,
    processType,
    processRouteCode,
    ebomVersion,
    mbomVersion,
    availableInventory,
    children,
  } = data;
  return {
    key,
    code: workOrderCode,
    amount: outputAmount,
    mbomVersion,
    ebomVersion,
    processRouteCode,
    processType,
    children: arrayIsEmpty(children) ? null : children.map(c => formatModelToFieldsValue(c)),
  };
}

export function addSthToData(data, { parentWorkOrderCode, parentKey }) {
  if (arrayIsEmpty(data)) return [];
  return data.map((d, i) => {
    d.key = parentKey ? `${parentKey}.children[${i}]` : `children[${i}]`;
    d.parentWorkOrderCode = parentWorkOrderCode;
    d.parentKey = parentKey;
    d.level = _.get(d.key.split('.'), 'length', 0) + 1;
    d.children = addSthToData(d.children, {
      upperLevel: d.level,
      parentWorkOrderCode: d.code,
      parentKey: d.key,
    });
    return d;
  });
}

export function formatSubWorkOrderData(data, parentWorkOrderCode, parentKey) {
  if (arrayIsEmpty(data)) return [];
  const _data = addSthToData(data, { parentWorkOrderCode, parentKey });
  const format = _data.map(d => formatApiValueToModel(d));
  return format;
}

export function genSubWorkOrderData(parentData, setLoadingFunc, updateData) {
  if (!parentData) return;
  setLoadingFunc(true);
  genSubPlanWorkOrderData(parentData)
    .then(res => {
      const data = _.get(res, 'data.data');
      if (!arrayIsEmpty(data) && typeof updateData === 'function') {
        updateData(data);
      }
    })
    .catch(err => log.error(err))
    .finally(() => setLoadingFunc(false));
}

export function genSingleChildTree(tree = {}, values = [], i = 0) {
  if (i === values.length) return tree;
  const str = _.repeat('children[0].', i);
  const path = str.substring(0, str.length - 1);
  const child = values[i];
  const _tree = i ? _.set(tree, `${path}`, child) : child;
  return genSingleChildTree(_tree, values, i + 1);
}

export function combKeyArr(keyArr, lastStrArr = []) {
  const arr = lastStrArr;
  arr.push(keyArr.join('.'));

  if (keyArr && keyArr.length > 1) {
    combKeyArr(_.initial(keyArr), arr);
  }

  return arr;
}

export function mergeDefaultData(data, defaultData) {
  if (arrayIsEmpty(data)) return null;
  return data.map(m => {
    m.children = mergeDefaultData(m.children, defaultData);
    return Object.assign(m, defaultData);
  });
}

export function getFieldsValueKeys(values, keys = []) {
  if (arrayIsEmpty(values)) return;
  const _keys = keys;
  values.forEach((v, i) => {
    _keys.push(v.key);
    if (!arrayIsEmpty(v.children)) {
      getFieldsValueKeys(v.children, _keys);
    }
  });
  return _keys;
}

export function checkRecordDisaled(record, selectedRowKeys) {
  const { parentKey } = record;
  return parentKey && !selectedRowKeys.includes(parentKey);
}

export function checkRecordSelected(record, selectedRowKeys) {
  const { parentKey, key } = record;
  return parentKey ? selectedRowKeys.includes(parentKey) : key && selectedRowKeys.includes(key);
}

export default function CreateSubWorkOrderTable(props: PropsType) {
  const { topWorkOrderData, show, ...rest } = props || {};
  const [loading, setLoading] = useState(false);
  const [wrapperLoading, setWrapperLoading] = useState(false);
  const [subWorkOrderData, setSubWorkOrderData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const defaultData = _.pick(topWorkOrderData, [
    'selectType',
    'productBatch',
    'productBatchType',
    'planners',
    'managers',
    'priority',
    'planBeginTime',
    'planEndTime',
  ]);

  useEffect(() => {
    setSubWorkOrderData([]);
    if (!_.isEmpty(topWorkOrderData) && show) {
      genSubWorkOrderData(topWorkOrderData, setWrapperLoading, subData => {
        const initialData = mergeDefaultData(subData, defaultData);
        const { code: topCode } = topWorkOrderData;
        const newSubData = formatSubWorkOrderData(initialData, topCode);
        setSubWorkOrderData(newSubData);
        setSelectedRowKeys(getFieldsValueKeys(newSubData));
      });
    }
  }, [topWorkOrderData, show]);

  const calcuCheckBoxProps = useCallback(
    ({ parentKey, outputAmount, key }) => {
      const disabled = parentKey && !selectedRowKeys.includes(parentKey);
      // const checked = !disabled && selectedRowKeys.includes(key);
      return {
        disabled,
        // checked
      };
    },
    [selectedRowKeys],
  );

  const rowSelection = {
    selectedRowKeys,
    onSelectAll: (selected, selectedRows, changeRows) => {
      setSelectedRowKeys(selected ? getFieldsValueKeys(subWorkOrderData) : []);
    },
    onSelect: (record, selected, selectedRows, nativeEvent) => {
      const onChangeRowKeys = getFieldsValueKeys([record]);
      if (selected) {
        setSelectedRowKeys(_.uniq(selectedRowKeys.concat(onChangeRowKeys)));
      } else {
        setSelectedRowKeys(_.difference(selectedRowKeys, onChangeRowKeys));
      }
    },
    getCheckboxProps: record => calcuCheckBoxProps(record),
  };

  function handleTreeOnChange(form, record) {
    const { key: onChangeKey } = record;
    if (onChangeKey) {
      const { getFieldValue } = form || {};
      const fieldValue = getFieldValue(onChangeKey);
      const keyArr = _.reverse(combKeyArr(onChangeKey.split('.')));
      const changedSubTree = genSingleChildTree({}, keyArr.map(key => _.omit(getFieldValue(key), 'children')));
      const wholeChangedTree = {
        ...topWorkOrderData,
        children: [formatFormValueForSubmit(changedSubTree)],
      };
      genSubWorkOrderData(wholeChangedTree, setLoading, newSubData => {
        const { code: topCode } = topWorkOrderData || {};
        const newSubWizDefault = mergeDefaultData(newSubData, defaultData);
        const newSub = formatSubWorkOrderData(newSubWizDefault, topCode, onChangeKey);
        record.children = newSub;
        form.resetFields(getFieldsValueKeys(newSub));
        setSubWorkOrderData(subWorkOrderData);
        setSelectedRowKeys(getFieldsValueKeys(subWorkOrderData));
      });
    }
  }

  return (
    <SubWorkOrderTable
      wrapperLoading={wrapperLoading}
      show={show}
      loading={loading}
      rowSelection={rowSelection}
      dataSource={subWorkOrderData}
      rowClassName={styles['work-order-form-table-tr']}
      defaultExpandedRowKeys={selectedRowKeys}
      handleTreeOnChange={_.debounce((form, record) => handleTreeOnChange(form, record), 1000)}
      {...rest}
    />
  );
}
