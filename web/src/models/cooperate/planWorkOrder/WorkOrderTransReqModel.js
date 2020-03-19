import _ from 'lodash';

import { formatUnixMoment, formatToUnix, setDayStart } from 'utils/time';
import { arrayIsEmpty } from 'utils/array';

import BaseMaterialModel from './BaseMaterialModel';
import WorkOrderModel from './WorkOrderModel';
import { StorageModel, ProcessModel, DateTimeModel } from './BaseModel';

/**
 * 计划工单创建物料转移申请（占用库存）
 *
 * @export
 * @class WorkOrderTransReqModel
 * @extends {WorkOrderModel}
 */
export default class WorkOrderTransReqModel {
  key: String = _.uniqueId('WorkOrderTransReq_');
  material: BaseMaterialModel = new BaseMaterialModel();
  demandQuantity: Number = 0;
  availableInventory: Number = 0;
  sourceWarehouse: StorageModel = new StorageModel();
  targetStorage: StorageModel = new StorageModel();
  demandDate: DateTimeModel = new DateTimeModel();
  workOrderCode: String = '';
  process: Array<ProcessModel> = [new ProcessModel()];

  static fromJson(data: Object): WorkOrderTransReqModel {
    const model = new WorkOrderTransReqModel();
    if (!data) return model;
    const {
      materialCode,
      materialName,
      materialUnit,
      amount,
      canUseInventory,
      issueWarehouseId,
      issueWarehouseCode,
      issueWarehouseName,
      requireTime,
      workOrderCode,
      processSeqs,
    } = data;
    model.material = BaseMaterialModel.fromJson({
      name: materialName,
      code: materialCode,
      unitName: materialUnit,
    });
    model.demandQuantity = amount;
    model.availableInventory = canUseInventory;
    model.workOrderCode = workOrderCode;
    model.demandDateMoment = requireTime;
    model.sourceWarehouse = new StorageModel(issueWarehouseId, issueWarehouseCode, issueWarehouseName);
    model.process = arrayIsEmpty(processSeqs)
      ? [new ProcessModel()]
      : processSeqs.map(
          ({ processSeq, processName, processCode }) => new ProcessModel(processSeq, processCode, processName),
        );

    return model;
  }

  static formatToApi(data: Array<Object>): Array<Object> {
    if (!data || arrayIsEmpty(data)) return;
    const handleStorage = value => {
      if (!value) {
        return undefined;
      }

      return value.split(',')[0];
    };
    return data.map(data => {
      const { demandDateMoment, sourceWarehouseOption, targetStorage, demandQuantity, processOption, ...rest } = data;
      const format = {
        planAmount: demandQuantity,
        requireTime: demandDateMoment ? formatToUnix(setDayStart(demandDateMoment)) : null,
        warehouseCode: _.get(sourceWarehouseOption, 'key'),
        targetStorageId: handleStorage(targetStorage),
        ...rest,
      };
      return format;
    });
  }

  set demandDateMoment(timestamp) {
    this.demandDate.moment = timestamp ? formatUnixMoment(timestamp) : undefined;
  }

  get defaultProcessOption() {
    if (arrayIsEmpty(this.process)) return;
    const defaultProcess = _.head(this.process) || {};
    return defaultProcess.option;
  }

  updateItem(data, keyName) {
    this[`${keyName}`] = data;
    console.log(this);
  }
}
