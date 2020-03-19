import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import moment from 'utils/time';
import { Spin } from 'antd';
import {
  queryHoldRecordDetail,
  queryUseRecordDetail,
  queryScanUnqualifiedHoldRecordDetail,
  queryScanUnqualifiedRawMaterialRecordDetail,
  queryScanByProductUnqualifiedOutput,
  queryScanByProductOutput,
} from 'src/services/cooperate/prodTask';
import { getPathname } from 'src/routes/getRouteParams';
import { arrayIsEmpty } from 'utils/array';
import { DetailPageItemContainer, Row, Col, RestPagingTable, Attachment, Link, Tooltip, SimpleTable } from 'components';
import { white } from 'src/styles/color/index';
import { replaceSign } from 'src/constants';

const itemContainerStyle = {
  padding: '0 20px',
  marginTop: 10,
};

type Props = {
  location: {
    pathname: string,
    query: {},
  },
  match: {
    params: {
      recordId: string,
    },
  },
};

class RecordDetail extends Component {
  props: Props;
  state = {
    loading: false,
    data: null,
  };

  componentDidMount() {
    const {
      match: {
        params: { recordId },
      },
      match,
    } = this.props;
    const pathname = getPathname(match).split('/')[5];
    const recordType = pathname.slice(0, pathname.indexOf('RecordDetail'));
    let queryRecordDetail = null;
    switch (recordType) {
      case 'use':
        queryRecordDetail = queryUseRecordDetail;
        break;
      case 'hold':
        queryRecordDetail = queryHoldRecordDetail;
        break;
      case 'unqualifiedUse':
        queryRecordDetail = queryScanUnqualifiedRawMaterialRecordDetail;
        break;
      case 'unqualifiedHold':
        queryRecordDetail = queryScanUnqualifiedHoldRecordDetail;
        break;
      case 'byProductUnqualifiedOutput':
        queryRecordDetail = queryScanByProductUnqualifiedOutput;
        break;
      case 'byProductOutput':
        queryRecordDetail = queryScanByProductOutput;
        break;
      default:
        queryRecordDetail = null;
    }
    this.setState({ loading: true });
    queryRecordDetail(recordId)
      .then(res => {
        this.setState({ data: res.data.data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  // 显示物料信息
  showMaterial = data => {
    const {
      material: { code, name, desc },
    } = data;
    const { changeChineseToLocale } = this.context;
    const itemHeaderTitle = changeChineseToLocale('物料信息');
    const {
      location: { query },
    } = this.props;

    return (
      <div style={{ ...itemContainerStyle, marginTop: 20 }}>
        <DetailPageItemContainer itemHeaderTitle={itemHeaderTitle}>
          <div>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{changeChineseToLocale('物料编码')}</Col>
              <Col type={'content'}>{code || replaceSign}</Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{changeChineseToLocale('物料名称')}</Col>
              <Col type={'content'} style={{ display: 'flex', flex: 1 }}>
                {name || replaceSign}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{changeChineseToLocale('规格描述')}</Col>
              <Col type={'content'} style={{ display: 'flex', flex: 1 }}>
                {desc || replaceSign}
              </Col>
            </Row>
          </div>
        </DetailPageItemContainer>
      </div>
    );
  };

  showMaterialQRCode = data => {
    const {
      material: { code, name, unit, desc },
      amountTransact,
      amountAfter,
      amountDiff,
      amountRemaining,
      qcStatus,
      code: qrCode,
      operator,
      createdAt,
      workstation,
      processName,
      projectCode,
      producers,
      reporter,
      type,
      workgroup,
      materialLotId,
      inboundBatch,
      productBatch,
    } = data;
    const { changeChineseToLocale } = this.context;
    const reportType = _.get(this.props, 'location.query.reportType', '');
    const recordType = _.get(this.props, 'location.query.recordType', '');
    const isUnqualified = recordType.indexOf('unqualified') !== -1;
    const isUse = recordType.toLowerCase().indexOf('use') !== -1;
    let qcStatusDisplay = '';
    if (qcStatus) {
      switch (qcStatus) {
        case 1:
          qcStatusDisplay = '合格';
          break;
        case 2:
          qcStatusDisplay = '让步合格';
          break;
        case 3:
          qcStatusDisplay = '待检';
          break;
        case 4:
          qcStatusDisplay = '不合格';
          break;
        default:
          qcStatusDisplay = '不合格';
      }
    }
    const list = [
      {
        label: isUse ? changeChineseToLocale('投产数量') : changeChineseToLocale('产出数量'),
        value: `${isUnqualified ? amountDiff : amountTransact} ${unit || ''}`,
      },
      {
        label: changeChineseToLocale('总计数量'),
        value: `${isUnqualified ? amountRemaining : amountAfter} ${unit || ''}`,
      },
      {
        label: changeChineseToLocale('二维码'),
        value: <Link to={`/stock/material-trace/${materialLotId}/qrCodeDetail`}>{qrCode}</Link>,
      },
      { label: changeChineseToLocale('质量状态'), value: qcStatusDisplay },
      productBatch ? { label: changeChineseToLocale('生产批次'), value: productBatch } : undefined,
      inboundBatch ? { label: changeChineseToLocale('入厂批次'), value: inboundBatch } : undefined,
      isUnqualified
        ? {
            label: changeChineseToLocale('操作类型'),
            value: type === 1 ? changeChineseToLocale('入库') : changeChineseToLocale('标记'),
          }
        : undefined,
      (reportType === 'true' && recordType === 'hold') || recordType === 'unqualifiedHold'
        ? {
            label: changeChineseToLocale('生产人员'),
            value: producers && producers.length ? producers.map(n => n.name).join('，') : replaceSign,
          }
        : undefined,
      { label: changeChineseToLocale('生产组'), value: workgroup ? workgroup.name : replaceSign },
      {
        label: changeChineseToLocale('报工人员'),
        value: (operator && operator.name) || (reporter && reporter.name) || replaceSign,
      },
      { label: changeChineseToLocale('报工时间'), value: moment(Number(createdAt)).format('YYYY/MM/DD HH:mm') },
      { label: changeChineseToLocale('项目号'), value: projectCode },
      { label: changeChineseToLocale('工序名称'), value: processName },
      { label: changeChineseToLocale('生产工位'), value: (workstation && workstation.name) || replaceSign },
    ].filter(n => n);
    return (
      <div style={{ ...itemContainerStyle, marginTop: 20 }}>
        <DetailPageItemContainer itemHeaderTitle={changeChineseToLocale('物料二维码信息')}>
          <div>
            {list.map(({ label, value }) => (
              <Row style={{ marginRight: 40 }} key={label}>
                <Col type="title">{label}</Col>
                <Col type="content">{value}</Col>
              </Row>
            ))}
          </div>
        </DetailPageItemContainer>
      </div>
    );
  };

  // 从data中整理设备&模具信息
  getDeviceAndMould = equipments => {
    const devices = [];
    const moulds = [];
    if (equipments && equipments.length > 0) {
      equipments.forEach(({ entity, boundMoulds }) => {
        if (entity) devices.push(entity);
        if (boundMoulds && boundMoulds.length > 0) boundMoulds.map(x => moulds.push(x));
      });
    }
    return { devices, moulds };
  };

  // 设备信息columns
  getDeviceColumns = () => {
    const { router, changeChineseToLocale } = this.context;
    return [
      {
        title: changeChineseToLocale('设备类型'),
        dataIndex: 'category.name',
        key: 'category.name',
        render: (name, record) => (name ? <Tooltip text={name} length={19} /> : replaceSign),
      },
      {
        title: changeChineseToLocale('设备编码'),
        dataIndex: 'code',
        key: 'code',
        render: (code, record) => (code ? <Tooltip text={code} length={18} /> : replaceSign),
      },
      {
        title: changeChineseToLocale('设备名称'),
        dataIndex: 'name',
        key: 'name',
        render: (name, record) => (name ? <Tooltip text={name} length={19} /> : replaceSign),
      },
      {
        title: changeChineseToLocale('电子标签二维码'),
        dataIndex: 'qrcode',
        key: 'qrcode',
        render: (qrcode, record) => (qrcode ? <Tooltip text={qrcode} length={18} /> : replaceSign),
      },
      {
        title: changeChineseToLocale('操作'),
        dataIndex: 'id',
        key: 'id',
        width: 100,
        render: (id, record) =>
          id ? (
            <Link onClick={() => this.context.router.history.push(`/equipmentMaintenance/device/detail/device/${id}`)}>
              {changeChineseToLocale('查看')}
            </Link>
          ) : (
            replaceSign
          ),
      },
    ];
  };

  // 模具信息columns
  getMouldColumns = () => {
    const { router, changeChineseToLocale } = this.context;
    return [
      {
        title: changeChineseToLocale('模具类型'),
        dataIndex: 'mouldCategoryName',
        key: 'mouldCategoryName',
        render: (name, record) => (name ? <Tooltip text={name} length={19} /> : replaceSign),
      },
      {
        title: changeChineseToLocale('模具编码'),
        dataIndex: 'mouldCode',
        key: 'mouldCode',
        render: (code, record) => (code ? <Tooltip text={code} length={18} /> : replaceSign),
      },
      {
        title: changeChineseToLocale('模具名称'),
        dataIndex: 'mouldName',
        key: 'mouldName',
        render: (name, record) => (name ? <Tooltip text={name} length={19} /> : replaceSign),
      },
      {
        title: changeChineseToLocale('电子标签二维码'),
        dataIndex: 'mouldQrcode',
        key: 'mouldQrcode',
        render: (qrcode, record) => (qrcode ? <Tooltip text={qrcode} length={18} /> : replaceSign),
      },
      {
        title: changeChineseToLocale('操作'),
        dataIndex: 'mouldId',
        key: 'mouldId',
        width: 100,
        render: (id, record) =>
          id ? (
            <Link onClick={() => this.context.router.history.push(`/equipmentMaintenance/mould/detail/${id}`)}>
              {changeChineseToLocale('查看')}
            </Link>
          ) : (
            replaceSign
          ),
      },
    ];
  };

  // 显示生产用料
  showProduceMaterial = data => {
    const { inputMaterial, rawMaterialLots, code } = data;
    const { changeChineseToLocale } = this.context;
    const itemHeaderTitle = changeChineseToLocale('生产用料');
    const materials = [];
    rawMaterialLots.forEach(rawMaterialLotsNode => {
      const { code, id, inboundBatch, materialCode, materialName } = rawMaterialLotsNode;
      const findSameMaterialIndex = materials.findIndex(node => node.materialCode === materialCode);
      if (findSameMaterialIndex !== -1) {
        materials[findSameMaterialIndex].nodes = [...materials[findSameMaterialIndex].nodes, rawMaterialLotsNode];
      } else {
        materials.push({ materialCode, nodes: [rawMaterialLotsNode] });
      }
    });

    return (
      <div style={{ ...itemContainerStyle, marginTop: 10 }}>
        <DetailPageItemContainer itemHeaderTitle={itemHeaderTitle}>
          <div style={{ padding: '10px', width: '100%' }}>
            {materials.map(dataSource => {
              const { materialName, materialCode } = dataSource.nodes[0];
              const columns = [
                {
                  title: `${materialName}/${materialCode}`,
                  key: 'id',
                  dataIndex: 'id',
                  render: (id, { code, inboundBatch, productBatch }) => (
                    <Link to={`/stock/material-trace/${id}/qrCodeDetail`}>
                      {code}|{inboundBatch || productBatch || replaceSign}
                    </Link>
                  ),
                },
              ];
              return (
                <SimpleTable
                  columns={columns}
                  dataSource={dataSource.nodes}
                  rowKey="id"
                  pagination={false}
                  style={{ width: '100%', margin: 0, marginBottom: 10 }}
                />
              );
            })}
          </div>
        </DetailPageItemContainer>
      </div>
    );
  };

  // 显示供应商批次号
  showMfgBatchNo = data => {
    const { changeChineseToLocale } = this.context;
    if (!arrayIsEmpty(data.mfgBatches)) {
      const { mfgBatches } = data;
      const itemHeaderTitle = changeChineseToLocale('原料批次');
      const renders = [];
      mfgBatches.forEach(({ materialCode, mfgBatchNo }) => {
        const findMfgBatchIndex = renders.findIndex(node => node.materialCode === materialCode);
        if (findMfgBatchIndex !== -1) {
          renders[findMfgBatchIndex].mfgBatchNoes = [...renders[findMfgBatchIndex].mfgBatchNoes, mfgBatchNo];
        } else {
          renders.push({ materialCode, mfgBatchNoes: [mfgBatchNo] });
        }
      });
      return (
        <div style={{ ...itemContainerStyle, marginTop: 10 }}>
          <DetailPageItemContainer itemHeaderTitle={itemHeaderTitle}>
            <div>
              {renders.map(({ materialCode, mfgBatchNoes }) => {
                return (
                  <Row key={materialCode}>
                    <Col style={{ wordBreak: 'break-word' }} type={'title'}>
                      {materialCode || replaceSign}
                    </Col>
                    <Col type={'content'} style={{ display: 'flex', flex: 1 }}>
                      {mfgBatchNoes.join('，') || replaceSign}
                    </Col>
                  </Row>
                );
              })}
            </div>
          </DetailPageItemContainer>
        </div>
      );
    }
    return null;
  };

  // 显示产前物料信息
  showBeforeProductionMaterial = data => {
    const { changeChineseToLocale } = this.context;
    if (data.inputMaterial) {
      const { materialName, materialDesc, materialCode, amount, unit } = data.inputMaterial;
      const itemHeaderTitle = changeChineseToLocale('产前物料');

      return (
        <div style={{ ...itemContainerStyle, marginTop: 20 }}>
          <DetailPageItemContainer itemHeaderTitle={itemHeaderTitle}>
            <div>
              <Row style={{ marginRight: 40 }}>
                <Col type={'title'}>{changeChineseToLocale('物料编码')}</Col>
                <Col type={'content'}>{materialCode || replaceSign}</Col>
              </Row>
              <Row style={{ marginRight: 40 }}>
                <Col type={'title'}>{changeChineseToLocale('物料名称')}</Col>
                <Col type={'content'} style={{ display: 'flex', flex: 1 }}>
                  {materialName || replaceSign}
                </Col>
              </Row>
              <Row>
                <Col type={'title'}>{changeChineseToLocale('规格描述')}</Col>
                <Col type={'content'} style={{ display: 'flex', flex: 1 }}>
                  {materialDesc || replaceSign}
                </Col>
              </Row>
              <Row style={{ marginRight: 40 }}>
                <Col type={'title'}>{changeChineseToLocale('产前数量')}</Col>
                <Col type={'content'}>{`${amount} ${unit || ''}`}</Col>
              </Row>
            </div>
          </DetailPageItemContainer>
        </div>
      );
    }
    return null;
  };

  // 显示上传照片
  uploadPhoto = data => {
    const { changeChineseToLocale } = this.context;
    const itemHeaderTitle = changeChineseToLocale('上传照片');
    const attachment = {};
    attachment.files = data.attachments.map(attachment => {
      const _attachment = {
        originalExtension: attachment.original_extension,
        originalFileName: attachment.original_filename,
        uri: attachment.uri,
        id: attachment.id,
      };
      return _attachment;
    });

    return (
      <div style={{ ...itemContainerStyle, marginTop: 10 }}>
        <DetailPageItemContainer itemHeaderTitle={itemHeaderTitle}>
          <Attachment.ImageView
            wrapperStyle={{ padding: '10px 0 10px' }}
            actionStyle={{ backgroundColor: white }}
            attachment={attachment}
          />
        </DetailPageItemContainer>
      </div>
    );
  };

  // 显示设备&模具信息
  showDeviceAndMould = data => {
    const { devices, moulds } = data || {};
    const { changeChineseToLocale } = this.context;
    const itemHeaderTitle = changeChineseToLocale('设备&模具信息');
    const deviceColumns = this.getDeviceColumns();
    const mouldColumns = this.getMouldColumns();

    return (
      <div style={{ ...itemContainerStyle, marginTop: 10 }}>
        <DetailPageItemContainer contentStyle={{ width: '100%', paddingRight: 20 }} itemHeaderTitle={itemHeaderTitle}>
          <div style={{ margin: '10px -20px' }}>
            {/* { _.get(equipments, 'entity.length') > 0 ? */}
            <RestPagingTable
              bordered
              dataSource={devices}
              rowKey={record => record.id}
              columns={deviceColumns}
              pagination={false}
            />
          </div>
          <div style={{ margin: '10px -20px' }}>
            {/* { _.get(equipments, 'boundModules.length') > 0 ? */}
            <RestPagingTable
              bordered
              dataSource={moulds}
              rowKey={record => record.mouldId}
              columns={mouldColumns}
              pagination={false}
            />
          </div>
        </DetailPageItemContainer>
      </div>
    );
  };

  // 显示备注
  showRemark(data) {
    const { changeChineseToLocale } = this.context;
    const itemHeaderTitle = changeChineseToLocale('备注');

    if (data && data.remark) {
      return (
        <div style={{ ...itemContainerStyle, marginTop: 10 }}>
          <DetailPageItemContainer contentStyle={{ width: '100%', paddingRight: 20 }} itemHeaderTitle={itemHeaderTitle}>
            <div style={{ margin: '10px 0' }}>{data.remark}</div>
          </DetailPageItemContainer>
        </div>
      );
    }

    return null;
  }

  render() {
    const { data, loading } = this.state;
    if (!data) {
      return null;
    }
    const deviceAndMould = this.getDeviceAndMould(data && data.equipments);
    const {
      location: { query },
    } = this.props;
    const { useQrCode } = query;

    return (
      <Spin spinning={loading}>
        <div style={{ marginBottom: 30 }}>
          {this.showMaterial(data)}
          {this.showMaterialQRCode(data)}
          {useQrCode === 'true' && (
            <React.Fragment>
              {this.showProduceMaterial(data)}
              {this.showMfgBatchNo(data)}
              {this.showBeforeProductionMaterial(data)}
            </React.Fragment>
          )}
          {this.showDeviceAndMould(deviceAndMould)}
          {data.attachments && data.attachments.length ? this.uploadPhoto(data) : null}
          {this.showRemark(data)}
        </div>
      </Spin>
    );
  }
}

RecordDetail.contextTypes = {
  router: PropTypes.object,
  changeChineseToLocale: PropTypes.any,
};

export default withRouter(RecordDetail);
