import { QUALITY_STATUS } from 'src/views/qualityManagement/constants';

export const findQcStatus = v => {
  let res = null;
  Object.values(QUALITY_STATUS).forEach(i => {
    if (i && i.value === v) res = i;
  });

  return res;
};

export const getStorageAdjustDetailPageUrl = (id) => `/stock/storageAdjustRecord/${id}/detail`;

export default 'dummy';
