export const PURCHASE_ORDER_BASE_URL = '/cooperate/purchaseLists';

// 采购清单详情
export const topurchaseOrderDetail = ({ code, id }) => {
  return `${PURCHASE_ORDER_BASE_URL}/${code}/detail/${id}`;
};

// 采购清单入厂
export const toPurchaseMaterialIncoming = ({ code, id }) => {
  return `${PURCHASE_ORDER_BASE_URL}/${code}/detail/${id}/incoming`;
};

export default PURCHASE_ORDER_BASE_URL;
