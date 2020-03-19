import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Table } from 'antd';
import PropTypes from 'prop-types';
import moment, { formatUnix } from 'utils/time';
import { AuditInfo } from 'containers/audit';
import { getOrganizationConfigFromLocalStorage, isOrganizationUseQrCode } from 'utils/organizationConfig';
import { queryProdTaskDetail, baitingProdTask } from 'src/services/cooperate/prodTask';
import { getProject } from 'src/services/cooperate/project';
import { getBasicMbomInfo } from 'src/services/bom/mbom';
import { blacklakeGreen, white, fontSub } from 'src/styles/color/index';
import { replaceSign } from 'src/constants';
import {
  Icon,
  ActionButton,
  Row,
  Col,
  Spin,
  Tooltip,
  Drawer,
  Link,
  DetailPageItemContainer,
  SimpleTable,
} from 'components';
import CONSTANT from 'src/views/cooperate/prodTask/constant';
import AUTH from 'utils/auth';
import UseAndHoldRecord from './useAndHoldRecord';
import styles from './styles.scss';

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
    category: 1,
  };

  componentWillMount() {
    const config = getOrganizationConfigFromLocalStorage();
    const taskDispatchType = config.config_task_dispatch_type.configValue;
    const useQrCode = isOrganizationUseQrCode();
    const reportType = config.config_group_leader_report;
    const reportTypeValue = reportType ? reportType.configValue : false;
    this.setState({ taskDispatchType, reportTypeValue, useQrCode });
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const {
      match: {
        params: { taskId },
      },
      location: {
        query: { category = 1 },
      },
    } = this.props;
    const _category = parseInt(category, 10);
    this.setState({ loading: true, category: _category });
    const fetchApi = _category === CONSTANT.CATEGORY_BAITING ? baitingProdTask : queryProdTaskDetail;
    fetchApi({ taskId })
      .then(res => {
        const { data } = res;
        const { projectCode } = data.data;
        this.setState({ data });
        getProject({ code: projectCode }).then(res => {
          const { data } = res;
          const { product, mbomVersion } = data.data;
          this.setState({ project: data });
          if (mbomVersion) {
            getBasicMbomInfo({ code: product.code, version: mbomVersion }).then(res => {
              this.setState({ mBom: res.data });
            });
          }
        });
      })
      .finally(() => {
        this.setState({ loading: false });
        const sidebarDom = document.getElementsByClassName('rc-drawer-sidebar')[0];
        if (sidebarDom) {
          sidebarDom.style.width = '500px';
        }
      });
  };

  getHeader = (router, data, taskDispatchType) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 30px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 20 }}>{data.taskCode}</span>
        <span style={{ fontSize: 12, marginLeft: 20, color: fontSub }}>
          {this.context.changeChineseToLocale('创建人')}：{_.get(data, 'creator.name') || replaceSign}
        </span>
        <span style={{ fontSize: 12, marginLeft: 20, color: fontSub }}>
          {this.context.changeChineseToLocale('创建时间')}：{moment(Number(data.createAt)).format('YYYY/MM/DD HH:mm')}
        </span>
      </div>
      <div>
        {data.status.display === '未开始' && taskDispatchType !== 'worker_weak' ? (
          <Link
            style={{ color: blacklakeGreen, backgroundColor: white, marginRight: 20 }}
            to={`/cooperate/prodTasks/editTask/${this.props.match.params.taskId}`}
            icon="form"
            auth={AUTH.WEB_EDIT_PRODUCE_TASK}
          >
            {this.context.changeChineseToLocale('编辑')}
          </Link>
        ) : null}
        <ActionButton
          style={{ color: blacklakeGreen, backgroundColor: white }}
          onClick={() => {
            const {
              match: {
                params: { taskId },
              },
            } = this.props;
            this.context.router.history.push(`/cooperate/prodTasks/detail/${taskId}/log`);
          }}
        >
          <Icon type="bars" />
          {this.context.changeChineseToLocale('查看操作记录')}
        </ActionButton>
      </div>
    </div>
  );

  getProdTaskInfo = data => {
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
      outMaterialPlanned,
      operatorGroup,
      finishLog,
      auditInfo,
      outMaterials,
    } = data;
    const { category } = this.state;
    const { changeChineseToLocale } = this.context;
    let outMaterialDisplay = replaceSign;
    if (outMaterialPlanned && outMaterialPlanned.materialCode) {
      outMaterialDisplay = `${outMaterialPlanned.materialCode}／${outMaterialPlanned.materialName}`;
    }
    if (category === CONSTANT.CATEGORY_BAITING) {
      outMaterialDisplay = outMaterials
        .map(({ materialCode, materialName }) => `${materialCode}/${materialName}`)
        .join('、');
    }
    const itemHeaderTitle = changeChineseToLocale('任务信息');
    const { taskDispatchType } = this.state;
    return (
      <div style={{ ...itemContainerStyle, marginTop: 0 }}>
        <DetailPageItemContainer itemHeaderTitle={itemHeaderTitle}>
          <div>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{changeChineseToLocale('任务编号')}</Col>
              <Col type={'content'}>{taskCode || replaceSign}</Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{changeChineseToLocale('任务号')}</Col>
              <Col type={'content'} style={{ display: 'flex', flex: 1 }}>
                {id || replaceSign}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{changeChineseToLocale('执行人')}</Col>
              <Col type={'content'} style={{ display: 'flex', flex: 1 }}>
                {operatorGroup
                  ? operatorGroup.name
                  : operators.length > 0
                  ? operators.map(operator => operator.name).join('，')
                  : replaceSign}
              </Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{changeChineseToLocale('任务状态')}</Col>
              <Col type={'content'}>
                {changeChineseToLocale(status.display)}
                {finishLog ? `(${finishLog.reason}, ${finishLog.remark || replaceSign})` : ''}
              </Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{changeChineseToLocale('产出物料')}</Col>
              <Col type={'content'}>{outMaterialDisplay}</Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{changeChineseToLocale('工序')}</Col>
              <Col type={'content'}>
                <Link.NewTagLink href={`/bom/newProcess/${processCode}/detail`}>
                  {showProcessSeq ? `${processSeq || replaceSign}/` : null}
                  {`${processCode || replaceSign}/${processName || replaceSign}`}
                </Link.NewTagLink>
              </Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{changeChineseToLocale('工位')}</Col>
              <Col type={'content'}>{workstation ? workstation.name : replaceSign}</Col>
            </Row>
            {taskDispatchType === 'manager' ? (
              <Row style={{ marginRight: 40 }}>
                <Col type={'title'}>{changeChineseToLocale('计划开始结束时间')}</Col>
                <Col type={'content'}>
                  {`${moment(Number(startTimePlanned)).format('YYYY/MM/DD HH:mm')} ~ ${moment(
                    Number(endTimePlanned),
                  ).format('YYYY/MM/DD HH:mm')}`}
                </Col>
              </Row>
            ) : null}
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{changeChineseToLocale('历史审批记录')}</Col>
              <Col type={'content'} style={{ width: 400 }}>
                {auditInfo ? (
                  <AuditInfo
                    auditInfo={{
                      ...auditInfo,
                      auditors: auditInfo.auditors.map(auditor => ({ ...auditor, audited: true })),
                    }}
                  />
                ) : (
                  replaceSign
                )}
              </Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{changeChineseToLocale('实际开始结束时间')}</Col>
              <Col type={'content'}>{this.getRealStartTimeAndEndTime(startTimeReal, endTimeReal)}</Col>
            </Row>
          </div>
        </DetailPageItemContainer>
      </div>
    );
  };

  getInputMaterialTable = data => {
    const { category, useQrCode } = this.state;
    const { changeChineseToLocale } = this.context;

    const columns = [
      {
        title: changeChineseToLocale('投产物料'),
        dataIndex: 'materialCode',
        width: 400,
        key: 'material',
        render: (_, record) => {
          const str = record[0] ? `${record[0].materialCode}/${record[0].materialName}` : replaceSign;
          return <div>{str}</div>;
        },
      },
      {
        title: changeChineseToLocale('进度：实际/计划'),
        dataIndex: 'amount',
        width: 400,
        key: 'amount',
        render: (_, record) => {
          return (
            <div>
              {(record[0] && record[0].amount) || replaceSign}/{(record[1] && record[1].amount) || replaceSign}
              {(record[0] && record[0].unit) || replaceSign}
            </div>
          );
        },
      },
      {
        title: changeChineseToLocale('操作'),
        key: 'action',
        render: (_, record) => (
          <div style={{ textAlign: 'right' }}>
            <Link
              onClick={() => {
                const { materialCode, materialName, unit } = record[0];
                this.onHandleClick({ materialCode, materialName, unit }, 'unqualifiedUse');
              }}
            >
              {changeChineseToLocale('不合格记录')}
            </Link>
            <Link
              onClick={() => {
                const { materialCode, materialName, unit } = record[0];
                this.onHandleClick({ materialCode, materialName, unit }, 'use');
              }}
              style={{ marginLeft: 20 }}
              disabled={record[0] ? !record[0].materialName : true}
            >
              {changeChineseToLocale('投产记录')}
            </Link>
            {useQrCode && (
              <Link
                onClick={() => {
                  const { materialCode, materialName, unit } = record[0];
                  this.onHandleClick({ materialCode, materialName, unit }, 'retreat');
                }}
                style={{ marginLeft: 20 }}
                disabled={record[0] ? !record[0].materialName : true}
              >
                {changeChineseToLocale('投产回撤')}
              </Link>
            )}
          </div>
        ),
      },
    ];

    // zip two arry into single array
    let dataSource =
      category === CONSTANT.CATEGORY_BAITING
        ? data.inputMaterials.map(v => [v, null])
        : data.inputMaterialsReal.map(v => [v, null]);
    if (Array.isArray(data.inputMaterialsPlanned)) {
      dataSource =
        category === CONSTANT.CATEGORY_BAITING
          ? data.inputMaterials.map((v, index) => [v, data.inputMaterialsPlanned[index]])
          : data.inputMaterialsReal.map((v, index) => [v, data.inputMaterialsPlanned[index]]);
    }
    return (
      <div
        style={{
          width: '100%',
          borderTop: '1px solid rgb(234, 236, 241)',
          borderLeft: '1px solid rgb(234, 236, 241)',
          borderRight: '1px solid rgb(234, 236, 241)',
        }}
      >
        <Table pagination={false} columns={columns} dataSource={dataSource} />
      </div>
    );
  };

  getOutputMaterialTable = data => {
    const { changeChineseToLocale } = this.context;
    let dataSource =
      this.state.category === CONSTANT.CATEGORY_BAITING
        ? data.outMaterials.map(v => [v, null])
        : [data.outMaterialReal].map(v => [v, null]);
    if (Array.isArray(data.outMaterialPlanned)) {
      dataSource =
        this.state.category === CONSTANT.CATEGORY_BAITING
          ? data.outMaterials.map((v, index) => [v, [data.outMaterialPlanned][index]])
          : [data.outMaterialReal].filter(n => n).map((v, index) => [v, [data.outMaterialPlanned][index]]);
    }

    const columns = [
      {
        title: changeChineseToLocale('产出物料'),
        dataIndex: 'materialCode',
        width: 400,
        key: 'outMaterialReal',
        render: (_, record) => {
          const str = record[0] ? `${record[0].materialCode}/${record[0].materialName}` : replaceSign;
          return <div>{str}</div>;
        },
      },
      {
        title: changeChineseToLocale('进度：实际/计划'),
        dataIndex: 'amount',
        width: 400,
        key: 'material',
        render: (_, record) => {
          return (
            <div>
              {(record[0] && record[0].amount) || replaceSign}/{(record[1] && record[1].amount) || replaceSign}
              {(record[0] && record[0].unit) || replaceSign}
            </div>
          );
        },
      },
      {
        title: changeChineseToLocale('操作'),
        key: 'action',
        render: (_, record) => {
          return (
            <div style={{ textAlign: 'right' }}>
              <Link
                style={{ marginLeft: 20 }}
                onClick={() => {
                  const { materialName, materialCode, unit } = record[0];
                  this.onHandleClick({ materialCode, materialName, unit }, 'unqualifiedHold');
                }}
              >
                {changeChineseToLocale('不合格记录')}
              </Link>
              <Link
                style={{ marginLeft: 20 }}
                disabled={record[0] ? !record[0].materialName : true}
                onClick={() => {
                  const { materialName, materialCode, unit } = record[0];
                  this.onHandleClick({ materialCode, materialName, unit }, 'hold');
                }}
              >
                {changeChineseToLocale('产出记录')}
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
        <Table columns={columns} dataSource={dataSource} pagination={false} />
      </div>
    );
  };

  getByProductOutMaterialTable = data => {
    if (Array.isArray(data.byProductOutMaterialsReal) && data.byProductOutMaterialsReal.length > 0) {
      const { changeChineseToLocale } = this.context;
      const columns = [
        {
          title: changeChineseToLocale('副产出物料'),
          dataIndex: 'materialCode',
          width: 400,
          key: 'outMaterialReal',
          render: (_, { materialName, materialCode }) => {
            return <div>{`${materialCode}/${materialName}` || replaceSign}</div>;
          },
        },
        {
          title: changeChineseToLocale('实际产量'),
          dataIndex: 'amount',
          width: 400,
          key: 'material',
          render: (amount, { unit }) => {
            return (
              <div>
                {amount}
                {unit || replaceSign}
              </div>
            );
          },
        },
        {
          title: changeChineseToLocale('操作'),
          key: 'action',
          render: (_, { materialName, materialCode, unit }) => {
            return (
              <div style={{ textAlign: 'right' }}>
                <Link
                  style={{ marginLeft: 20 }}
                  onClick={() => {
                    this.onHandleClick({ materialCode, materialName, unit }, 'byProductUnqualifiedOutput');
                  }}
                >
                  {changeChineseToLocale('不合格记录')}
                </Link>
                <Link
                  style={{ marginLeft: 20 }}
                  disabled={!materialName}
                  onClick={() => {
                    this.onHandleClick({ materialCode, materialName, unit }, 'byProductOutput');
                  }}
                >
                  {changeChineseToLocale('产出记录')}
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
          <Table columns={columns} dataSource={data.byProductOutMaterialsReal} pagination={false} />
        </div>
      );
    }
  };

  getProdDetail = data => {
    const { changeChineseToLocale } = this.context;
    const itemHeaderTitle = changeChineseToLocale('生产详情');
    return (
      <div style={itemContainerStyle}>
        <DetailPageItemContainer contentStyle={{ width: '100%', padding: 20 }} itemHeaderTitle={itemHeaderTitle}>
          {this.getInputMaterialTable(data)}
          {this.getOutputMaterialTable(data)}
          {this.getByProductOutMaterialTable(data)}
        </DetailPageItemContainer>
      </div>
    );
  };

  getColumns = () => {
    const { changeChineseToLocale } = this.context;
    const columns = [
      {
        title: changeChineseToLocale('审批时间'),
        dataIndex: 'remarkDate',
        render: remarkDate => (remarkDate ? formatUnix(remarkDate) : replaceSign),
      },
      {
        title: changeChineseToLocale('审批人'),
        dataIndex: 'name',
        render: name => name || replaceSign,
      },
      {
        title: changeChineseToLocale('审批备注'),
        dataIndex: 'remark',
        render: remark => (remark ? <Tooltip text={remark} length={20} /> : replaceSign),
      },
    ];

    return columns;
  };

  getProjectInfo = projectCode => {
    const { project, mBom, category } = this.state;
    const { changeChineseToLocale } = this.context;
    const itemHeaderTitle = changeChineseToLocale('项目信息');
    if (!project) {
      return null;
    }
    const {
      product,
      status,
      purchaseOrder,
      processRouting,
      mbomVersion,
      startTimePlanned,
      endTimePlanned,
      outputMaterial,
    } = project.data;
    let productDom = product ? (
      <Link
        onClick={() => {
          this.context.router.history.push(`/bom/materials/${encodeURIComponent(product.code)}/detail`);
        }}
        disabled={!product}
      >
        {product.code || replaceSign}-{product.name || replaceSign}
      </Link>
    ) : (
      replaceSign
    );
    if (category === CONSTANT.CATEGORY_BAITING) {
      productDom = outputMaterial
        ? outputMaterial.map(({ code, name }) => (
            <Link to={`/bom/materials/${encodeURIComponent(code)}/detail`}>
              {code}/{name}
            </Link>
          ))
        : replaceSign;
    }
    const purchaseOrderCode = (purchaseOrder && purchaseOrder.purchaseOrderCode) || '';
    const columns = this.getColumns();

    return (
      <div style={{ ...itemContainerStyle, marginTop: 10 }}>
        <DetailPageItemContainer itemHeaderTitle={itemHeaderTitle}>
          <div>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{changeChineseToLocale('项目编号')}</Col>
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
              <Col type={'title'}>{changeChineseToLocale('项目状态')}</Col>
              <Col type={'content'}>{status.display}</Col>
            </Row>
            <Row style={{ marginRight: 40, flexWrapper: 'wrapper' }}>
              <Col type={'title'}>{changeChineseToLocale('项目成品')}</Col>
              <Col type={'content'} style={{ flex: 1 }}>
                {productDom}
              </Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{changeChineseToLocale('订单号')}</Col>
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
              <Col type={'title'}>{changeChineseToLocale('工艺路线')}</Col>
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
              <Col type={'title'}>{changeChineseToLocale('mBOM')}</Col>
              <Col type={'content'}>
                <Link
                  onClick={() => {
                    this.context.router.history.push(`/bom/mbom/${mBom.data && mBom.data.id}/detail`);
                  }}
                  disabled={!mbomVersion}
                >
                  {mbomVersion || replaceSign}
                </Link>
              </Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{changeChineseToLocale('计划开始时间')}</Col>
              <Col type={'content'}>
                {startTimePlanned ? moment(Number(startTimePlanned)).format('YYYY/MM/DD HH:mm') : replaceSign}
              </Col>
            </Row>
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{changeChineseToLocale('计划结束时间')}</Col>
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
    if (!this.state.data) {
      return null;
    }
    const { router } = this.context;
    const { data } = this.state.data;
    const { projectCode } = data;

    return (
      <div className="prodTaskDetailContainer">
        <Drawer
          sidebar={
            <UseAndHoldRecord
              reportType={reportTypeValue}
              recordType={recordType}
              useQrCode={useQrCode}
              material={material}
              taskId={this.props.match.params.taskId}
              isClear={this.state.showDrawer}
            />
          }
          position="right"
          transition
          open={this.state.showDrawer}
          onCancel={() => this.setState({ showDrawer: false })}
        />
        <div className={styles.prodTaskDetail}>
          <Spin spinning={loading}>
            {this.getHeader(router, data, taskDispatchType)}
            {this.getProdTaskInfo(data)}
            {this.getProdDetail(data)}
            {this.getProjectInfo(projectCode)}
          </Spin>
        </div>
      </div>
    );
  }
}

ProdTaskDetail.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseToLocale: PropTypes.any,
};

export default withRouter(ProdTaskDetail);
