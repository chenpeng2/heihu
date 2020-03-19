import moment from 'moment';
import _ from 'lodash';
import { MoveTransaction } from 'constants';

class Unit {
  id: Number;
  name = '';
}

class Material {
  lineNum = '';
  code = '';
  name = '';
  planAmount = 0;
  remark = '';
  units = [];
  unit: Unit;

  static of() {
    const o = new Material();
    return o;
  }

  static fromJson(json) {
    const o = this.of();
    if (json) {
      o.lineNum = json.lineNo;
      o.code = json.materialCode;
      o.name = json.materialName;
      o.planAmount = json.amount;
      o.remark = json.lingRemark;
      o.ratio = json.ratio;
      const { materialInfo } = json;
      const unitId = _.get(materialInfo, 'unitId', null);
      const unitName = _.get(materialInfo, 'unitName', '');
      if (unitId && unitName) {
        const unit = new Unit();
        unit.id = unitId;
        unit.name = unitName;
        o.unit = unit;
      }
    }
    return o;
  }

  static toJson(value) {
    const o = {};
    if (value) {
      o.amount = value.amount;
      o.lineNo = value.lineNum;
      o.lingRemark = value.remark;
      o.materialCode = value.code;
      o.materialName = value.name;
      const { unit, ratio } = value;
      if (unit) {
        o.unitId = unit.id;
      }
      if (ratio && ratio.unitId) {
        o.ratio = ratio;
      }
    }
    return o;
  }
}

export class CreateTransferApplyFormModel {
  /** 编号 */
  code = '';
  /** 需要审批 */
  needApprove = false;
  /** 目标仓位 */
  targetStorage;
  /** 物料列表详情 */
  materials;
  /** 备注 */
  remark = '';
  /** 需求时间 */
  requireTime;
  /** 发出仓库 */
  sourceWarehouse;
  sourceWarehouseCode;
  sourceWarehouseName = '';
  /** 目标仓位 */
  targetStorageId;
  targetStorageCode;
  targetStorageName;
  /** 任务 code */
  taskCode = '';
  /** 事务 code */
  transactionCode = '';

  static of() {
    const o = new CreateTransferApplyFormModel();
    return o;
  }

  static fromJson(json) {
    const o = this.of();
    if (json) {
      o.code = json.code;
      o.needApprove = json.needSupervisor;
      o.remark = json.remark;
      if (json.requireTime) {
        o.requireTime = moment(json.requireTime);
      }
      o.sourceWarehouseCode = json.sourceWarehouseCode;
      o.sourceWarehouseName = json.sourceWarehouseName;
      o.targetStorageId = json.targetStorageId;
      o.targetStorageCode = json.targetStorageCode;
      o.targetStorageName = json.targetStorageName;
      o.taskCode = json.taskCode;
      o.transactionCode = json.transactionCode;
      const { materials } = json;
      if (Array.isArray(materials)) {
        o.materials = materials.map(material => Material.fromJson(material));
      }
    }
    return o;
  }

  get formattedTargetStorage() {
    if (this.targetStorageId && this.targetStorageCode && this.targetStorageName) {
      return `${this.targetStorageId},${this.targetStorageCode},3,${this.targetStorageName}`;
    }
    return '';
  }

  get sourceWarehouseOption() {
    if (!this.sourceWarehouseCode || !this.sourceWarehouseName) return '';
    const o = { key: this.sourceWarehouseCode, label: this.sourceWarehouseName };
    return o;
  }

  get transactionName() {
    if (this.transactionCode === MoveTransaction.overBalance.code) {
      return MoveTransaction.overBalance.name;
    }
    if (this.transactionCode === MoveTransaction.sendBack.code) {
      return MoveTransaction.sendBack.name;
    }
  }

  removeMaterialAtIndex(index) {
    if (Number.isNaN(index) || index < 0) return false;

    if (!Array.isArray(this.materials) || this.materials.length < 1) return false;

    this.materials.splice(index, 1);
    return true;
  }

  updateMaterialAtIndex(value, index) {
    if (Number.isNaN(index) || index < 0) return false;

    if (!Array.isArray(this.materials) || this.materials.length <= index) return false;

    const o = this.materials[index];
    if (!o || !value) return false;
    this.materials[index] = { ...o, ...value };
    return true;
  }

  setSourceWarehouse(option) {
    if (!option) return;
    const { key, label } = option;
    this.sourceWarehouseCode = key;
    this.sourceWarehouseName = label;
  }

  setTargetStorage(value) {
    if (!value) return;
    const arr = value.split(',');
    if (Array.isArray(arr) && arr.length >= 4) {
      this.targetStorageId = arr[0];
      this.targetStorageCode = arr[1];
      this.targetStorageName = arr[3];
    }
  }

  toJson(values) {
    const o = {};
    if (values) {
      o.code = values.code;
      o.needSupervisor = values.approve;
      o.remark = values.remark;
      o.taskCode = this.taskCode;
      o.transactionCode = this.transactionCode;
      o.targetStorageId = this.targetStorageId;
      const { materials, sourceWarehouse, requireTime } = values;
      if (Array.isArray(materials)) {
        o.materials = materials.map(material => Material.toJson(material));
      }
      if (sourceWarehouse) {
        o.sourceWarehouseCode = sourceWarehouse.key;
      }
      if (requireTime) {
        o.requireTime = requireTime.toDate();
      }
    }
    return o;
  }
}

/** 创建转移申请 */
class CreateTransferApplyModel {
  /** 表单详情 */
  formData = CreateTransferApplyFormModel.of();

  static of() {
    const o = new CreateTransferApplyModel();
    return o;
  }

  static fromJson(json) {
    const o = this.of();
    o.formData = CreateTransferApplyFormModel.fromJson(json);
    return o;
  }
}

export default CreateTransferApplyModel;
