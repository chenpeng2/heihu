/** 二维码数量与物料数量关系 */
export default class QrCodeAndAmountModel {
  /** 单个二维码代表的物料数量 */
  singleCodeAmount: Number;
  /** 二维码数量 */
  codeAmount: Number;

  constructor(props) {
    this.init(props);
  }

  init(data): QrCodeAndAmountModel {
    const { singleCodeAmount, codeAmount } = data || {};
    this.singleCodeAmount = singleCodeAmount;
    this.codeAmount = codeAmount;
  }
}
