/** 自定义字段位置集 */
export const KeyTypes = [
  {
    key: 0,
    name: '订单物料行',
  },
  {
    key: 1,
    name: '订单',
  },
];

const formattedKeyType = (keyType) => {
  for (const obj of KeyTypes) {
    if (keyType === obj.key) {
      return obj.name;
    }
  }
  return '';
};

/** 销售订单自定义字段 view model */
class SaleOrderCPModel {
  /** 字段列表 */
  properties = [];
  /** 编辑字段列表 */
  editProperties = [];

  static of() {
    const o = new SaleOrderCPModel();
    return o;
  }

  get fields() {
    if (!Array.isArray(this.properties)) return [];
    const _fields = [];
    this.properties.forEach(property => {
      const { keyName, keyLength, keyType: type } = property;
      const keyType = formattedKeyType(type);
      const field = {
        keyName,
        keyLength,
        keyType,
      };
      _fields.push(field);
    });
    return _fields;
  }

  getCustomPropertyDTO(formValue) {
    if (Array.isArray(formValue) && Array.isArray(this.properties)) {
      for (const formItem of formValue) {
        for (const property of this.properties) {
          const { id, keyName } = property;
          if (formItem.keyName === keyName) {
            formItem.id = id;
            break;
          }
        }
      }
    }
    return formValue;
  }
}

export default SaleOrderCPModel;