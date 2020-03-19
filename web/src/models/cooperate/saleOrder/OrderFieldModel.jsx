class OrderFieldModel {
  keyName = '';
  keyValue = '';
  maxLength = 0;

  static of(keyName, keyValue, maxLength) {
    const o = new OrderFieldModel();
    o.keyName = keyName;
    o.keyValue = keyValue;
    o.maxLength = maxLength;
    return o;
  }

  get name() {
    return this.keyName;
  }

  get value() {
    return this.keyValue;
  }

  get maxLengthMsg() {
    if (!this.keyName) return '';
    return `${this.keyName}长度不能超过${this.maxLength}个字`;
  }
}

export default OrderFieldModel;
