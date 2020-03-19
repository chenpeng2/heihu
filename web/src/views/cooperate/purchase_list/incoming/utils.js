import _ from 'lodash';
import {
  ORGANIZATION_CONFIG,
  includeOrganizationConfig,
  getOrganizationConfigFromLocalStorage,
} from 'utils/organizationConfig';
import { arrayIsEmpty } from 'utils/array';
import { QC_STATUS } from '../constants';

export const FIELDNAME = 'materialIncoming';

export const useQrCode = includeOrganizationConfig(ORGANIZATION_CONFIG.useQrcode);
export const config = getOrganizationConfigFromLocalStorage();
export const taskDispatchType = _.get(config, `[${ORGANIZATION_CONFIG.taskDispatchType}].configValue`);

export const qrCodeAndAmountField = index => `${FIELDNAME}[${index}].qrCodeAndAmount`;
export const unitField = index => `${FIELDNAME}[${index}].useUnit`;
export const validDateField = index => `${FIELDNAME}[${index}].validDateMoment`;
export const productionDateField = index => `${FIELDNAME}[${index}].productionDateMoment`;
export const materialCodeField = index => `${FIELDNAME}[${index}].materialCode`;
export const materialLineIdField = index => `${FIELDNAME}[${index}].materialLineId`;
export const amountField = index => `${FIELDNAME}[${index}].amount`;
export const incomingSpecificationField = index => `${FIELDNAME}[${index}].incomingSpecification`;
export const productionPlaceField = index => `${FIELDNAME}[${index}].productionPlace`;
export const incomingBatchField = index => `${FIELDNAME}[${index}].incomingBatch`;
export const incomingNoteField = index => `${FIELDNAME}[${index}].incomingNote`;
export const supplierBatchField = index => `${FIELDNAME}[${index}].supplierBatch`;
export const codeAmountField = (index, rowIndex) => `${FIELDNAME}[${index}].qrCodeAndAmount[${rowIndex}].codeAmount`;
export const singleCodeAmountField = (index, rowIndex) =>
  `${FIELDNAME}[${index}].qrCodeAndAmount[${rowIndex}].singleCodeAmount`;
export const checkedField = index => `${FIELDNAME}[${index}].checked`;
export const storageField = index => `${FIELDNAME}[${index}].storage`;

export const getQcStatus = inputFactoryQcConfigs =>
  !arrayIsEmpty(inputFactoryQcConfigs) ? QC_STATUS.WAIT : QC_STATUS.STANDARD;

export default 'dummy';
