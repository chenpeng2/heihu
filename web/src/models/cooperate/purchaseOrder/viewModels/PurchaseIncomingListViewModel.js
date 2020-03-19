import { arrayIsEmpty } from 'utils/array';
import PurchaseMaterialIncomingModel from '../dataModels/PurchaseMaterialIncomingModel';

// const CONSTANT = 'materialIncomingCard_';

/** 采购清单物料入厂 Card视图 */
export default class PurchaseMaterialIncomingListModel extends PurchaseMaterialIncomingModel {
  /** 是否选中 */
  checked: Boolean = true;
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
  /** */
  /** */
  /** */
  constructor(props) {
    super(props);
    this.init(props);
  }

  init(data): void {
    super.init(data);
    super.setFormInitialValue();
  }
}
