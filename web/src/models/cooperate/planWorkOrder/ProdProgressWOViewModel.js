import { replaceSign } from 'src/constants';
import BaseMaterialModel from './BaseMaterialModel';

/**
 * 工单相关生产进度数据模型 - 工单维度
 *
 * (工单维度关注的是产出物料的相关生产进度，故该进度都是最后一道工序的进度)
 *
 * @property {Number} workOrderLevel 工单层级
 * @property {String} workOrderCode 工单编号
 * @property {BaseMaterialModel} outputMaterial 产出物料
 * @property {Number} plannedOutputAmount 计划产出数量：工单产出数量
 * @property {Number} scheduledAmount 已排程数量：工单最后一道序排程数量
 * @property {Number} distributedAmount 已下发数量：工单最后一道序下发数量
 * @property {Number} producedAmount 已生产数量：工单最后一道序已产出数量
 * @property {function} fromApi 从后端返回数据中整理数据
 * @class ProdProgressWOViewModel
 */

export default class ProdProgressWOViewModel {
  workOrderLevel: Number;
  workOrderCode: String;
  outputMaterial: BaseMaterialModel;
  plannedOutputAmount: Number;
  scheduledAmount: Number;
  distributedAmount: Number;
  producedAmount: Number;

  /**
   * 从后端返回数据中整理数据
   *
   * @param {Obejct} data
   * @memberof ProdProgressWOViewModel
   */
  static fromApi(data: Object): ProdProgressWOViewModel {
    const model = new ProdProgressWOViewModel();
    const {
      workOrderCode,
      level,
      materialCode,
      materialName,
      materialUnit,
      materialDesc,
      amount,
      scheduleNum,
      distributeNum,
      amountCompleted,
    } = data || {};
    model.workOrderLevel = level;
    model.workOrderCode = workOrderCode;
    model.outputMaterial = BaseMaterialModel.fromJson({
      name: materialName,
      code: materialCode,
      unitName: materialUnit,
      desc: materialDesc,
    });
    model.plannedOutputAmount = amount;
    model.scheduledAmount = scheduleNum;
    model.distributedAmount = distributeNum;
    model.producedAmount = amountCompleted;
    return model;
  }
}
