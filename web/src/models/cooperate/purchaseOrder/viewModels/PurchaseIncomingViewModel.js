import PurchaseMaterialIncomingModel from '../dataModels/PurchaseMaterialIncomingModel';
import { PURCHASE_MATERIAL_INCOMING_VIEW_TYPE_CARD } from '../../../../views/cooperate/purchase_list/constants';

/** 采购清单物料入厂 内容视图 */
export default class PurchaseMaterialIncomingListModel {
  /** 总数 */
  total: Number = 0;
  /** 已选项数 */
  checkedNum: Number = 0;
  /** 物料入厂信息 */
  data: Array<any>;
  /** 视图类型 */
  viewType: Number = PURCHASE_MATERIAL_INCOMING_VIEW_TYPE_CARD;
  /** */
  /** */
  /** */
  /** */
  /** */
  /** */
  /** */
  /** */
  /** */
  /** */
  /** */
  /** */
  /** */
  constructor(props) {
    this.init(props);
  }

  init(data): void {
    const { total } = data || {};
    this.total = total || 0;
    this.checkedNum = total || 0;
    this.viewType = PURCHASE_MATERIAL_INCOMING_VIEW_TYPE_CARD;
  }

  updateViewType(type: Number): void {
    this.viewType = type;
  }
}
