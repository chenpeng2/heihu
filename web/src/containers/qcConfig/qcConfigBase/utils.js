import React from 'react';
import _ from 'lodash';
import { Big } from 'utils/number';
import { arrayIsEmpty } from 'src/utils/array';
import { CHECKITEM_CHECK, AQL_CHECK } from 'src/views/qualityManagement/constants';
import BulkActionModal from './bulkActionModal';
import { getCheckNumsValid } from './index';

export const formatValues = _values => {
  const values = _.cloneDeep(_values);
  if (values.taskCreateType === 0) {
    const { taskCreateIntervalValue, taskCreateIntervalUnit } = values;
    if (taskCreateIntervalUnit === 'h') {
      values.taskCreateInterval = taskCreateIntervalValue * 60 * 60 * 1000;
    } else if (taskCreateIntervalUnit === 'm') {
      values.taskCreateInterval = taskCreateIntervalValue * 60 * 1000;
    }
  } else if (values.taskCreateType === 1) {
    if (values.taskCreateCountAll) {
      values.taskCreateCount = -1;
    }
  }
  values.attachments = values.attachments && values.attachments.map(e => e.id);
  // 将不同分类的质检项数据聚合到一起
  Object.keys(values).forEach(n => {
    if (n.indexOf('qcCheckItemConfigs') !== -1) {
      const _values = values[n].filter(n => !n.deleted);
      if (values.qcCheckItemConfigs) {
        values.qcCheckItemConfigs = values.qcCheckItemConfigs.concat(_values);
      } else {
        values.qcCheckItemConfigs = _values;
      }
    }
  });
  if (values.qcCheckItemConfigs) {
    const qcCheckItemConfigs = values.qcCheckItemConfigs.map(
      ({
        id: checkItemId,
        name,
        groupName,
        logic,
        base,
        deltaPlus,
        deltaMinus,
        unitId,
        min,
        max,
        qcDefectConfigs,
        ...rest
      }) => {
        // 允差时需要把 正负偏差转换成min max
        const v = {};
        if (logic === 8) {
          v.min = Big(base)
            .plus(deltaMinus)
            .toString();
          v.max = Big(base)
            .plus(deltaPlus)
            .toString();
        }
        if (unitId) {
          v.unitId = unitId.key;
        }
        if (qcDefectConfigs && Array.isArray(qcDefectConfigs) && qcDefectConfigs.length) {
          qcDefectConfigs = qcDefectConfigs.map(m => ({
            qcDefectReasonId: m.key,
          }));
        }
        return { checkItemId, logic, base, min, max, qcDefectConfigs, ...rest, ...v };
      },
    );
    values.qcCheckItemConfigs = values.keys
      ? values.keys.map((key, index) => ({ ...qcCheckItemConfigs[key], seq: index + 1 }))
      : qcCheckItemConfigs.map((e, index) => ({ ...e, seq: index + 1 }));
  }
  if (values.materials && Array.isArray(values.materials) && values.materials.length) {
    values.qcConfigMaterials = _.compact(values.materials).map((n, index) => ({
      materialCode: n.key.split('|')[0],
      qcUnitId: values.checkEntityType === 1 ? _.compact(values.qcUnit)[index].key : n.key.split('|')[2],
    }));
    delete values.materials;
    delete values.qcUnitId;
  }

  return values;
};

export const formatInitialValue = initialValue => {
  const { taskCreateType, taskCreateCount, taskCreateInterval, attachmentDetails, ...rest } = initialValue;
  let { qcCheckItemConfigs } = initialValue;

  const o = {};
  if (taskCreateType === 0) {
    if (taskCreateInterval % (60 * 60 * 1000) === 0) {
      o.taskCreateIntervalValue = taskCreateInterval / (60 * 60 * 1000);
      o.taskCreateIntervalUnit = 'h';
    } else if (taskCreateInterval % (60 * 1000) === 0) {
      o.taskCreateIntervalValue = taskCreateInterval / (60 * 1000);
      o.taskCreateIntervalUnit = 'm';
    }
  } else if (taskCreateType === 1 || taskCreateType === 2 || taskCreateType === 3) {
    if (taskCreateCount <= 0) {
      o.taskCreateCountAll = true;
    } else {
      o.taskCreateCount = taskCreateCount;
    }
  }
  if (!arrayIsEmpty(qcCheckItemConfigs)) {
    qcCheckItemConfigs = _.groupBy(qcCheckItemConfigs, 'checkItem.group.name');
    const groupKeys = Object.keys(qcCheckItemConfigs);
    const groupValues = Object.values(qcCheckItemConfigs);
    qcCheckItemConfigs = groupKeys.map((group, index) => ({
      group,
      children: groupValues[index],
    }));
    qcCheckItemConfigs.forEach(n => {
      n.children = _.sortBy(n.children, 'seq').map((itemConfig, index) => {
        const {
          checkItem,
          qcAqlId,
          qcAqlInspectionLevelId,
          logic,
          min,
          max,
          base,
          unit,
          unitId,
          seq,
          qcDefectConfigs,
          checkCountType,
          checkNums,
          qcAqlConfig,
        } = itemConfig;
        const v = {};
        if (logic === 8) {
          v.deltaPlus = Big(max)
            .minus(base)
            .toString();
          v.deltaMinus = Big(min)
            .minus(base)
            .toString();
        }
        if (unitId && unit) {
          v.unitId = { key: unitId, label: unit && unit.name };
        }
        if (qcDefectConfigs && Array.isArray(qcDefectConfigs) && qcDefectConfigs.length) {
          v.qcDefectConfigs = qcDefectConfigs.map(n => ({ label: n.qcDefectReasonName, key: n.qcDefectReasonId }));
        }
        return {
          ...v,
          id: checkItem.id,
          index,
          key: `${checkItem.group.name}${index}`,
          group: checkItem.group.name,
          code: checkItem.code,
          name: checkItem.name,
          desc: checkItem.desc,
          checkItem,
          logic,
          min,
          max,
          base,
          seq,
          qcAqlId,
          qcAqlInspectionLevelId,
          checkCountType,
          checkNums,
          qcAqlConfig,
        };
      });
    });
  }
  const res = {
    taskCreateType,
    ...rest,
    ...o,
    attachments: attachmentDetails,
    qcCheckItemConfigs,
  };
  return res;
};

