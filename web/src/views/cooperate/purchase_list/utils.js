import _ from 'lodash';
import {
  ORGANIZATION_CONFIG,
  includeOrganizationConfig,
  getOrganizationConfigFromLocalStorage,
} from 'utils/organizationConfig';
import { arrayIsEmpty } from 'utils/array';

export const FIELDNAME = 'materialIncoming';

export const useQrCode = includeOrganizationConfig(ORGANIZATION_CONFIG.useQrcode);
export const config = getOrganizationConfigFromLocalStorage();
export const taskDispatchType = _.get(config, `[${ORGANIZATION_CONFIG.taskDispatchType}].configValue`);

export default 'purchase_order';
