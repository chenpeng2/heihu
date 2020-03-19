import { arrayIsEmpty } from 'utils/array';
/** 物料基础信息 */
export default class BaseMaterialModel {
  materialCode: String; // 物料编号
  materialName: String; // 物料名称
  incomingSpecifications: any[]; // 入厂规格
  masterUnit: String; // 主单位
  unitConversions: any[]; // 转换单位
  materialValidTimeUnit: String = 'day'; // 存储有效期单位
  materialValidTime: Number; // 物料定义配置的 存储有效期(天)
  inputFactoryQcConfigs: any[]; // 入厂检质检方案

  init(data): BaseMaterialModel {
    // const { code, name, specifications, unit, unitConversions, validTime, inputFactoryQcConfigs } = data || {};
    // this.materialCode = code;
    // this.materialName = name;
    // this.incomingSpecifications = specifications;
    // this.masterUnit = unit;
    // this.unitConversions = unitConversions;
    // this.inputFactoryQcConfigs = inputFactoryQcConfigs;
    // this.materialValidTime = validTime;
  }

  /** 该物料所有单位名称 */
  get materialUnitNames(): Array<String> {
    const materialUnitNames = arrayIsEmpty(this.unitConversions)
      ? [this.masterUnit]
      : [this.masterUnit].concat(this.unitConversions.map(({ slaveUnitName }) => slaveUnitName));
    return materialUnitNames;
  }
}
