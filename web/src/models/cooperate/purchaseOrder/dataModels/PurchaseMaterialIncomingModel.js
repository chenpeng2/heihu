import _ from 'lodash';
import { arrayIsEmpty } from 'utils/array';
import { formatUnix } from 'utils/time';
import BaseMaterialIncomingModel from './BaseMaterialIncomingModel';
import { genSpecificationValue } from '../../../../views/cooperate/purchase_list/incoming/Content/BaseComponents/IncomingSpecificationSelect';

/** 采购清单物料入厂展示信息 */
export default class PurchaseIncomingMaterialModel extends BaseMaterialIncomingModel {
  /** 销售订单编号 */
  purchaseOrderCode: String;
  /** 计划工单编号 */
  planWorkOrderCode: String;
  /** 项目编号 */
  projectCode: String;
  /** 最近选择仓位信息 */
  recentStorageInfo: {};
  /** 最近该物料使用单位 */
  recentUnitName: String;
  /** 物料行id */
  materialLineId: Number;
  /** 需求时间 */
  demandDate: Number;

  constructor(props) {
    super(props);
    this.init(props);
  }

  init(data): void {
    super.init();
    const { materialData, purchaseOrderData, ...rest } = data || {};
    const { supplier } = purchaseOrderData || {};
    const {
      purchaseOrderCode,
      planWorkOrderCode,
      projectCode,
      recentStorageInfo,
      recentUnitName,
      material,
      validPeriod,
      productionDate,
      demandTime,
      id,
    } = materialData || {};
    this.purchaseOrderCode = purchaseOrderCode;
    this.planWorkOrderCode = planWorkOrderCode;
    this.projectCode = projectCode;
    this.recentStorageInfo = recentStorageInfo;
    this.recentUnitName = recentUnitName || undefined;
    this.materialLineId = id;
    this.productionDate = productionDate;
    this.validDate = validPeriod;
    this.supplierName = supplier && supplier.name;
    const { code, name, specifications, unit, unitConversions, validTime, inputFactoryQcConfigs } = material || {};
    this.materialCode = code;
    this.materialName = name;
    this.incomingSpecifications = specifications;
    this.masterUnit = unit;
    this.unitConversions = unitConversions;
    this.inputFactoryQcConfigs = inputFactoryQcConfigs;
    this.materialValidTime = validTime;
    this.demandDate = demandTime;
  }

  get demandDateMoment(): Object {
    return this.demandDate ? formatUnix(this.demandDate, 'YYYY/MM/DD') : undefined;
  }

  setFormInitialValue(): void {
    if (_.get(this.incomingSpecifications, 'length') === 1) {
      this.incomingSpecification = this.incomingSpecifications[0];
    }
    if (this.incomingSpecification) {
      this.useUnit = _.get(this.incomingSpecification, 'unitName');
    } else {
      this.useUnit = this.recentUnitName;
    }
    this.storageId = _.get(this.recentStorageInfo, 'id');
  }

  get recentStorage(): String {
    if (this.recentStorageInfo) {
      return `${this.recentStorageInfo.id},${this.recentStorageInfo.code},3`;
    }
    return '';
  }
}
