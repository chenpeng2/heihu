import _ from 'lodash';
import { arrayIsEmpty } from 'utils/array';
import WorkOrderModel from './WorkOrderModel';
import BaseMaterialModel from './BaseMaterialModel';
import { RelatedPersonModel, ProcessModel } from './BaseModel';

export default class SubWorkOrderModel extends WorkOrderModel {
  parentKey: Number;
  parentWorkOrderCode: String;
  parentProcess: Array<ProcessModel>;

  fromJson(data: Object) {
    if (!data) return;
    const { parentWorkOrderCode, parentProcess, parentKey } = data;
    super.fromJson(data);
    this.setParentProcess(parentProcess);
    this.parentWorkOrderCode = parentWorkOrderCode;
    this.parentKey = parentKey;
  }

  get defaultParentProcessOption(): Object {
    if (arrayIsEmpty(this.parentProcess)) return new ProcessModel().option;
    const firstParentProcess = _.head(this.parentProcess);
    return firstParentProcess.option;
  }

  setParentProcess(data: Array): void {
    if (arrayIsEmpty(data)) return null;
    this.parentProcess = data.map(d => ProcessModel.fromJson(d));
  }
}
