// 默认为英文，如果有中文和英文，则格式为{E(English):1,C(Chinese):1}
const configFont = {
  startTime: 16,
  endTime: 16,
  date: 16,
  validDate: 22, // 有效时间
  version: 11, // 版本号
  desc: { C: 12 }, // 描述
  operationDate: 22, // 操作日期
  productOrderNo: 11, // 项目号
  amount: { E: 7, C: 4 }, // 数量
  personName: { C: 4 }, // 人员名称
  purchaseOrderNo: 16, // 订单号
  nodeCode: 11, // 序号
  file: { C: 2 }, // 附件
  planNo: 11, // 计划号
  materialCode: 20, // 物料编码
  material: 21, // 物料名称及编码
  materialCategory: { C: 4 }, // 物料类型
  location: { C: 5 }, // 库存位置
  QRCode: 21, // 二维码
  workstationName: { C: 15 }, // 工位名称
  phone: 11, // 手机号
  email: 40, // 邮箱
  roleName: { C: 6 }, // 角色名
  mfgBatchNo: 30, // 批次号
};

const EnglishWidth = 7;
const ChineseWidth = 12;
// 针对单一的配置返回长度
const getSingleColWidth = config => {
  if (typeof config === 'number') {
    return config * EnglishWidth + 20;
  }
  return (config.E || 0) * EnglishWidth + (config.C || 0) * ChineseWidth + 20;
};
// 得到默认的长度配置对象
const getColWidth = config => {
  const configWidth = {};

  Object.keys(config).forEach(key => {
    configWidth[key] = getSingleColWidth(config[key]);
  });
  return configWidth;
};

const defaultColWidth = getColWidth(configFont);
export { getColWidth, defaultColWidth, getSingleColWidth };
export default 'dummy';
