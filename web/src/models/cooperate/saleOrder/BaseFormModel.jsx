import _ from 'lodash';
import { replaceSign } from 'constants';
import OrderFieldModel from './OrderFieldModel';
import { KeyTypes } from '../../organizationConfig/SaleOrderCPModel';
import MaterialFieldModel from './MaterialFieldModel';

/** 销售订单 */
class SaleOrder {
  workOrders = [];
  orderCustomFields = [];
}

/** 销售订单表单 view model */
class BaseFormModel {
  /** 销售订单 */
  saleOrder: SaleOrder;
  /** 自定义字段 */
  customProperty = [];

  static of() {
    const o = new BaseFormModel();
    return o;
  }

  /** 是否显示全部计划工单 */
  get workOrderVisible() {
    return Boolean(this.saleOrder);
  }

  /** 全部计划工单 */
  get allWorkOrderStr() {
    if (!this.saleOrder || !Array.isArray(this.saleOrder.workOrders) || this.saleOrder.workOrders.length < 1) {
      return replaceSign;
    }

    const str = _.join(this.saleOrder.workOrders, '，');
    return str;
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

    if (this.saleOrder && Array.isArray(this.saleOrder.orderCustomFields)) {
      fields.forEach(field => {
        this.saleOrder.orderCustomFields.forEach(orderField => {
          if (field.keyName === orderField.keyName) {
            field.keyValue = orderField.keyValue;
          }
        });
      });
    }
    return fields;
  }

  /** 自定义物料行 */
  get customMaterialFields() {
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
}

export default BaseFormModel;
