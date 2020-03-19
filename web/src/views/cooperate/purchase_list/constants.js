export const TABLE_UNIQUE_KEY = 'PurchaseListTableColumnConfig';

export const QC_STATUS = {
  STANDARD: 1, // '合格'
  AS_STANDARD: 2, // '让步合格'
  WAIT: 3, // '待检'
  UN_STANDARD: 4, // '不合格'
  TEMPORARY_CONTROL: 5, // '暂控'
};

/** 采购清单物料入厂展示类型 */
export const PURCHASE_MATERIAL_INCOMING_VIEW_TYPE_CARD = 1; //  卡片展示
export const PURCHASE_MATERIAL_INCOMING_VIEW_TYPE_LIST = 2; //  列表展示

export const presentationType = {
  card: PURCHASE_MATERIAL_INCOMING_VIEW_TYPE_CARD,
  list: PURCHASE_MATERIAL_INCOMING_VIEW_TYPE_LIST,
};

export const viewTypeIconMap = {
  [PURCHASE_MATERIAL_INCOMING_VIEW_TYPE_CARD]: 'qiapianpailieICON_hui',
  [PURCHASE_MATERIAL_INCOMING_VIEW_TYPE_LIST]: 'liepailieICON_hui',
};

export const viewTypeChineseMap = {
  [PURCHASE_MATERIAL_INCOMING_VIEW_TYPE_CARD]: '卡片',
  [PURCHASE_MATERIAL_INCOMING_VIEW_TYPE_LIST]: '列表',
};

export const ALL_INCOMING_DEFAULT = 0; // 不选择-后端查询默认值
export const ALL_INCOMING_TRUE = 1; // 全部入厂-是
export const ALL_INCOMING_FALSE = 2; // 全部入厂-否

export const AllIncomingMap = {
  [ALL_INCOMING_DEFAULT]: '全部',
  [ALL_INCOMING_TRUE]: '是',
  [ALL_INCOMING_FALSE]: '否',
};

export default 'purchase_order';
