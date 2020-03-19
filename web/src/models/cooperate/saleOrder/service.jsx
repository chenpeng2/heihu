import _ from 'lodash';
import { getSaleOrderCustomProperty } from 'services/cooperate/purchaseOrder';

/** 获取销售订单自定义字段 */
export const getSOCustomProperty = async () => {
  try {
    const response = await getSaleOrderCustomProperty();
    const properties = _.get(response, 'data.data', []);
    return properties;
  } catch (error) {
    console.log(error);
    return [];
  }
};
