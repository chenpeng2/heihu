import React from 'react';
import { getReceiveTaskDetail } from 'services/shipment/receiptTask';
import { SimpleTable, Link, openModal, Attachment, Spin } from 'components';
import { format } from 'utils/time';
import TimeLine from 'components/timeline';
import _ from 'lodash';
import { round } from 'utils/number';
import BigJs from 'big.js';
import { getAttachments } from 'services/attachment';
import ModifyRecord from './ModifyRecord';
import Item from '../component/Item';
import styles from './taskDetail.scss';
import commonStyle from '../index.scss';

const AttachmentImageView = Attachment.ImageView;

const statusMap = {
  0: '未开始',
  1: '执行中',
  2: '已结束',
  3: '已取消',
};

const TimeLineItem = TimeLine.Item;
const showTypes = [
  'SUBMIT_ENTRANCE_V_INSPECTING',
  'SUBMIT_UNLOAD_V_INSPECTING',
  'SUBMIT_EXIT_V_INSPECTING',
];

const convertBottle = (amount, defaultUnit, materialInfo) => {
  const { masterUnit, masterUnitCount, unitCount, otherUnits } = materialInfo;
  if (defaultUnit === '瓶') {
    return `实收瓶数：${Math.round(amount)} ${defaultUnit}`;
  } else if (masterUnit === '瓶') {
    return `实收瓶数：${Math.round(masterUnitCount * amount / unitCount)} ${masterUnit}`;
  }
  const bottleIndex = _.findIndex(otherUnits, unit => unit.unit === '瓶');
  if (bottleIndex !== -1) {
    const bottleUnit = otherUnits[bottleIndex];
    return `实收瓶数：${Math.round(
      amount * bottleUnit.unitCount / bottleUnit.masterUnitCount / (unitCount / masterUnitCount),
    )} ${bottleUnit.unit}`;
  }
  return `实收数量：${amount} ${defaultUnit}`;
};

class ReceiptTaskDetail extends React.PureComponent<any> {
  state = {
    detailData: {},
    loading: false,
  };

