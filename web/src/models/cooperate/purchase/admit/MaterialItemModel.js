export class MaterialItemModel {
  /** 单个二维码的物料数量 */
  materialCount;
  /** 二维码个数 */
  qrCodeCount;
  /** 是否移除 */
  removed;

  static of() {
    const model = new MaterialItemModel();
    model.materialCount = null;
    model.qrCodeCount = null;
    model.removed = false;
    return model;
  }
}