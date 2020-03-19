import React, { Component } from 'react';
import _ from 'lodash';
import PropType from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Row, Col, openModal, Link, Table, ActionButton, Attachment, Tooltip, FormattedMessage } from 'src/components';
import { primary, error, black, border, white, blacklakeGreen, fontSub } from 'src/styles/color';
import PopConfirmForMBom from 'src/containers/mBom/base/popConfirmForMBom';
import moment from 'src/utils/time';
import { replaceSign } from 'src/constants';
import UpdateStatus from 'src/containers/mBom/base/updateMBomStatusPopover';
import { arrayIsEmpty } from 'utils/array';
import { getMBomById } from 'src/services/bom/mbom';
import { FIFO_VALUE_DISPLAY_MAP } from 'views/bom/newProcess/utils';
import {
  useFrozenTime,
  isOrganizationUseQrCode,
  getTaskDeliverableOrganizationConfig,
  configHasSOP,
} from 'src/utils/organizationConfig';
import QcModal from 'components/modal/qcModal';
import LinkToCopyMbom from 'src/views/bom/mBom/baseComponent/linkToCopyMbom';
import LinkToEditMbom from 'src/views/bom/mBom/baseComponent/linkToEditMbom';
import LinkToOperationHistory from 'src/views/bom/mBom/baseComponent/linkToOperationHistory';
import { OUTPUT_FROZEN_CATEGORY } from 'src/views/bom/newProcess/utils';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { formatWorkstationsForMBom } from '../util';
import ProcessRouteGraph from '../base/processRouteGraph';
import { SUCCESSION_MODE_ENUM } from '../base/constant';

type Props = {
  viewer: any,
  match: {
    params: {
      mBomId: string,
    },
  },
};
const colStyle = { marginRight: 60 };
const labelStyle = {
  width: 100,
  marginRight: 10,
  textAlign: 'right',
  paddingRight: 10,
  display: 'inline-block',
  color: fontSub,
};
// TODO:bai 宽度写死会造成的问题
const valueStyle = { width: 200, display: 'inline-block', textAlign: 'left' };
const actionButtonStyle = { background: white, color: blacklakeGreen };
const AttachmentImageView = Attachment.ImageView;

class MBomDetail extends Component {
  props: Props;
  state = {};

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const {
      params: { mBomId },
    } = this.props.match;
    const {
      data: { data },
    } = await getMBomById(mBomId);
    const mBom = formatWorkstationsForMBom(data);

