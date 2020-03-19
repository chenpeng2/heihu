export const intervals = [
  {
    value: '6',
    label: '按天',
  },
  {
    value: '7',
    label: '按周',
  },
  {
    value: '8',
    label: '按月',
  },
  {
    value: '9',
    label: '按季度',
  },
];

const workStationOEE = [
  {
    value: '1',
    label: '时间稼动率',
    dataIndex: 'timeOperationRate',
  },
  {
    value: '2',
    label: '性能稼动率',
    dataIndex: 'performanceOperationRate',
  },
  {
    value: '3',
    label: '良率',
    dataIndex: 'standardRate',
  },
  {
    value: '4',
    label: 'OEE',
    dataIndex: 'oeeRate',
  },
];
const workStationBurden = [
  // {
  //   value: '4',
  //   label: '日历工作时间',
  // },
  {
    value: '1',
    label: '计划工作时间',
    dataIndex: 'producePlannedWorkTime',
  },
  {
    value: '2',
    label: '负荷工作时间',
    dataIndex: 'payloadTime',
  },
  {
    value: '3',
    label: '有效工作时间',
    dataIndex: 'effectTime',
  },
];
const workStationCapacityLoss = [
  {
    value: '1',
    label: '计划性停机',
    dataIndex: 'plannedPauseTime',
  },
  {
    value: '2',
    label: '设备故障停机',
    dataIndex: 'devicePauseTime',
  },
  {
    value: '3',
    label: '换装调机停机',
    dataIndex: 'reloadPauseTime',
  },
  {
    value: '4',
    label: '暂时性停机',
    dataIndex: 'temporaryPauseTime',
  },
  {
    value: '5',
    label: '降速损失',
    dataIndex: 'speedLossTime',
  },
  {
    value: '6',
    label: '次品损失',
    dataIndex: 'defectTime',
  },
];

export const groupBy = [
  {
    key: 'BURDEN',
    display: '工位负荷',
    showDataCategory: workStationBurden,
  },
  {
    key: 'CAPACITYLOSS',
    display: '工位产能损失',
    showDataCategory: workStationCapacityLoss,
  },
  {
    key: 'OEE',
    display: '工位OEE',
    showDataCategory: workStationOEE,
  },
];
