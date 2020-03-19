import { formatUnixMoment, formatToUnix, genMilliseconds, setDayEnd, format } from 'utils/time';
import { arrayIsEmpty } from 'utils/array';
import _ from 'lodash';
import { safeSub, safeDiv, safeMul, safeAdd } from 'utils/number';
import BaseMaterialModel from './BaseMaterialModel';
import QrCodeAndAmountModel from './QrCodeAndAmountModel';

/** 物料入厂基础信息  */
export default class BaseMaterialIncomingModel extends BaseMaterialModel {
  /** 入厂仓位 */
  storageId: number;
  /** 入厂规格 */
  incomingSpecification: any = null /** todo: 应该是baseMaterial specifications的一个 */;
  /** 入厂批次 */
  incomingBatch: String = null;
  /** 生产日期 */
  productionDate: Number;
  /** 有效期至 */
  validDate: Number;
  /** 入厂记录 */
  incomingNote: String = null;
  /** 供应商 */
  supplierName: String = null;
  /** 供应商批次 */
  supplierBatch: String = null;
  /** 产地 - 省份 */
  province: String = null;
  /** 产地 - 城市 */
  city: String = null;
  /** 本次入厂物料数量 */
  amount: Number = null;
  /** 入厂物料使用单位 */
  useUnit: String = null;
  /** 入厂物料二维码数量 */
  qrCodeAndAmount: Array<QrCodeAndAmountModel> = [new QrCodeAndAmountModel()];

  constructor(props) {
    super(props);
    this.init(props);
  }

  init(data): BaseMaterialIncomingModel {
    // const { material, ...rest } = data || {};
    super.init();
  }

  genTodayTimestamp(): Number {
    return setDayEnd(new Date().getTime());
  }

  genValidDateByProductionDate(): Number {
    if (!this.productionDate) {
      this.validDate = undefined;
      return;
    }
    if (this.materialValidTime) {
      return safeAdd(this.productionDate, genMilliseconds(this.materialValidTime, this.materialValidTimeUnit));
    }
    this.genTodayTimestamp();
  }

  get validDateMoment(): Object {
    if (this.validDate) {
      return formatUnixMoment(setDayEnd(this.validDate), 'YYYY/MM/DD');
    }
    return undefined;
  }

  // set productionDate(productionDateMoment: Object) {
  //   return formatToUnix(productionDateMoment);
  // }

  get productionDateMoment(): Object {
    if (this.productionDate) {
      return formatUnixMoment(setDayEnd(this.productionDate), 'YYYY/MM/DD');
    }
    return undefined;
  }

  updateProductionDate(date: Object): void {
    this.productionDate = date ? formatToUnix(date) : undefined;
  }

  updateValidDateByProductionDate(): void {
    this.validDate = this.genValidDateByProductionDate();
  }

  updateValidDate(date): void {
    this.validDate = date ? formatToUnix(date) : undefined;
  }

  updateItem(itemName, itemData): void {
    this[`${itemName}`] = itemData;
  }

  addQrCodeAndAmount(): void {
    const newItem = new QrCodeAndAmountModel();
    this.qrCodeAndAmount = this.qrCodeAndAmount.concat(newItem);
  }

  removeQrCodeAndAmount(rowIndex: Number): void {
    if (rowIndex >= 0) {
      this.qrCodeAndAmount = this.qrCodeAndAmount.filter((item, i) => i !== rowIndex);
    }
  }

  updateQrCodeAndAmount(items): void {
    this.qrCodeAndAmount = arrayIsEmpty(items)
      ? [new QrCodeAndAmountModel()]
      : items.map(item => new QrCodeAndAmountModel(item));
  }

  updateQrCodeAndAmountByVariables(formatInOne: Boolean = false): void {
    const spec = this.incomingSpecification;
    const amount = this.amount;
    if (_.isEmpty(spec) || !_.isNumber(amount)) {
      this.qrCodeAndAmount = [new QrCodeAndAmountModel()];
      return;
    }
    const { numerator, denominator } = spec || {};
    if (numerator >= amount) {
      this.qrCodeAndAmount = [new QrCodeAndAmountModel({ singleCodeAmount: amount, codeAmount: 1 })];
      return;
    }
    const qrCodeAmount = safeDiv(amount, numerator, 6);
    const integerCodeAmount = _.floor(qrCodeAmount);
    const decimalMaterialAmount = safeSub(amount, safeMul(integerCodeAmount, numerator, 6), 6);
    const qrCodeAndAmount = [
      {
        singleCodeAmount: numerator,
        codeAmount: integerCodeAmount,
      },
      {
        singleCodeAmount: decimalMaterialAmount,
        codeAmount: 1,
      },
    ]
      .filter(n => n.singleCodeAmount && n.codeAmount)
      .map(n => new QrCodeAndAmountModel(n));
    if (formatInOne && qrCodeAndAmount && qrCodeAndAmount.length === 2) {
      this.qrCodeAndAmount = qrCodeAndAmount
        .filter((n, i) => i === 0)
        .map(n => ({ ...n, codeAmount: n.codeAmount + 1 }));
      return;
    }
    this.qrCodeAndAmount = qrCodeAndAmount;
  }

  updateAmountByQrCodeAmount(): void {
    /** 二维码数量反推入厂数 */
    if (!arrayIsEmpty(this.qrCodeAndAmount)) {
      let amount = 0;
      this.qrCodeAndAmount.forEach(({ singleCodeAmount, codeAmount }) => {
        if (singleCodeAmount > 0 && codeAmount > 0) {
          amount = safeAdd(amount, safeMul(singleCodeAmount, codeAmount));
        }
      });
      this.amount = amount || undefined;
      return;
    }
    this.amount = undefined;
  }
}