    this.setState({ data: mBom });
  };

  renderProcessListChart = data => {
    return <ProcessRouteGraph value={data} />;
  };

  renderProcessListTable = processList => {
    const data = [];
    processList.forEach(({ name, nodes, inputMaterial, outputMaterial }) => {
      if (nodes && nodes.length > 1) {
        data.push({
          nodeCode: replaceSign,
          process: {
            name,
            workstattions: [],
            fifo: replaceSign,
            productDesc: replaceSign,
            attachments: [],
          },
          inputMaterials: inputMaterial ? [inputMaterial] : [],
          outputMaterial,
        });
      }
      nodes.forEach(n => {
        const item = _.cloneDeep(n);
        item.isParallelProcess = nodes.length > 1 ? name : '否';
        data.push(item);
      });
    });

    const useProduceTaskDeliverable = getTaskDeliverableOrganizationConfig();
    const hasSop = configHasSOP();
    let columns = [
      {
        title: '序号',
        dataIndex: 'nodeCode',
        width: 100,
        fixed: 'left',
        type: 'nodeCode',
      },
      {
        title: '编号／名称',
        dataIndex: 'process',
        fixed: 'left',
        maxWidth: { C: 18 },
        render: process => <Tooltip text={`${[process.code, process.name].join('/') || replaceSign}`} length={15} />,
      },
      {
        title: '工位',
        dataIndex: 'workstations',
        width: { C: 10 },
        render: (_, record) => {
          let workstations = [];
          if (record.workstationGroups && record.workstationGroups.length) {
            workstations = workstations.concat(record.workstationGroups.filter(e => e).map(n => n.name));
          }
          if (record.workstations && record.workstations) {
            workstations = workstations.concat(record.workstations.filter(e => e).map(n => n.name));
          }
          return (
            <Tooltip text={workstations && workstations.length ? workstations.join(', ') : replaceSign} length={20} />
          );
        },
      },
      {
        title: '单次扫码',
        dataIndex: 'process.codeScanNum',
        maxWidth: { C: 5 },
        render: codeScanNum => (
          <FormattedMessage defaultMessage={codeScanNum ? (codeScanNum === 1 ? '是' : '否') : replaceSign} />
        ),
      },
      !hasSop && {
        title: '一码到底',
        dataIndex: 'process.alwaysOneCode',
        maxWidth: { C: 2 },
        render: alwaysOneCode => <FormattedMessage defaultMessage={alwaysOneCode ? '是' : '否'} />,
      },
      {
        title: '用料追溯关系',
        dataIndex: 'process.fifo',
        maxWidth: { C: 5 },
        render: fifo => (
          <FormattedMessage defaultMessage={fifo === replaceSign ? replaceSign : FIFO_VALUE_DISPLAY_MAP[fifo]} />
        ),
      },
      {
        title: '不合格品投产',
        dataIndex: 'process.unqualifiedProducts',
        maxWidth: { C: 3 },
        render: unqualifiedProducts => <FormattedMessage defaultMessage={unqualifiedProducts ? '允许' : '不允许'} />,
      },
      {
        title: '接续方式',
        dataIndex: 'successionMode',
        maxWidth: { C: 8 },
        render: successionMode => <FormattedMessage defaultMessage={SUCCESSION_MODE_ENUM[successionMode]} />,
      },
      {
        title: '准备时间',
        key: 'preparationTime',
        maxWidth: { C: 8 },
        render: (__, record) => {
          const { preparationTime, preparationTimeCategory } = record || {};

          return (
            <div>
              {preparationTime}
              <FormattedMessage defaultMessage={preparationTimeCategory === 0 ? '分钟' : '小时'} />
            </div>
          );
        },
      },
      {
        title: '投入物料',
        dataIndex: 'inputMaterials',
        maxWidth: { C: 15 },
        render: inputMaterials => (
          <Tooltip
            text={
              (inputMaterials &&
                inputMaterials.map(n => n && n.material && `${n.material.code}/${n.material.name}`).join(', ')) ||
              replaceSign
            }
            length={10}
          />
        ),
      },
      {
        title: '产出物料',
        dataIndex: 'outputMaterial.material',
        maxWidth: { C: 15 },
        render: material =>
          material ? <Tooltip text={`${material.code}/${material.name}`} length={10} /> : replaceSign,
      },
    ].filter(n => n);

    if (useProduceTaskDeliverable) {
      columns.push({
        title: '是否审批',
        dataIndex: 'deliverable',
        render: deliverable => {
          return <FormattedMessage defaultMessage={deliverable ? '是' : '否'} />;
        },
      });
    }

    if (useFrozenTime()) {
      columns.push({
        title: '产出是否冻结',
        dataIndex: 'process.outputFrozenCategory',
        render: data => {
          return <FormattedMessage defaultMessage={data === OUTPUT_FROZEN_CATEGORY.frozen.value ? '是' : '否'} />;
        },
      });
    }

    columns = columns.concat([
      {
        title: '次品项列表',
        dataIndex: 'process.processDefects',
        maxWidth: { C: 10 },
        render: defects =>
          defects ? (
            <Tooltip
              text={
                !arrayIsEmpty(defects)
                  ? defects.map(e => _.get(e, 'defect.name') || replaceSign).join(',')
                  : replaceSign
              }
              length={10}
            />
          ) : (
            replaceSign
          ),
      },
      {
        title: '生产描述',
        dataIndex: 'productDesc',
        maxWidth: { C: 15 },
        render: desc => <Tooltip text={desc || replaceSign} length={10} />,
      },
      {
        title: '附件',
        dataIndex: 'attachments',
        maxWidth: { C: 8 },
        render: attachmentFiles => {
          if (attachmentFiles && attachmentFiles.length) {
            return (
              <div
                onClick={() => {
                  openModal({
                    title: '附件',
                    footer: null,
                    children: (
                      <AttachmentImageView
                        attachment={{
                          files: attachmentFiles.map(file => {
                            return {
                              ...file,
                            };
                          }),
                        }}
                      />
                    ),
                  });
                }}
              >
                <Link icon="paper-clip" />
                <span style={{ color: primary, cursor: 'pointer' }}>{attachmentFiles.length}张</span>
              </div>
            );
          }
          return replaceSign;
        },
      },
      {
        title: '质检方案',
        dataIndex: 'qcConfigDetails',
        maxWidth: { C: 8 },
        render: (data, record) => {
          if (Array.isArray(data) && data.length > 0) {
            return <QcModal data={data} />;
          }
          return replaceSign;
        },
      },
    ]);

    const useQrCode = isOrganizationUseQrCode();
    const _columns = columns
      .filter(i => {
        if (
          !useQrCode &&
          i &&
          (i.dataIndex === 'process.codeScanNum' ||
            i.dataIndex === 'process.fifo' ||
            i.dataIndex === 'process.alwaysOneCode')
        ) {
          return null;
        }
        return i;
      })
      .filter(i => i)
      .map(node => ({
        width: 150,
        ...node,
      }));
    return (
      <Table dataSource={data} columns={_columns} rowKey={record => record.id} scroll={{ x: _columns.length * 150 }} />
    );
  };

  renderReleaseState = () => {
    const { data } = this.state;
    const { status, id } = data || {};
    const _display = status === 1 ? '已发布' : '未发布';
    return (
      <div>
        <span style={labelStyle}>{changeChineseToLocaleWithoutIntl('发布状态')}</span>
        <div style={{ display: 'inline-block', width: 200 }}>
          <FormattedMessage
            defaultMessage={_display || replaceSign}
            style={{ ...valueStyle, width: 'auto', paddingRight: 10 }}
          />
          <UpdateStatus
            key={id}
            mBom={data}
            style={{
              color: status === 1 ? error : primary,
              borderRadius: 10,
              padding: '0px 10px',
              cursor: 'pointer',
            }}
            callback={({ status }) => {
              const { data } = this.state;
              data.status = status;
              this.setState({ data });
            }}
          />
        </div>
      </div>
    );
  };

  render() {
    const getFormatDate = timestamp => {
      if (!timestamp) {
        return '';
      }
      return moment(Number(timestamp)).format('YYYY/MM/DD');
    };
    const { data } = this.state;
    if (!data) {
      return null;
    }

    const {
      id,
      materialCode,
      materialName,
      defNum,
      currentUnit,
      material,
      version,
      validFrom,
      validTo,
      processRoutingName,
      bindEBomToProcessRouting,
      ebomVersion,
      processList,
      status,
    } = data;

    return (
      <div style={{ padding: '20px 20px' }}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 30 }}>
          <Col>
            <div style={{ fontSize: 16, color: black }}>{changeChineseToLocaleWithoutIntl('生产BOM详情')}</div>
          </Col>
          <Col>
            <div>
              {status === 1 ? (
                <PopConfirmForMBom text={'已经发布的生产BOM不可编辑，请先停用该生产BOM'}>
                  <LinkToEditMbom disabled icon={'edit'} status={status} id={id} />
                </PopConfirmForMBom>
              ) : (
                <LinkToEditMbom icon={'edit'} status={status} id={id} />
              )}
              <LinkToCopyMbom icon={'copy'} id={id} />
              <LinkToOperationHistory id={id} icon={'bars'} />
            </div>
          </Col>
        </Row>
        <Row style={{ marginBottom: 20 }}>
          <Col style={{ ...colStyle, display: 'flex', alignItems: 'flex-start' }}>
            <span style={labelStyle}>{changeChineseToLocaleWithoutIntl('成品物料编号 / 名称')}</span>
            <span style={valueStyle}>
              <Tooltip text={`${materialCode || replaceSign}/${materialName || replaceSign}`} length={25} />
            </span>
          </Col>
          <Col style={colStyle}>
            <span style={labelStyle}>{changeChineseToLocaleWithoutIntl('数量')}</span>
            <span style={valueStyle}>{defNum}</span>
          </Col>
          <Col style={colStyle}>
            <span style={labelStyle}>{changeChineseToLocaleWithoutIntl('单位')}</span>
            <span style={valueStyle}>{(currentUnit && currentUnit.name) || material.unitName || replaceSign}</span>
          </Col>
        </Row>
        <Row style={{ marginBottom: 20 }}>
          <Col style={colStyle}>
            <span style={labelStyle}>{changeChineseToLocaleWithoutIntl('版本号')}</span>
            <span style={valueStyle}>{version || replaceSign}</span>
          </Col>
          <Col style={colStyle}>{this.renderReleaseState()}</Col>
          <Col style={colStyle}>
            <span style={labelStyle}>{changeChineseToLocaleWithoutIntl('有效期')}</span>
            <span style={valueStyle}>{`${getFormatDate(validFrom)}-${getFormatDate(validTo)}`}</span>
          </Col>
        </Row>
        <Row style={{ marginBottom: 20 }}>
          <Col style={colStyle}>
            <span style={labelStyle}>{changeChineseToLocaleWithoutIntl('工艺路线')}</span>
            <span style={valueStyle}>{processRoutingName || replaceSign}</span>
          </Col>
          <Col style={colStyle}>
            <span style={labelStyle}>{changeChineseToLocaleWithoutIntl('物料清单版本号')}</span>
            <span style={valueStyle}>{ebomVersion || replaceSign}</span>
          </Col>
          <Col style={colStyle}>
            <span style={labelStyle}>{changeChineseToLocaleWithoutIntl('组件分配')}</span>
            <FormattedMessage
              style={valueStyle}
              defaultMessage={ebomVersion ? (bindEBomToProcessRouting ? '是' : '否') : replaceSign}
            />
          </Col>
          <Col style={colStyle} />
        </Row>
        <Row>
          <Col style={{ width: '100%' }}>
            <span style={{ ...labelStyle, display: 'inline-block' }}>
              {changeChineseToLocaleWithoutIntl('工序列表')}
            </span>
            <div
              style={{
                display: 'inline-block',
                verticalAlign: 'top',
                border: `1px solid ${border}`,
                width: 'calc( 100% - 150px )',
              }}
            >
              {this.renderProcessListChart(processList)}
              <div style={{ paddingTop: 20, height: 520, overflow: 'scroll' }}>
                {this.renderProcessListTable(processList)}
              </div>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

MBomDetail.contextTypes = {
  router: PropType.func,
};

export default withRouter(MBomDetail);