export const nameFormatCheck = (rule, value, callback) => {
  const re = /^[\w\u0391-\uFFE5_ -]+$/;
  if (value && !re.test(value)) {
    callback('名称只能由英文字母、中文、数字、_-、空格组成');
  }
  callback();
};

export const getAqlTitle = (dataSource, onModalSubmit) => {
  return dataSource.length ? (
    <BulkActionModal title={'检验水平与接收质量限'} onSubmit={onModalSubmit} showAql />
  ) : (
    '检验水平与接收质量限'
  );
};

export const getSamplingTitle = (dataSource, onModalSubmit) => {
  return dataSource.length ? (
    <BulkActionModal title={'抽检类型与数值'} onSubmit={onModalSubmit} showSampling />
  ) : (
    '抽检类型与数值'
  );
};

export const getStandardTitle = (dataSource, onModalSubmit, form) => {
  const { getFieldValue } = form;
  return dataSource.length ? (
    <BulkActionModal
      title={'标准'}
      onSubmit={onModalSubmit}
      showAql={getFieldValue('checkCountType') === AQL_CHECK}
      showSampling={getFieldValue('checkCountType') === CHECKITEM_CHECK}
    />
  ) : (
    '标准'
  );
};

export const getQcDefectReasonTitle = (dataSource, onModalSubmit, form) => {
  const { getFieldValue } = form;
  return dataSource.length ? (
    <BulkActionModal
      title={'不良原因细分'}
      onSubmit={onModalSubmit}
      showAql={getFieldValue('checkCountType') === AQL_CHECK}
      showSampling={getFieldValue('checkCountType') === CHECKITEM_CHECK}
    />
  ) : (
    '不良原因细分'
  );
};

// 质检项标准表单项与其他不同，批量设置时可能需要再次getField
export const getStandardField = (form, group, key) => {
  const { getFieldDecorator } = form;
  getFieldDecorator(`qcCheckItemConfigs${group}[${key}].base`);
  getFieldDecorator(`qcCheckItemConfigs${group}[${key}].min`);
  getFieldDecorator(`qcCheckItemConfigs${group}[${key}].max`);
  getFieldDecorator(`qcCheckItemConfigs${group}[${key}].deltaPlus`);
  getFieldDecorator(`qcCheckItemConfigs${group}[${key}].deltaMinus`);
  getFieldDecorator(`qcCheckItemConfigs${group}[${key}].unitId`);
};

export const getInitialField = (form, qcCheckItem, key) => {
  const { getFieldDecorator } = form;
  const {
    id,
    name,
    code,
    group,
    desc,
    group: { name: groupName },
  } = qcCheckItem;
  getFieldDecorator(`qcCheckItemConfigs${group}[${key}].deleted`, { initialValue: false });
  getFieldDecorator(`qcCheckItemConfigs${group}[${key}].id`, { initialValue: id });
  getFieldDecorator(`qcCheckItemConfigs${group}[${key}].code`, {
    initialValue: code,
  });
  getFieldDecorator(`qcCheckItemConfigs${group}[${key}].name`, {
    initialValue: name,
  });
  getFieldDecorator(`qcCheckItemConfigs${group}[${key}].groupName`, {
    initialValue: groupName,
  });
  getFieldDecorator(`qcCheckItemConfigs${group}[${key}].desc`, {
    initialValue: desc,
  });
  getFieldDecorator(`qcCheckItemConfigs${group}[${key}].logic`);
  getFieldDecorator(`qcCheckItemConfigs${group}[${key}].qcDefectConfigs`);
  getFieldDecorator(`qcCheckItemConfigs${group}[${key}].checkCountType`, {
    initialValue: undefined,
  });
  getFieldDecorator(`qcCheckItemConfigs${group}[${key}].checkNums`, getCheckNumsValid(form, undefined, true));
  getFieldDecorator(`qcCheckItemConfigs${group}[${key}].qcAqlId`);
  getFieldDecorator(`qcCheckItemConfigs${group}[${key}].qcAqlInspectionLevelId`);
  getStandardField(form, group, key);
};
