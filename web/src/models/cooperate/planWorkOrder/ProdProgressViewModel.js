import { Dimension } from 'containers/plannedTicket/ProdProgress/constants';

import ProdProgressProcessViewModel from './ProdProgressProcessViewModel.js';
import ProdProgressWOViewModel from './ProdProgressWOViewModel.js';

// export enum DimensionToogle {
//   WORK_ORDER = 'workOrder',
//   PROCESS = 'process',
// }

/**
 *  父子工单相关生产进度信息视图模型
 *
 * @property {String} title 标题
 * @property {{'workOrder' | 'process'}} dimensionToogle 维度切换
 * @property {{ProdProgressWOViewModel | ProdProgressProcessViewModel}} prodProgressData 生产进度信息
 * @function setDimensionToggle 维度变化
 * @class ProdProgressViewModel
 */
export default class ProdProgressViewModel {
  title: String;
  dimensionToggle: String;
  prodProgressData: Array<ProdProgressWOViewModel> | Array<ProdProgressProcessViewModel> = [];

  /**
   * 从后端返回数据中整理数据
   *
   * @param {Array} data
   * @memberof ProdProgressViewModel
   */
  static fromApi(data: Array): ProdProgressViewModel {
    const model = new ProdProgressViewModel();
    const { title, dimensionToggle, prodProgressData } = data || {};
    model.title = title;
    model.dimensionToggle = dimensionToggle || Dimension.WORK_ORDER;
    if (model.dimensionToggle === Dimension.WORK_ORDER) {
      model.prodProgressData = prodProgressData.map(n => ProdProgressWOViewModel.fromApi(n));
    } else {
      model.prodProgressData = prodProgressData.map(n => ProdProgressProcessViewModel.fromApi(n));
    }
    return model;
  }

  /**
   * 更新数据
   *
   * @param {itemName} 字段key
   * @param {itemData} 字段value
   * @memberof ProdProgressViewModel
   */
  updateItem(itemName, itemData): void {
    this[`${itemName}`] = itemData;
  }

  /**
   * 维度变化
   *
   * @param {{'workOrder' | 'process'}} toggle 维度选项
   * @memberof ProdProgressViewModel
   */
  setDimensionToggle(toggle: String): void {
    if (Object.values(Dimension).includes(toggle)) {
      this.dimensionToggle = toggle;
    }
  }
}
