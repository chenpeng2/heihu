import React from 'react';
import moment from 'src/utils/time';

import { content, primary } from 'src/styles/color/index';
import { Tooltip, Icon } from 'src/components';

// 将后端的数据格式化为表单需要的
export const formatServiceDataToFormData = serviceData => {
  if (!Array.isArray(serviceData)) return null;

  return serviceData.map(i => {
    const { requireTime, materialCode, materialName, materialUnit, unitId, ...rest } = i;
    return {
      material: { code: materialCode, name: materialName, unitName: materialUnit, unitId },
      requireTime: requireTime ? moment(requireTime) : null,
      ...rest,
    };
  });
};

// 合并的时候需要将物料列表的数据格式化
export const formatMaterialListValueToService = formValue => {
  if (!Array.isArray(formValue)) return;
  return formValue
    .map(i => {
      const { material, amount, requireTime, sourceWarehouse, targetStorage, taskCodes, ...rest } = i || {};
      return {
        materialCode: material ? material.code : null,
        unitId: material ? material.unitId : null,
        amount,
        requireTime: requireTime ? moment(requireTime) : null,
        taskCodes,
        sourceWarehouseCode: sourceWarehouse ? sourceWarehouse.key : null,
        targetStorageId: targetStorage ? targetStorage.split(',')[0] : null,
        ...rest,
      };
    })
    .filter(i => i);
};

// 将表单的数据格式化给后端
export const formatFormValueForService = formValue => {
  if (!formValue) return;
  const { materialList, approve } = formValue;

  const materialListData = formatMaterialListValueToService(materialList);
  if (Array.isArray(materialListData)) {
    return materialListData.map(i => {
      return {
        ...i,
        needSupervisor: approve, // 审批
      };
    });
  }

  return null;
};

export const renderTooltip = (title, info) => {
  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      <Tooltip title={<div style={{ color: content }}>{info}</div>} overlayStyle={{ width: 406 }}>
        <Icon type="exclamation-circle-o" color={primary} style={{ marginRight: 5 }} />
      </Tooltip>
      <span>{title}</span>
    </span>
  );
};

export default 'dummy';
