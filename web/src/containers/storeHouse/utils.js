import { arrayIsEmpty } from 'src/utils/array';
import { useStorageCapacity, STORAGE_CAPACITY, findStorageCapacity } from './storageCapacity/utils';
import { TYPES } from './storageCapacity/userOrUserGroupSelect';

/**
 * @description: 格式化material数组,提交给后端
 *
 * @date: 2019/5/11 下午4:44
 */
const formatMaterials = materials => {
  if (arrayIsEmpty(materials)) return [];

  const getIds = (type, userIds, groupIds) => {
    if (type === TYPES.user.value && !arrayIsEmpty(userIds)) {
      return userIds.map(i => i && i.key).filter(i => i);
    }

    if (type === TYPES.userGroup.value && !arrayIsEmpty(groupIds)) {
      return groupIds.map(i => i && i.key).filter(i => i);
    }

    return [];
  };

  return materials
    .map(i => {
      const { material, amount, unit, operatorType, operatorIds, operatorGroupId } = i || {};
      return {
        materialCode: material && material.key,
        amount,
        unit: unit && unit.label,
        users:
          typeof operatorType === 'number'
            ? {
                type: operatorType, // 类型
                users: getIds(operatorType, operatorIds, operatorGroupId), // id的数组
              }
            : null,
      };
    })
    .filter(i => i && i.materialCode);
};

/**
 * @description: 格式化form表单中的数据提交给后端
 *
 * @date: 2019/5/11 下午4:16
 */
export const formatFormValueToSubmit = value => {
  if (!value) return null;

  // useStorageCapacity是是否启用库容检查
  // storageCapacity是库容容量
  // [number]-materialList是对应的库容检查项的物料列表数据
  const {
    useStorageCapacity: _useStorageCapacity,
    storageCapacity: _storageCapacity,
    [`${STORAGE_CAPACITY.max.value}-materialList`]: maxMaterials,
    [`${STORAGE_CAPACITY.min.value}-materialList`]: minMaterials,
    [`${STORAGE_CAPACITY.safe.value}-materialList`]: safeMaterials,
    ...rest
  } = value;

  return {
    ...rest,
    limitControl: _useStorageCapacity === useStorageCapacity.use.value,
    secureInventoryMaterials: arrayIsEmpty(safeMaterials) ? [] : formatMaterials(safeMaterials),
    minInventoryMaterials: arrayIsEmpty(minMaterials) ? [] : formatMaterials(minMaterials),
    maxInventoryMaterials: arrayIsEmpty(maxMaterials) ? [] : formatMaterials(maxMaterials),

    // 当不启用的时候后端为了保持数据不可以传false。要求不传
    secureControl: Array.isArray(_storageCapacity) ? _storageCapacity.includes(STORAGE_CAPACITY.safe.value) : null,
    minControl: Array.isArray(_storageCapacity) ? _storageCapacity.includes(STORAGE_CAPACITY.min.value) : null,
    maxControl: Array.isArray(_storageCapacity) ? _storageCapacity.includes(STORAGE_CAPACITY.max.value) : null,
  };
};

/**
 * @description: 将detail接口中数据的maxControl, minControl, secureControl格式化为数组
 *
 * @date: 2019/5/13 上午10:02
 */
const getStorageCapacityToForm = data => {
  if (!data) return null;
  const { maxControl, minControl, secureControl } = data;
  const res = [];
  if (maxControl) res.push(STORAGE_CAPACITY.max.value);
  if (minControl) res.push(STORAGE_CAPACITY.min.value);
  if (secureControl) res.push(STORAGE_CAPACITY.safe.value);

  return res;
};

/**
 * @description: 将详情接口中的material数据格式化
 *
 * @date: 2019/5/13 上午10:31
 */
const getMaterialList = data => {
  if (!data) return null;

  // 格式化物料。根据type
  const _formatMaterial = (type, data) => {
    if (arrayIsEmpty(data)) return null;
    return data.map(i => {
      const {
        materialCode,
        materialName,
        unitId,
        unit,
        maxAmount,
        maxUsers,
        minAmount,
        minUsers,
        secureAmount,
        infoUsers,
      } = i || {};

      const getUsers = (names, users) => {
        if (arrayIsEmpty(names)) return null;
        if (arrayIsEmpty(users)) return null;

        return users.map((i, index) => ({ key: i, label: names[index] }));
      };

      const baseRes = {
        material: materialCode ? { key: materialCode, label: `${materialCode}/${materialName}` } : undefined,
        unit: unitId ? { key: unitId, label: unit } : undefined,
      };

      if (type === STORAGE_CAPACITY.max.value) {
        const { type, names, users } = maxUsers || {};
        return {
          ...baseRes,
          amount: maxAmount,
          operatorType: type,
          operatorIds: type === TYPES.user.value ? getUsers(names, users) : undefined,
          operatorGroupId: type === TYPES.userGroup.value ? getUsers(names, users) : undefined,
        };
      }

      if (type === STORAGE_CAPACITY.min.value) {
        const { type, names, users } = minUsers || {};
        return {
          ...baseRes,
          amount: minAmount,
          operatorType: type,
          operatorIds: type === TYPES.user.value ? getUsers(names, users) : undefined,
          operatorGroupId: type === TYPES.userGroup.value ? getUsers(names, users) : undefined,
        };
      }

      if (type === STORAGE_CAPACITY.safe.value) {
        const { type, names, users } = infoUsers || {};
        return {
          ...baseRes,
          amount: secureAmount,
          operatorType: type,
          operatorIds: type === TYPES.user.value ? getUsers(names, users) : undefined,
          operatorGroupId: type === TYPES.userGroup.value ? getUsers(names, users) : undefined,
        };
      }

      return null;
    });
  };

  return {
    [`${STORAGE_CAPACITY.max.value}-materialList`]: _formatMaterial(STORAGE_CAPACITY.max.value, data),
    [`${STORAGE_CAPACITY.min.value}-materialList`]: _formatMaterial(STORAGE_CAPACITY.min.value, data),
    [`${STORAGE_CAPACITY.safe.value}-materialList`]: _formatMaterial(STORAGE_CAPACITY.safe.value, data),
  };
};

/**
 * @description: 将仓库详情接口里面的数据格式化为form表单中需要的数据
 *
 * @date: 2019/5/13 上午9:55
 */
export const formatDetailValueToForm = detailValue => {
  if (!detailValue) return null;

  const { limitControl, maxControl, minControl, secureControl, inventoryLimits, ...rest } = detailValue;

  return {
    useStorageCapacity: limitControl ? useStorageCapacity.use.value : useStorageCapacity.stop.value,
    storageCapacity: getStorageCapacityToForm({ maxControl, minControl, secureControl }),
    ...(getMaterialList(inventoryLimits) || {}),
    ...rest,
  };
};

/**
 * @description: 根据maxControl, minControl, secureControl得到STORAGE_CAPACITY常量数组
 *
 * @date: 2019/5/15 上午11:51
 */

export const getStorageCapacity = (maxControl, minControl, secureControl) => {
  const storageCapacity = [
    maxControl ? STORAGE_CAPACITY.max : null,
    minControl ? STORAGE_CAPACITY.min : null,
    secureControl ? STORAGE_CAPACITY.safe : null,
  ];
  return storageCapacity.filter(i => i);
};

export default 'dummy';
