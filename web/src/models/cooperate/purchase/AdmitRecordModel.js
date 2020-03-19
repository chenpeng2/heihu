/** 入厂记录 */
class AdmitRecordModel {
  /** 正在打印 */
  printing = false;

  static of() {
    const o = new AdmitRecordModel();
    return o;
  }
}

export default AdmitRecordModel;