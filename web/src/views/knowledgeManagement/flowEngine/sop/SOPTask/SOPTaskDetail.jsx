import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Table } from 'antd';
import PropTypes from 'prop-types';
import moment, { formatUnix } from 'utils/time';
import { getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';
import { getProject } from 'src/services/cooperate/project';
import { getBasicMbomInfo } from 'src/services/bom/mbom';
import { getSOPTaskDetail } from 'services/knowledgeBase/sop';
import { blacklakeGreen, white, fontSub } from 'src/styles/color/index';
import _ from 'lodash';
import { replaceSign } from 'src/constants';
import { Icon, ActionButton, Row, Col, Spin, Drawer, Link, DetailPageItemContainer } from 'components';
import UseAndHoldRecord from 'containers/task/produceTask/detail/useAndHoldRecord';
import CONSTANT from '../../common/SOPTaskConstant';

type Props = {
  match: {
    params: {
      taskId: string,
    },
  },
};
const itemContainerStyle = {
  padding: '0 20px',
  marginTop: 20,
};

class ProdTaskDetail extends Component {
  props: Props;
  state = {
    data: null,
    project: null,
    mBom: null,
    taskDispatchType: null,
    useQrCode: null,
    recordType: null,
    reportTypeValue: null,
    loading: false,
    showDrawer: false,
    material: {},
    taskDetail: null,
    produceTaskId: '',
  };

  componentWillMount() {
    const config = getOrganizationConfigFromLocalStorage();
    const taskDispatchType = config.config_task_dispatch_type.configValue;
    const useQrCode = config.config_use_qrcode.configValue;
    const reportType = config.config_group_leader_report;
    const reportTypeValue = reportType ? reportType.configValue : false;
    this.setState({ taskDispatchType, reportTypeValue, useQrCode });
  }

  componentDidMount() {
    this.setData();
  }

  setData = async () => {
    const taskId = this.props.match.params.taskId;
    this.setState({ loading: true });
    const {
      data: { data: taskDetail },
    } = await getSOPTaskDetail(taskId);
    const { projectCode } = taskDetail;
    const {
      data: { data: project },
    } = await getProject({ code: projectCode });
    const { mbomVersion, product } = project;
    if (mbomVersion) {
      const {
        data: { data },
      } = await getBasicMbomInfo({ code: product.code, version: mbomVersion });
      this.setState({ mBom: data });
    }
    this.setState({ taskDetail, loading: false, project });
    // .then(res => {
    //   const { data } = res;
    //   const { projectCode } = data.data;
    //   this.setState({ data });
    //   getProject({ code: projectCode }).then(res => {
    //     const { data } = res;
    //     const { product, mbomVersion } = data.data;
    //     this.setState({ project: data });
    //     if (mbomVersion) {
    //       getBasicMbomInfo({ code: product.code, version: mbomVersion }).then(res => {
    //         this.setState({ mBom: res.data });
    //       });
    //     }
    //   });
    // })
    // .finally(() => {
    //   this.setState({ loading: false });
    // });
  };

  getHeader = () => {
    const {
      taskDetail: { taskCode, createAt, status, creator },
    } = this.state;
    const {
      match: {
        params: { taskId },
      },
    } = this.props;
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 30px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 20 }}>{taskCode}</span>
          <span style={{ fontSize: 12, marginLeft: 20, color: fontSub }}>
            创建人：{creator ? creator.name : replaceSign}
          </span>
          <span style={{ fontSize: 12, marginLeft: 20, color: fontSub }}>创建时间：{formatUnix(createAt)}</span>
        </div>
        <div className="child-gap">
          <Link icon="bars" to={`/cooperate/SOPTask/detail/${taskId}/record-result?taskCode=${taskCode}`}>
            查看记录结果
          </Link>
          <Link icon="bars" to={`/cooperate/SOPTask/detail/${taskId}/log`}>
            查看操作记录
          </Link>
        </div>
      </div>
    );
  };

  getSOPTaskInfo = () => {
    const data = this.state.taskDetail;
    if (!data) {
      return null;
    }
    const {
      id,
      taskCode,
      operators,
      status,
      processName,
      processCode,
      processSeq,
      startTimePlanned,
      endTimePlanned,
      startTimeReal,
      endTimeReal,
      showProcessSeq,
      workstation,
      operatorGroup,
    } = data;

    const itemHeaderTitle = '任务信息';
    const { taskDispatchType } = this.state;
    return (
      <div style={{ ...itemContainerStyle, marginTop: 0 }}>
        <DetailPageItemContainer itemHeaderTitle={itemHeaderTitle}>
          <div>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{'任务编号'}</Col>
              <Col type={'content'}>{taskCode || replaceSign}</Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{'任务号'}</Col>
              <Col type={'content'} style={{ display: 'flex', flex: 1 }}>
                {id || replaceSign}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{'执行人'}</Col>
              <Col type={'content'} style={{ display: 'flex', flex: 1 }}>
                {operatorGroup
                  ? operatorGroup.name
                  : operators.length > 0
                  ? operators.map(operator => operator.name).join('，')
                  : replaceSign}
              </Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{'任务状态'}</Col>
              <Col type={'content'}>{CONSTANT.SOPTaskStatus.get(status)}</Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{'工序'}</Col>
              <Col type={'content'}>
                {showProcessSeq ? `${processSeq || replaceSign}/` : null}
                {`${processCode || replaceSign}/${processName || replaceSign}`}
              </Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{'工位'}</Col>
              <Col type={'content'}>{workstation ? workstation.name : replaceSign}</Col>
            </Row>
            {taskDispatchType === 'manager' ? (
              <Row style={{ marginRight: 40 }}>
                <Col type={'title'}>{'计划开始结束时间'}</Col>
                <Col type={'content'}>
                  {`${moment(Number(startTimePlanned)).format('YYYY/MM/DD HH:mm')} ~ ${moment(
                    Number(endTimePlanned),
                  ).format('YYYY/MM/DD HH:mm')}`}
                </Col>
              </Row>
            ) : null}
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{'实际开始结束时间'}</Col>
              <Col type={'content'}>{this.getRealStartTimeAndEndTime(startTimeReal, endTimeReal)}</Col>
            </Row>
          </div>
        </DetailPageItemContainer>
      </div>
    );
  };

  getInputMaterialTable = data => {
    const columns = [
      {
        title: '投产物料',
        dataIndex: 'materialCode',
        width: 400,
        key: 'material',
        render: (materialCode, record) => {
          const { materialName } = record;
          return (
            <div>
              {materialCode === 0 ? '0/' : materialCode ? `${materialCode}/` : ''}
              {materialName || replaceSign}
            </div>
          );
        },
      },
      {
        title: '实际投产数量',
        dataIndex: 'amount',
        width: 400,
        key: 'amount',
        render: (amount, record) => (
          <div>
            {record.amount}
            {record.unit}
          </div>
        ),
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => (
          <div>
            <Link
              onClick={() => {
                const { materialCode, materialName } = record;
                this.onHandleClick({ materialCode, materialName }, 'unqualifiedUse');
              }}
            >
              不合格记录
            </Link>
            <Link
              onClick={() => {
                const { materialCode, materialName } = record;
                this.onHandleClick({ materialCode, materialName }, 'use');
              }}
              style={{ marginLeft: 20 }}
              disabled={!record.materialName}
            >
              投产记录
            </Link>
          </div>
        ),
      },
    ];
    return (
      <div
        style={{
          width: '100%',
          borderTop: '1px solid rgb(234, 236, 241)',
          borderLeft: '1px solid rgb(234, 236, 241)',
          borderRight: '1px solid rgb(234, 236, 241)',
        }}
      >
        <Table pagination={false} columns={columns} dataSource={data.inputMaterialsReal} />
      </div>
    );
  };

  getOutputMaterialTable = data => {
    console.log('data', data);
    const columns = [
      {
        title: '产出物料',
        dataIndex: 'outMaterialReal',
        width: 400,
        key: 'outMaterialReal',
        render: outMaterialReal => {
          const { materialCode, materialName } = outMaterialReal;
          return (
            <div>
              {materialCode === 0 ? '0/' : materialCode ? `${materialCode}/` : ''}
              {materialName || replaceSign}
            </div>
          );
        },
      },
      {
        title: '实际产出数量',
        dataIndex: 'outMaterialPlanned',
        width: 400,
        key: 'material',
        render: (outMaterialPlanned, record) => {
          const { outMaterialReal } = record;
          return (
            <div>
              {outMaterialReal.amount || replaceSign}
              {outMaterialReal.unit}
            </div>
          );
        },
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => {
          const {
            outMaterialReal: { materialName, materialCode },
          } = record;
          return (
            <div>
              <Link
                onClick={() => {
                  this.onHandleClick({ materialCode, materialName }, 'unqualifiedHold');
                }}
              >
                不合格记录
              </Link>
              <Link
                style={{ marginLeft: 20 }}
                disabled={!materialName}
                onClick={() => {
                  this.onHandleClick({ materialCode, materialName }, 'hold');
                }}
              >
                产出记录
              </Link>
            </div>
          );
        },
      },
    ];
    return (
      <div
        style={{
          width: '100%',
          borderLeft: '1px solid rgb(234, 236, 241)',
          borderRight: '1px solid rgb(234, 236, 241)',
        }}
      >
        <Table columns={columns} dataSource={data.outMaterialReal ? [data] : []} pagination={false} />
      </div>
    );
  };

  getProdDetail = data => {
    const itemHeaderTitle = '生产详情';
    return (
      <div style={itemContainerStyle}>
        <DetailPageItemContainer contentStyle={{ width: '100%', padding: 20 }} itemHeaderTitle={itemHeaderTitle}>
          {this.getInputMaterialTable(data)}
          {this.getOutputMaterialTable(data)}
        </DetailPageItemContainer>
      </div>
    );
  };

  getProjectInfo = projectCode => {
    const { project, mBom } = this.state;
    const itemHeaderTitle = '项目信息';
    if (!project) {
      return null;
    }
    const { product, status, purchaseOrder, processRouting, mbomVersion, startTimePlanned, endTimePlanned } = project;
    const purchaseOrderCode = (purchaseOrder && purchaseOrder.purchaseOrderCode) || '';

    return (
      <div style={{ ...itemContainerStyle, marginTop: 10 }}>
        <DetailPageItemContainer itemHeaderTitle={itemHeaderTitle}>
          <div>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{'项目编号'}</Col>
              <Col type={'content'}>
                <Link
                  onClick={() => {
                    this.context.router.history.push(`/cooperate/projects/${projectCode}/detail`);
                  }}
                  disabled={!projectCode}
                >
                  {projectCode || replaceSign}
                </Link>
              </Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{'项目状态'}</Col>
              <Col type={'content'}>{status.display}</Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{'项目成品'}</Col>
              <Col type={'content'} style={{ display: 'flex', flex: 1 }}>
                <Link
                  onClick={() => {
                    this.context.router.history.push(`/bom/materials/${encodeURIComponent(product.code)}/detail`);
                  }}
                  disabled={!product}
                >
                  {product.code || replaceSign}-{product.name || replaceSign}
                </Link>
              </Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{'订单号'}</Col>
              <Col type={'content'}>
                <Link
                  onClick={() => {
                    this.context.router.history.push(
                      `/cooperate/purchaseOrders?purchaseOrderCode=${purchaseOrderCode}`,
                    );
                  }}
                  disabled={!purchaseOrderCode}
                >
                  {purchaseOrderCode || replaceSign}
                </Link>
              </Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{'工艺路线'}</Col>
              <Col type={'content'}>
                <Link
                  onClick={() => {
                    this.context.router.history.push(`/bom/processRoute/${processRouting.code}/detail`);
                  }}
                  disabled={!processRouting}
                >
                  {(processRouting && processRouting.name) || replaceSign}
                </Link>
              </Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{'mBOM'}</Col>
              <Col type={'content'}>
                <Link to={`/bom/mbom/${mBom && mBom.id}/detail`} disabled={!mbomVersion}>
                  {mbomVersion || replaceSign}
                </Link>
              </Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{'计划开始时间'}</Col>
              <Col type={'content'}>
                {startTimePlanned ? moment(Number(startTimePlanned)).format('YYYY/MM/DD HH:mm') : replaceSign}
              </Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{'计划结束时间'}</Col>
              <Col type={'content'}>
                {endTimePlanned ? moment(Number(endTimePlanned)).format('YYYY/MM/DD HH:mm') : replaceSign}
              </Col>
            </Row>
          </div>
        </DetailPageItemContainer>
      </div>
    );
  };

  onHandleClick = (material, recordType) => {
    this.setState({
      showDrawer: true,
      material,
      recordType,
    });
  };

  getRealStartTimeAndEndTime = (startTimeReal, endTimeReal) => {
    if (!(startTimeReal || endTimeReal)) {
      return replaceSign;
    } else if (startTimeReal && !endTimeReal) {
      return `${moment(Number(startTimeReal)).format('YYYY/MM/DD HH:mm')} ~ `;
    }
    return `${moment(Number(startTimeReal)).format('YYYY/MM/DD HH:mm')} ~ ${moment(Number(endTimeReal)).format(
      'YYYY/MM/DD HH:mm',
    )}`;
  };

  render() {
    const { loading, recordType, material, taskDispatchType, reportTypeValue, useQrCode } = this.state;
    if (!this.state.taskDetail) {
      return <Spin style={{ width: '100%', height: 600 }} />;
    }
    const { router } = this.context;
    const { taskDetail } = this.state;
    const { projectCode } = taskDetail;

    return (
      <div>
        <div>
          <Drawer
            sidebar={
              <UseAndHoldRecord
                reportType={reportTypeValue}
                recordType={recordType}
                useQrCode={useQrCode}
                material={material}
                taskId={taskDetail.produceTaskId}
                isClear={this.state.showDrawer}
              />
            }
            position="right"
            transition
            open={this.state.showDrawer}
            onCancel={() => this.setState({ showDrawer: false })}
          />
          <Spin spinning={loading}>
            {this.getHeader()}
            {this.getSOPTaskInfo()}
            {this.getProdDetail(taskDetail)}
            {this.getProjectInfo(projectCode)}
          </Spin>
        </div>
      </div>
    );
  }
}

ProdTaskDetail.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(ProdTaskDetail);
