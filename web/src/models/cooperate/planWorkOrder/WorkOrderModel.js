import _ from 'lodash';

import { formatUnixMoment, formatUnix, genMilliseconds, setDayEnd, setDayStart, format } from 'utils/time';
import { arrayIsEmpty } from 'utils/array';

import SubWorkOrderModel from './SubWorkOrderModel';
import BaseMaterialModel from './BaseMaterialModel';
import { ProductBatchModel, RelatedPersonModel, ProcessRouteModel, EBomModel, MBomModel } from './BaseModel';
import {
  PROCESS_TYPE_PROCESS_ROUTE,
  PROCESS_TYPE_EBOM,
  PROCESS_TYPE_MBOM,
  PROCESS_TYPE_PROCESS_ROUTE_AND_EBOM,
} from '../../../containers/plannedTicket/constants';

export default class WorkOrderModel {
  key: String = '';
  workOrderLevel: Number = 1;
  workOrderCode: String = '';
  outputMaterial: BaseMaterialModel = new BaseMaterialModel();
  demandQuantity: Number = 0;
  outputAmount: Number = 0;
  productBatch: ProductBatchModel = new ProductBatchModel();
  planners: Array<RelatedPersonModel> = [new RelatedPersonModel()];
  managers: Array<RelatedPersonModel> = [new RelatedPersonModel()];
  priority: Number = 1;
  planStartDate: String = '';
  planEndDate: String = '';
  processType: String = PROCESS_TYPE_PROCESS_ROUTE;
  processRouteCode: String = '';
  processRouteName: String = '';
  ebomVersion: String = '';
  mbomVersion: String = '';
  availableInventory: Number = 0;
  children: Array<SubWorkOrderModel> = null;

  static fromJson(data: Array): Array<WorkOrderModel> {
    if (arrayIsEmpty(data)) return [new WorkOrderModel()];
    return data.map(d => {
      const model = new WorkOrderModel();
      model.fromJson(d);
      if (!arrayIsEmpty(d.children)) {
        d.children = WorkOrderModel.fromJson(d.children);
      }
      return model;
    });
  }

  fromJson(data: Object) {
    if (!data) return;
    const {
      outputMaterial,
      productBatch,
      plannerOptions,
      managerOptions,
      // children,
      ...rest
    } = data;

    Object.keys(data).forEach(k => {
      if (this.hasOwnProperty(k)) {
        this[`${k}`] = rest[`${k}`];
      }
    });

    this.setRelatedPersonOption(plannerOptions, 'plannerOptions');
    this.setRelatedPersonOption(managerOptions, 'managerOptions');
    this.setOutputMaterial(outputMaterial);
    this.setProductBatch(productBatch);
  }

  setOutputMaterial(data: Object): void {
    this.outputMaterial = BaseMaterialModel.fromJson(data);
  }

  setProductBatch(data: Object): void {
    this.productBatch = new ProductBatchModel().fromJson(data);
  }

  updateItem(itemName: String, value: any) {
    this[`${itemName}`] = value;
  }

  setChildrenFromJson(data: Array): void {
    if (arrayIsEmpty(data)) return null;
    this.children = data.map(d => {
      const model = new SubWorkOrderModel();
      model.fromJson(d);
      return model;
    });
  }

  get planStartDateMoment(): Object {
    if (this.planStartDate) {
      return formatUnixMoment(this.planStartDate);
    }
    return undefined;
  }

  get planEndDateMoment(): Object {
    if (this.planEndDate) {
      return formatUnixMoment(this.planEndDate);
    }
    return undefined;
  }

  get defaultProcessOption(): Object {
    const ebomOption = { key: this.ebomVersion, label: this.ebomVersion };
    const mbomOption = { key: this.mbomVersion, label: this.mbomVersion };
    const processRouteOption = this.processRouteCode
      ? {
          key: this.processRouteCode,
          label: `${this.processRouteCode}/${this.processRouteName}`,
        }
      : undefined;
    const processRouteAndEbomOption = {
      processRoute: processRouteOption,
      ebom: ebomOption,
    };

    if (!this.processType) {
      if (this.processRouteCode && this.ebomVersion) {
        this.processType = PROCESS_TYPE_PROCESS_ROUTE_AND_EBOM;
      } else if (this.ebomVersion) {
        this.processType = PROCESS_TYPE_EBOM;
      } else if (this.mbomVersion) {
        this.processType = PROCESS_TYPE_MBOM;
      }
    }

    switch (this.processType) {
      case PROCESS_TYPE_PROCESS_ROUTE:
        return processRouteOption;
      case PROCESS_TYPE_EBOM:
        return ebomOption;
      case PROCESS_TYPE_MBOM:
        return mbomOption;
      case PROCESS_TYPE_PROCESS_ROUTE_AND_EBOM:
        return processRouteAndEbomOption;
      default:
        return {};
    }
  }

  setRelatedPersonOption(options: Object, keyName: String) {
    const key = keyName === 'plannerOptions' ? 'planners' : 'managers';
    this[`${key}`] = arrayIsEmpty(options) ? null : options.map(option => RelatedPersonModel.fromOption(option));
  }

  genRelatedPersonOptions(keyName): Array {
    const data = this[`${keyName}`];
    if (arrayIsEmpty(data)) return [];
    return data.map(planner => planner.option);
  }
}
