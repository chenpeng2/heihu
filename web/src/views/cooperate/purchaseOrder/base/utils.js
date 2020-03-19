import _ from 'lodash';
import { queryMaterialCustomField } from 'src/services/bom/material';
import { formatToUnix, setDayStart } from 'src/utils/time';

import {
  getOrganizationConfigFromLocalStorage,
  ORGANIZATION_CONFIG,
} from 'src/utils/organizationConfig';

export const formatFormValue = (value, originalData) => {
  if (!value) return null;
  const { materialList, attachments, customerId } = value;
  let _materialList = materialList || [];

  if (materialList && materialList.length > 0) {
    _materialList = materialList && materialList.filter(x => x);
    _materialList = _materialList && _materialList.map(({ targetDate, ...rest }) => {
      const _targetDate = formatToUnix(setDayStart(targetDate));
      // const _targetDate = type !== 'edit' ? formatToUnix(setDayStart(targetDate)) : formatUnix(targetDate);
      return { targetDate: _targetDate, ...rest };
    });

    if (originalData) {
      let materialList = originalData.materialList;
      console.log({ materialList });
      materialList = materialList && materialList.map(
        ({ id, amount, unitName, targetDate, materialCode, ...rest }) =>
          ({ id, amount, unitName, targetDate, materialCode }));

      // 修改了原物料要释放原来物料行上的id
      _materialList = _materialList.map(({ id, materialCode, ...rest }) => {
        if (id && !_.find(materialList, o => o.materialCode === materialCode)) {
          return { materialCode, ...rest };
        }
        return { id, materialCode, ...rest };
      });
    }
  }

  const _attachments = Array.isArray(attachments) && attachments.length ? attachments.map(({ restId, id }) => restId || id) : [];

  const res = {
    ...value,
    customerId: customerId && customerId.key,
    materialList: _materialList,
    attachments: _attachments,
  };

  return res;
};

export const fetchCustomFields = async params => {
  let keyNames = [];
  await queryMaterialCustomField()
    .then(res => {
      const customFields = _.get(res, 'data.data');
      if (customFields && customFields.length > 0) {
        keyNames = customFields.map(({ keyName }) => keyName);
      }
    })
    .catch(err => console.log(err));

  return keyNames;
};

export const getOrgTaskDispatchConfig = () => {
  const config = getOrganizationConfigFromLocalStorage();

  return _.get(config, `[${ORGANIZATION_CONFIG.taskDispatchType}].configValue`);
};

export default 'dummy';
