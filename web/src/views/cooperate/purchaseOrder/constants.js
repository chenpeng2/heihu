import _ from 'lodash';
import { arrayIsEmpty } from 'utils/array';
import { newline } from 'utils/string';
import { getSaleOrderCustomProperty } from 'services/cooperate/purchaseOrder';

export const TABLE_UNIQUE_KEY = 'PurchaseOrderListTableColumnConfig';

export const GET_PURCHASEORDER_IMPORT_TEMPLATE = async () => {
  const res = await getSaleOrderCustomProperty({ size: 1000 });
  const fields = _.get(res, 'data.data');
  const purchaseOrderItemFields = !arrayIsEmpty(fields) ? fields.filter(e => e.keyType === 0).map(e => e.keyName) : [];
  const purchaseOrderFields = !arrayIsEmpty(fields) ? fields.filter(e => e.keyType === 1).map(e => e.keyName) : [];
  let titles = ['订单号', '客户名称'];
  titles = titles.concat(purchaseOrderFields);
  titles = titles.concat(['备注', '物料编号', '数量', '单位', '交货日期']);
  titles = titles.concat(purchaseOrderItemFields);
  return {
    remark: `订单号：必填${newline}
  客户名称：必填，请填写已启用的客户名称${newline}
  订单自定义字段：非必填${newline}
  备注：非必填${newline}
  物料编号：必填，请填写已启用的物料编号${newline}
  数量：必填，请填写大于 0 的数字${newline}
  单位：必填，请填写已启用的单位${newline}
  交货日期：必填，请按 yyyy/mm/dd 格式填写，需保证内容格式为文本${newline}
  订单行自定义字段：非必填`,
    titles,
    name: '销售订单导入模板',
  };
};

export default TABLE_UNIQUE_KEY;
