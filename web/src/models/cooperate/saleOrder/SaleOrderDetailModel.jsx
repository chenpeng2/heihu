import OrderFieldModel from './OrderFieldModel';
import MaterialFieldModel from './MaterialFieldModel';
import { KeyTypes } from '../../organizationConfig/SaleOrderCPModel';

class SaleOrderDetailModel {
  /** 订单行自定义字段 raw data */
  orderCustomFields = [];
  /** 物料行 raw data */
  materialList = [];
  /** 物料行自定义字段 raw data */
  lineCustomFields = [];

  /** 自定义字段配置 */
  customProperty = [];

  static of() {
    const o = new SaleOrderDetailModel();
    return o;
  }

  /** 自定义订单行 */
  get customOrderFields() {
    if (!Array.isArray(this.customProperty)) return [];

    const fields: OrderFieldModel[] = [];
    this.customProperty.forEach(property => {
      if (property.keyType === KeyTypes[1].key) {
        const field = OrderFieldModel.of(property.keyName, '', property.keyLength);
        fields.push(field);
      }
    });
    if (Array.isArray(this.orderCustomFields)) {
      fields.forEach(field => {
        this.orderCustomFields.forEach(orderField => {
          if (field.keyName === orderField.keyName) {
            field.keyValue = orderField.keyValue;
          }
        });
      });
    }
    return fields;
  }

  /** 自定义物料行 */
  get customLineFields() {
    if (!Array.isArray(this.customProperty)) return [];

    const fields: MaterialFieldModel[] = [];
    this.customProperty.forEach(property => {
      if (property.keyType === KeyTypes[0].key) {
        const field = MaterialFieldModel.of(property.keyName, property.keyLength);
        fields.push(field);
      }
    });
    return fields;
  }

  getSoDTO(values, customOrderFields, customMaterialFields) {
    if (!values) return values;

    const { purchaseOrderCode, materialList } = values;
    const orderCustomFields = [];
    if (Array.isArray(customOrderFields)) {
      customOrderFields.forEach(field => {
        const { keyName } = field;
        const keyValue = values[keyName] ? values[keyName] : '';
        const orderFieldDTO = {
          purchaseOrderCode,
          keyName,
          keyValue,
        };
        orderCustomFields.push(orderFieldDTO);
      });
    }
    values.orderCustomFields = orderCustomFields;

    if (Array.isArray(customMaterialFields) && Array.isArray(materialList)) {
      materialList.forEach(material => {
        const { materialCode, id: lineId } = material;
        const lineCustomField = [];
        customMaterialFields.forEach(field => {
          const { keyName } = field;
          const keyValue = material[keyName] ? material[keyName] : '';
          const lineFieldDTO = {
            purchaseOrderCode,
            materialCode,
            lineId,
            keyName,
            keyValue,
          };
          lineCustomField.push(lineFieldDTO);
        });
        material.lineCustomField = lineCustomField;
      });
    }
    return values;
  }
}

export default SaleOrderDetailModel;
