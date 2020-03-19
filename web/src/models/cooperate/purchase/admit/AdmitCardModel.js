import moment from 'utils/time';
import {
  MaterialItemModel,
} from './MaterialItemModel';

export default class AdmitCardModel {
  /** `Number` */
  amountInFactory;
  /** `Number` */
  amountPlanned;
  attachmentIds;
  /** `Object` */
  concernedPerson;
  currentUnitName;
  /** `Number` */
  demandTime;
  eta;
  /** `Number` */
  id;
  /** 物料 `Object` */
  material;
  /** `String` */
  materialCode;
  /** `Object[]` */
  materialItems;
  /** 入厂记录 `String` */
  note;
  /** `Number` */
  orgId;
  /** `String` */
  planWorkOrderCode;
  /** `String` */
  procureOrderCode;
  /** `String` */
  projectCode;
  /** `String` */
  purchaseOrderCode;
  /** `Object` */
  recentStorageInfo;
  /** `String` */
  recentUnitName;
  /** `Object[]` */
  returnOut;
  signer;
  supplier;
  /** 是否选中 `Boolean` */
  checked;
  /** 是否显示移除 CodeAndAmountItem 按钮 */
  removable;
  /** 生产日期 */
  productionDate;
  /** 有效期 */
  validPeriod;

  static from(json) {
    if (!json) return null;
    const model = new AdmitCardModel();
    const {
      amountInFactory,
      amountPlanned,
      attachmentIds,
      concernedPerson,
      currentUnitName,
      demandTime,
      eta,
      id,
      material,
      materialCode,
      note,
      orgId,
      planWorkOrderCode,
      procureOrderCode,
      projectCode,
      purchaseOrderCode,
      recentStorageInfo,
      recentUnitName,
      returnOut,
      signer,
      supplier,
      productionDate,
      validPeriod,
    } = json;
    model.amountInFactory = amountInFactory;
    model.amountPlanned = amountPlanned;
    model.attachmentIds = attachmentIds;
    model.concernedPerson = concernedPerson;
    model.currentUnitName = currentUnitName;
    model.demandTime = demandTime;
    model.eta = eta;
    model.id = id;
    model.material = material;
    model.materialCode = materialCode;
    model.materialItems = [MaterialItemModel.of()];
    model.note = note;
    model.orgId = orgId;
    model.planWorkOrderCode = planWorkOrderCode;
    model.procureOrderCode = procureOrderCode;
    model.projectCode = projectCode;
    model.purchaseOrderCode = purchaseOrderCode;
    model.recentStorageInfo = recentStorageInfo;
    model.recentUnitName = recentUnitName;
    model.returnOut = returnOut;
    model.signer = signer;
    model.supplier = supplier;
    model.checked = true;
    model.productionDate = productionDate;
    model.validPeriod = validPeriod;
    return model;
  }

  get productionDateMoment() {
    if (this.productionDate) {
      return moment(this.productionDate);
    }
    return '';
  }

  get validPeriodMoment() {
    if (this.validPeriod) {
      return moment(this.validPeriod);
    }
    return '';
  }

  addMaterialItem() {
    let items = [];
    if (Array.isArray(this.materialItems)) {
      items = [...this.materialItems];
      const item = MaterialItemModel.of();
      items.push(item);
    }
    this.materialItems = items;
    this.removable = this.isCodeAndAmountRemovable(items);
  }

  removeMaterialItem(index) {
    const items = [];
    if (Array.isArray(this.materialItems)) {
      this.materialItems.forEach((item, j) => {
        if (index === j) {
          item.removed = true;
        }
        items.push(item);
      });
      this.materialItems = items;
      this.removable = this.isCodeAndAmountRemovable(items);
    }
  }

  isCodeAndAmountRemovable(items) {
    if (!Array.isArray(items)) return false;
    const validItems = [];
    items.forEach(item => {
      if (!item.removed) {
        validItems.push(item);
      }
    });
    return validItems.length > 1;
  }
}