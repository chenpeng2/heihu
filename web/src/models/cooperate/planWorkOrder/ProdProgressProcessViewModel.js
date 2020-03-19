import { replaceSign } from 'src/constants';
import { arrayIsEmpty } from 'utils/array';

import BaseMaterialModel from './BaseMaterialModel';

/**
 * 工单相关生产进度数据模型 - 工序维度
 *
 * (工单维度关注的是产出物料的相关生产进度，故该进度都是最后一道工序的进度)
 *
 * @property {Number} workOrderLevel 工单层级
 * @property {String} workOrderCode 工单编号
 * @property {String} processCode 工序编号
 * @property {String} processName 工序名称
 * @property {String} processRouteCode 工艺路线编号
 * @property {String} processRouteName 工艺路线名称
 * @property {Array<BaseMaterialModel>} inputMaterial 投入物料
 * @property {BaseMaterialModel} outputMaterial 产出物料
 * @property {Number} plannedOutputAmount 计划产出数量：工单产出数量
 * @property {Number} scheduledAmount 已排程数量：工单最后一道序排程数量
 * @property {Number} distributedAmount 已下发数量：工单最后一道序下发数量
 * @property {Number} producedAmount 已生产数量：工单最后一道序已产出数量
 * @class ProdProgressWOViewModel
 */

export default class ProdProgressProcessViewModel {
  workOrderLevel: Number;
  workOrderCode: String;
  processSeq: Number;
  processCode: String;
  processName: String;
  inputMaterial: Array<BaseMaterialModel>;
  outputMaterial: BaseMaterialModel;
  plannedOutputAmount: Number;
  scheduledAmount: Number;
  distributedAmount: Number;
  producedAmount: Number;

  /**
   * 从后端返回数据中整理数据
   *
   * @param {obejct} data
   * @memberof ProdProgressProcessViewModel
   */
  static fromApi(data: Object): ProdProgressProcessViewModel {
    const model = new ProdProgressProcessViewModel();
    const {
      workOrderCode,
      level,
      processSeq,
      processCode,
      processName,
      inMaterial,
      outMaterial,
      denominator,
      scheduleNum,
      distributeNum,
      amountQualified,
    } = data || {};
    model.workOrderCode = workOrderCode;
    model.workOrderLevel = level;
    model.processSeq = processSeq;
    model.processCode = processCode;
    model.processName = processName;
    model.plannedOutputAmount = denominator;
    model.scheduledAmount = scheduleNum;
    model.distributedAmount = distributeNum;
    model.producedAmount = amountQualified;
    model.inputMaterial = arrayIsEmpty(inMaterial) ? null : inMaterial.map((m, i) => BaseMaterialModel.fromJson(m));
    model.outputMaterial = BaseMaterialModel.fromJson(outMaterial);
    return model;
  }

  /**
   * 工序展示
   *
   * @readonly
   * @memberof ProdProgressProcessViewModel
   */
  get processSeqAndName() {
    if (!this.processSeq && !this.processName) return null;
    return `${this.processSeq || replaceSign}/${this.processName || replaceSign}`;
  }
}
