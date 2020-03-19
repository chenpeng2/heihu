/** 物料自定义字段 view model */
class MaterialFieldModel {
  /** 物料行行号，空表示新创建的物料行 */
  lineId = '';
  keyName = '';
  keyValue = '';
  maxLength = 10;

  static of(keyName, maxLength, keyValue) {
    const o = new MaterialFieldModel();
    o.keyName = keyName;
    o.maxLength = maxLength;
    o.keyValue = keyValue;
    return o;
  }

  get name() {
    return this.keyName;
  }

  get maxLengthMsg() {
    if (!this.keyName) return '';
    return `${this.keyName}长度不能大于${this.maxLength}`;
  }
}

export default MaterialFieldModel;
