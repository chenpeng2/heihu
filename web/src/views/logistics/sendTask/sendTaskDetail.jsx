import React from 'react';
import { getSendTaskDetail } from 'services/shipment/sendTask';
import { SimpleTable, Link, openModal, Attachment } from 'components';
import { format } from 'utils/time';
import TimeLine from 'components/timeline';
import { getAttachments } from 'services/attachment';
import BigJs from 'big.js';
import { round } from 'utils/number';
import ModifyRecord from '../receiptTask/ModifyRecord';
import Item from '../component/Item';
import styles from '../receiptTask/taskDetail.scss';
import commonStyle from '../index.scss';
import { replaceSign } from '../../../constants';

const AttachmentImageView = Attachment.ImageView;

const TimeLineItem = TimeLine.Item;
const showTypes = [
  'SUBMIT_ENTRANCE_V_INSPECTING',
  'SUBMIT_BEFORE_LOAD_V_INSPECTING',
  'SUBMIT_EXIT_V_INSPECTING',
  'SUBMIT_AFTER_LOAD_V_INSPECTING',
];

class SendTaskDetail extends React.PureComponent<any> {
  state = {
    detailData: {},
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
    const {
      match: {
        params: { id },
      },
    } = props || this.props;
    const {
      data: { data },
    } = await getSendTaskDetail(id);
    this.setState({ detailData: data });
  };

  getMaterialColumns = ({ defaultUnit, type }) => {
    const {
      match: {
        params: { id: taskId },
      },
    } = this.props;
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
                      id={taskId}
                      type="send"
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
              to={`/logistics/send-task/history/send/${record.materialCode}/${id}/${taskId}?materialName=${
                record.materialName
              }&storageName=${record.name}`}
            >
              操作记录
            </Link>
          </div>
        ),
      },
    ];
  };

  showPhoto = async ids => {
    const {
      data: { data },
    } = await getAttachments(ids);
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
    const { detailData } = this.state;
    const {
      match: {
        params: { id },
      },
    } = this.props;
    const {
      logs,
      category,
      step,
      no,
      deliveringCode,
      driver,
      reservedTime,
      plateNo,
      carrier,
      driverTelephone,
      materials,
      packageMaterials,
      purchaseCode,
      customer,
      defaultUnit,
      customerList = [],
      saleCustomerList = [],
    } = detailData || {};
    const { contactName: customerContact, contactPhone: customerPhone, contactAddress: address } = customer || {};
    const taskInfo = [
      { title: '发运类型', value: category },
      { title: '承运商', value: carrier },
      { title: '负载号', value: no },
      { title: '车牌号', value: plateNo },
      { title: '交货单号', value: deliveringCode },
      { title: '司机', value: driver },
      { title: '预约时间', value: reservedTime && format(reservedTime) },
      { title: '司机手机', value: driverTelephone },
      { title: '任务状态', value: step && `${step.step}:${step.showName}` },
      { title: '销售订单', value: purchaseCode },
    ];
    console.log('customerList', customerList);
    const customers = [
      {
        title: '售达客户编号',
        value: saleCustomerList && saleCustomerList.map(({ code }) => code || replaceSign).join('、'),
      },
      {
        title: '送货地址',
        value:
          saleCustomerList && saleCustomerList.map(({ contactAddress }) => contactAddress || replaceSign).join('、'),
      },
      {
        title: '售达客户名称',
        value: saleCustomerList && saleCustomerList.map(({ name }) => name || replaceSign).join('、'),
      },
      { title: '客户联系人', value: customerList.map(({ contactName }) => contactName || replaceSign).join('、') },
      {
        title: '送达客户编号',
        value: customerList && customerList.map(({ code }) => code || replaceSign).join('、'),
      },
      {
        title: '客户电话',
        value: customerList && customerList.map(({ contactPhone }) => contactPhone || replaceSign).join('、'),
      },
      {
        title: '送达客户名称',
        value: customerList && customerList.map(({ name }) => name || replaceSign).join('、'),
      },
    ];
    return (
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
        <Item title="发运物料" style={{ marginBottom: 20 }}>
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
                faultRate,
                attachments,
                planAmount,
                storages,
                damageAmount,
                damageSize,
              }) => {
                const masterUnitAmount = (masterUnitCount * planAmount) / unitCount;
                const otherUnitAmount =
                  otherUnits &&
                  otherUnits.map(({ masterUnitCount, unit, unitCount }) => {
                    const intCount = parseInt((unitCount * masterUnitAmount) / masterUnitCount, 10);
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
                            to={`/logistics/send-broken-log?query=${JSON.stringify({
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
                    </div>
                    <SimpleTable
                      pagination={false}
                      columns={this.getMaterialColumns({ defaultUnit, materialType: 'material' })}
                      style={{ margin: '10px 0' }}
                      dataSource={storages.map(({ code, name, amount, id }) => ({
                        name: `${code}|${name}`,
                        amount: amount || 0,
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
        <Item title="跟进记录" style={{ marginBottom: 20 }}>
          <div>
            <TimeLine>
              {logs &&
                logs.map(({ createdAt, id, operatorName, type, typeName, remark, attachments, snapshotId, color }) => (
                  <TimeLineItem
                    title={
                      <span className={styles.timeline} style={{ color }}>
                        <span>{format(createdAt)}</span>
                        <span>{operatorName}</span>
                        <span>{typeName}</span>
                        {attachments && attachments.length > 0 && (
                          <Link
                            icon="picture"
                            onClick={() => {
                              this.showPhoto(attachments);
                            }}
                          >
                            {attachments.length}
                          </Link>
                        )}
                        <span>
                          {showTypes.includes(type) && (
                            <Link to={`${location.pathname}/check-detail/${snapshotId}`}>详情＞</Link>
                          )}
                        </span>
                        <p style={{ workBreak: 'break-all' }}>{remark}</p>
                      </span>
                    }
                  />
                ))}
            </TimeLine>
          </div>
        </Item>
      </div>
    );
  }
}

export default SendTaskDetail;