  componentDidMount() {
    this.setInitialData();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      this.setInitialData(nextProps);
    }
  }

  setInitialData = async props => {
    this.setState({ loading: true });
    const { match: { params: { id } } } = props || this.props;
    const { data: { data } } = await getReceiveTaskDetail(id);
    this.setState({ detailData: data, loading: false });
  };

  getMaterialColumns = ({ defaultUnit, type }) => {
    return [
      { title: '库位', dataIndex: 'name', key: 'name' },
      { title: '数量', dataIndex: 'amount', key: 'amount' },
      {
        title: '操作',
        dataIndex: 'id',
        key: 'id',
        render: (id, record) => (
          <div className="child-gap">
            <Link
              onClick={() => {
                openModal({
                  title: '修改收货记录',
                  children: (
                    <ModifyRecord
                      materialType={type}
                      record={record}
                      defaultUnit={defaultUnit}
                      id={this.state.detailData.taskDetail.id}
                      wrappedComponentRef={inst => (this.recordForm = inst)}
                      callback={this.setInitialData}
                    />
                  ),
                  onOk: async () => {
                    await this.recordForm.submit();
                  },
                });
              }}
            >
              修改
            </Link>
            <Link
              to={`/logistics/receipt-task/history/receipt/${record.materialCode}/${id}/${
                this.state.detailData.taskDetail.id
              }?materialName=${record.materialName}&storageName=${record.name}`}
            >
              操作记录
            </Link>
          </div>
        ),
      },
    ];
  };

  getSortColumns = () => {
    return [
      { title: '次数', dataIndex: 'round', key: 'round', render: round => `第${round}次` },
      {
        title: '物料',
        dataIndex: 'materialCode',
        key: 'material',
        render: (materialCode, { materialName }) => `${materialCode}/${materialName}`,
      },
      {
        title: '执行人',
        dataIndex: 'operatorName',
        render: operatorName => operatorName || '-',
        key: 'operatorName',
      },
      { title: '状态', dataIndex: 'status', render: status => statusMap[status], key: 'status' },
      {
        title: '不合格率',
        dataIndex: 'faultRate',
        render: faultRate => `${round(faultRate * 100 || 0, 1)}%`,
        key: 'faultRate',
      },
      {
        title: '操作',
        dataIndex: 'qcTaskcode',
        key: 'qcTaskcode',
        render: qcTaskcode => (
          <Link to={`/qualityManagement/qcTask/detail/${qcTaskcode}`}>查看详情</Link>
        ),
      },
    ];
  };

  showPhoto = async ids => {
    const { data: { data } } = await getAttachments(ids);
    openModal({
      title: '附件',
      footer: null,
      children: (
        <AttachmentImageView
          attachment={{
            files: data.map(file => {
              return {
                ...file,
                originalFileName: file.original_filename,
                originalExtension: file.original_extension,
              };
            }),
          }}
        />
      ),
    });
  };

  render() {
    const { detailData: { taskDetail, sortingPlanTasks, logs }, loading } = this.state;
    const {
      id,
      categoryName,
      step,
      no,
      driver,
      reservedTime,
      plateNo,
      carrier,
      faultRate,
      driverTelephone,
      customer,
      materials,
      packageMaterials,
      deliveringCode,
      defaultUnit,
    } =
      taskDetail || {};
    const { code: customerCode, name: customerName } = customer || {};
    const taskInfo = [
      { title: '收货类型', value: categoryName },
      { title: '任务状态', value: step && `${step.step}:${step.showName}` },
      { title: '负载号', value: no },
      { title: '司机', value: driver },
      { title: '系统票号', value: deliveringCode },
      { title: '预约时间', value: reservedTime && format(reservedTime) },
      { title: '车牌号', value: plateNo },
      { title: '承运商', value: carrier },
      { title: '司机手机', value: driverTelephone },
    ];
    const customers = [
      { title: '客户编号', value: customerCode },
      { title: '客户名称', value: customerName },
    ];
    return (
      <Spin spinning={loading}>
        <div style={{ margin: 20 }}>
          <h1>{id}</h1>
          <Item title="任务信息" style={{ marginBottom: 20 }}>
            <div className={commonStyle.itemList}>
              {taskInfo.map(({ title, value }) => (
                <span key={title} className={commonStyle.item}>
                  <span className={commonStyle.label}>{title}</span> &nbsp;&nbsp;
                  <span className={commonStyle.value}>{value || '-'}</span>
                </span>
              ))}
            </div>
          </Item>
          <Item title="客户信息" style={{ marginBottom: 20 }}>
            <div className={commonStyle.itemList}>
              {customers.map(({ title, value }) => (
                <span key={title} className={commonStyle.item}>
                  <span className={commonStyle.label}>{title}</span> &nbsp;&nbsp;
                  <span className={commonStyle.value}>{value || '-'}</span>
                </span>
              ))}
            </div>
          </Item>
          <Item title="收货物料" style={{ marginBottom: 20 }}>
            {materials &&
              materials.map(
                ({
                  materialInfo: {
                    code: materialCode,
                    name: materialName,
                    masterUnit,
                    masterUnitCount,
                    unitCount,
                    otherUnits,
                  },
                  materialInfo,
                  attachments,
                  // realAmount,
                  planAmount,
                  storages,
                  damageAmount,
                  damageSize,
                }) => {
                  const masterUnitAmount = masterUnitCount * planAmount / unitCount;
                  const otherUnitAmount =
                    otherUnits &&
                    otherUnits.map(({ masterUnitCount, unit, unitCount }) => {
                      const intCount = parseInt(unitCount * masterUnitAmount / masterUnitCount, 10);
                      const restCount = new BigJs(unitCount)
                        .times(masterUnitAmount)
                        .div(masterUnitCount)
                        .minus(intCount)
                        .times(masterUnitCount)
                        .div(unitCount)
                        .round(6)
                        .valueOf();
                      return (
                        <span>
                          {intCount}
                          {unit}
                          {restCount !== '0' ? `-${restCount}${masterUnit}` : null}
                        </span>
                      );
                    });
                  return (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ lineHeight: '17px' }}>
                        <div style={{ height: 30 }}>
                          <h3 style={{ float: 'left' }}>
                            {materialCode}|{materialName}
                          </h3>
                          <span style={{ marginLeft: 20, marginTop: 2 }}>
                            破损记录:&nbsp;
                            <Link
                              to={`/logistics/receipt-broken-log?query=${JSON.stringify({
                                searchTaskId: id,
                                searchMaterialCode: materialCode,
                              })}`}
                            >
                              {damageSize}条记录，{damageAmount}＞
                            </Link>
                          </span>
                          <p style={{ float: 'right' }} className="child-gap">
                            <span>
                              {planAmount} {defaultUnit}
                            </span>
                            {masterUnit !== defaultUnit && (
                              <span>
                                {round(masterUnitAmount, 6)} {masterUnit}
                              </span>
                            )}
                            {otherUnitAmount}
                            {attachments.length > 0 && (
                              <Link
                                icon="picture"
                                onClick={() => {
                                  this.showPhoto(attachments);
                                }}
                              >
                                {attachments.length}
                              </Link>
                            )}
                          </p>
                        </div>
                        {faultRate && (
                          <p>
                            扣减比例：{round(faultRate * 100, 6)} %{' '}
                            {convertBottle(
                              round(planAmount * (1 - faultRate), 1),
                              defaultUnit,
                              materialInfo,
                            )}
                          </p>
                        )}
                      </div>
                      <SimpleTable
                        pagination={false}
                        columns={this.getMaterialColumns({ defaultUnit, type: 'material' })}
                        style={{ margin: '10px 0' }}
                        dataSource={storages.map(({ code, name, amount, id }) => ({
                          name: `${code}|${name}`,
                          amount,
                          id,
                          materialCode,
                          materialName,
                        }))}
                      />
                    </div>
                  );
                },
              )}
          </Item>
          {packageMaterials && packageMaterials.length ? (
            <Item title="载具物料" style={{ marginBottom: 20 }}>
              {packageMaterials &&
                packageMaterials.map(
                  ({
                    materialInfo: {
                      code: materialCode,
                      name: materialName,
                      masterUnit,
                      masterUnitCount,
                      unitCount,
                      otherUnits,
                    },
                    materialInfo,
                    attachments,
                    planAmount,
                    storages,
                  }) => {
                    return (
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ lineHeight: '17px' }}>
                          <div style={{ height: 30 }}>
                            <h3 style={{ float: 'left' }}>
                              {materialCode}|{materialName}
                            </h3>
                            <p style={{ float: 'right' }} className="child-gap">
                              <span>
                                {planAmount} {masterUnit}
                              </span>
                              {attachments.length > 0 && (
                                <Link
                                  icon="picture"
                                  onClick={() => {
                                    this.showPhoto(attachments);
                                  }}
                                >
                                  {attachments.length}
                                </Link>
                              )}
                            </p>
                          </div>
                        </div>
                        <SimpleTable
                          pagination={false}
                          columns={this.getMaterialColumns({
                            defaultUnit: masterUnit,
                            type: 'packageMaterial',
                          })}
                          style={{ margin: '10px 0' }}
                          dataSource={storages
                            .filter(({ amount }) => !!amount)
                            .map(({ code, name, amount, id }) => ({
                              name: `${code}|${name}`,
                              amount,
                              id,
                              materialCode,
                              materialName,
                            }))}
                        />
                      </div>
                    );
                  },
                )}
            </Item>
          ) : null}
          <Item title="收货分拣" style={{ marginBottom: 20 }}>
            <SimpleTable
              columns={this.getSortColumns()}
              dataSource={sortingPlanTasks}
              pagination={false}
            />
          </Item>
          <Item title="跟进记录" style={{ marginBottom: 20 }}>
            <div>
              <TimeLine>
                {logs &&
                  logs.map(
                    ({
                      createdAt,
                      id,
                      operatorName,
                      type,
                      typeName,
                      remark,
                      attachments,
                      snapshotId,
                      color,
                    }) => (
                      <TimeLineItem
                        title={
                          <span className={styles.timeline} style={{ color }}>
                            <span>{format(createdAt)}</span>
                            <span>{operatorName}</span>
                            <span>{typeName}</span>
                            {attachments.length > 0 && (
                              <Link
                                icon="picture"
                                onClick={() => {
                                  this.showPhoto(attachments);
                                }}
                              >
                                {attachments.length}
                              </Link>
                            )}
                            <span style={{ width: 40 }}>
                              {showTypes.includes(type) && (
                                <Link
                                  to={`${location.pathname}/check-detail/${snapshotId}?no=${
                                    no
                                  }&type=receipt`}
                                >
                                  详情＞
                                </Link>
                              )}
                            </span>
                            <p style={{ workBreak: 'break-all' }}>{remark}</p>
                          </span>
                        }
                      />
                    ),
                  )}
              </TimeLine>
            </div>
          </Item>
        </div>
      </Spin>
    );
  }
}

export default ReceiptTaskDetail;
