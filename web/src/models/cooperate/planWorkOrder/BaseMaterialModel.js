import { replaceSign } from 'src/constants';

/**
 * 生产物料数据模型
 *
 * @property {String} code 物料编号
 * @property {String} name 物料名称
 * @property {String} desc 物料规格描述
 * @property {String} masterUnit 物料主单位
 * @property {Number} amount 投入或产出用的数量
 */
export default class BaseMaterialModel {
  code: String;
  name: String;
  desc: String;
  amount: Number;
  unitName: String;
  masterUnitName: String;
  //   unitConversions: Array;

  /**
   * 从后端返回数据中整理数据
   *
   * @param {obejct} data
   * @memberof BaseMaterialModel
   */
  static fromJson(data: Object): BaseMaterialModel {
    const model = new BaseMaterialModel();
    const { code, name, unitName, desc, amount, masterUnitName } = data || {};
    model.code = code;
    model.amount = amount;
    model.desc = desc;
    model.name = name;
    model.masterUnitName = masterUnitName;
    model.unitName = unitName;
    return model;
  }

  /**
   * 物料展示
   *
   * @readonly
   * @memberof BaseMaterialModel
   */
  get materialDisplay() {
    if (!this.code && !this.name) return null;
    return `${this.code || replaceSign}/${this.name || replaceSign}`;
  }

  get option(): Object {
    return { key: this.code, label: this.materialDisplay };
  }
}
