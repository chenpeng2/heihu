import React, { Component } from 'react';
import _ from 'lodash';
import auth from 'utils/auth';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { primary } from 'src/styles/color';
import authorityWrapper from 'src/components/authorityWrapper';
import {
  withForm,
  Link,
  message,
  OpenModal,
  DetailPageItemContainer,
  Popconfirm,
  openModal,
  SendNotification,
} from 'components';
import { queryQcTaskDetail, updateQcTaskStatus } from 'src/services/qualityManagement/qcTask';
import { getPathname } from 'src/routes/getRouteParams';
import { NOTICE_CATEGORY, replaceSign } from 'src/constants';
import { isOrganizationUseQrCode } from 'src/utils/organizationConfig';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import GeneralInfo from './generalInfo';
import QcConfig from './qcConfig';
import styles from './styles.scss';
import QcReportSummary from './qcReportSummary';
import QcReportDetail from './qcReportDetail';
import QcReportResult from './qcReportResult';
import ViewQcMaterial from './viewQcMaterial';
import QcTaskEditForm from '../page/qcTaskEditForm';
import {
  PassQcReportAuditLink,
  PassRepeatQcAuditLink,
  RejectQcReportAuditLink,
  RejectRepeatQcAuditLink,
  QcTaskOperationLogLink,
  RevertQcReportAuditLink,
} from '../base';
import {
  revertLinkStyle,
  passLinkStyle,
  rejectLinkStyle,
  QCTASK_STATUS_AUDITING,
  QCTASK_STATUS_UNSTARTED,
  CHECK_TYPE,
  PRODUCE_QC,
  PRODUCE_ORIGIN_QC,
  INPUT_FACTORY_QC,
  QUALITY_STATUS,
  QCTASK_STATUS_FINISHED,
} from '../../constants';
import { toQcTaskDetail, CREATE_REPEATQC_BASE_URL, QCREPORT_AUDIT_BASE_URL, QCTASK_BASE_URL } from '../../navigation';
import { qcReportAuditConfigIsTrue, fetchCustomRuleData } from '../../utils';

const LinkWithAuth = authorityWrapper(Link);
const containerWrapperStyle = { marginBottom: 20 };
const operationLogLinkStyle = { fontSize: 14 };

type Props = {
  form: {
    getFieldDecorator: () => {},
  },
  data: {},
  match: any,
  history: any,
  onSuccess: () => {},
};

class QcTaskDetail extends Component {
  props: Props;
  state = {
    data: {},
  };

  componentDidMount() {
    fetchCustomRuleData();
    this.fetchData(this.props.match.params.id);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const prevId = _.get(prevProps, 'match.params.id', null);
    const id = _.get(this.props, 'match.params.id', null);
    if (prevId && prevId !== id) {
      this.fetchData(this.props.match.params.id);
    }
  }

  formatData = values => {
    values.operatorId = _.get(values, 'operatorId.key', undefined);
    values.workstationId = _.get(values, 'workstationId.key', undefined);
    values.storageId = _.get(values, 'storageId.key', undefined);
    values.plannedStartTime = _.toNumber(_.get(this, 'state.dateRange[0]', undefined));
    values.plannedEndTime = _.toNumber(_.get(this, 'state.dateRange[1]', undefined));
    values = _.omitBy(values, _.isNaN);
    delete values.plannedTime;
    return _.omitBy(values, _.isUndefined);
  };

  fetchData = id => {
    const paramsId = _.get(this.props.match, 'params.id');
    queryQcTaskDetail(id || paramsId)
      .then(({ data: { data } }) => {
        this.setState({
          data,
          id,
          route: 'generalInfo',
        });
      })
      .catch(e => console.log(e));
  };

  cancelTask = async code => {
    try {
      await updateQcTaskStatus(code, 3);
      await this.fetchData(code);
      message.success('取消成功');
    } catch (err) {
      console.log(err);
    }
  };

  renderNormalActions = data => {
    const { changeChineseTemplateToLocale } = this.context;
    const { code, status, qcConfig, material, countRecord, qcTaskClassification } = data || {};
    const { checkType, name: qcConfigName } = qcConfig || {};
    const { code: materialCode, name: materialName } = material || {};
    const { status: qcResultStatus } = countRecord || {};
    let noticeInfo = '';
    if (status === QCTASK_STATUS_FINISHED) {
      noticeInfo =
        checkType === INPUT_FACTORY_QC
          ? {
              noticeCategory: NOTICE_CATEGORY.inputFactoryQualified.key,
              noticeTitle: changeChineseTemplateToLocale('{materialCode}|{materialName}入厂检合格', {
                materialCode,
                materialName,
              }),
              noticeContent: changeChineseTemplateToLocale(
                '入厂物料{materialCode}|{materialName}，入厂质量检查通过，可以进行库存转移了',
                { materialCode, materialName },
              ),
            }
          : checkType === PRODUCE_QC || checkType === PRODUCE_ORIGIN_QC
          ? {
              noticeCategory: NOTICE_CATEGORY.prodCheckCompleted.key,
              noticeTitle: changeChineseTemplateToLocale('质检|{checkType}完成', {
                checkType: changeChineseToLocaleWithoutIntl(CHECK_TYPE[checkType]),
              }),
              noticeContent: changeChineseTemplateToLocale(
                '物料{materialCode}|{materialName}，{checkType} {qcConfigName} 检查完成，检查结果{qcResultStatus}，可以进行库存转移了',
                {
                  materialCode,
                  materialName,
                  checkType: changeChineseToLocaleWithoutIntl(CHECK_TYPE[checkType]),
                  qcConfigName,
                  qcResultStatus: changeChineseToLocaleWithoutIntl(QUALITY_STATUS[qcResultStatus].name),
                },
              ),
            }
          : null;
    }
    return (
      <div style={{ display: 'flex' }}>
        {(checkType === INPUT_FACTORY_QC || checkType === PRODUCE_QC || checkType === PRODUCE_ORIGIN_QC) &&
        status === QCTASK_STATUS_FINISHED &&
        qcTaskClassification === 0 ? (
          <Link
            onClick={() => {
              openModal({
                title: checkType === INPUT_FACTORY_QC ? '通知移库' : '通知转移',
                footer: null,
                children: <SendNotification noticeInfo={noticeInfo} />,
                width: '58%',
              });
            }}
            style={{ marginRight: 40 }}
            iconType="gc"
            icon={'tongzhi'}
          >
            {checkType === INPUT_FACTORY_QC ? '通知移库' : '通知转移'}
          </Link>
        ) : null}
        {status === QCTASK_STATUS_AUDITING && qcReportAuditConfigIsTrue() ? (
          <RevertQcReportAuditLink
            icon="piliangchehui"
            iconType="gc"
            style={revertLinkStyle}
            params={{ taskCode: code }}
            refetchData={() => this.fetchData(code)}
          />
        ) : null}
        {status === QCTASK_STATUS_UNSTARTED ? (
          <Link
            icon="form"
            style={{ marginRight: 40, fontSize: 12 }}
            onClick={() => {
              OpenModal(
                {
                  title: '编辑质检任务',
                  footer: false,
                  width: 660,
                  height: 416,
                  children: (
                    <QcTaskEditForm
                      data={data}
                      onSuccess={async () => {
                        await this.fetchData(code);
                      }}
                    />
                  ),
                },
                this.context,
              );
            }}
          >
            编辑
          </Link>
        ) : (
          <Link icon="edit" disabled style={{ fontSize: 14, opacity: 0.3, color: primary, paddingRight: 40 }}>
            编辑
          </Link>
        )}
        {status === QCTASK_STATUS_UNSTARTED ? (
          <Popconfirm
            arrowPointAtCenter
            autoAdjustOverflow
            placement="topRight"
            overlayStyle={{ width: 230, fontSize: 14 }}
            title="该质检任务取消后便无法再重启，确认要取消任务吗？"
            onConfirm={() => {
              this.cancelTask(code);
            }}
            okText="确认"
            cancelText="还不要"
          >
            <LinkWithAuth
              icon="close-circle-o"
              style={{ fontSize: 12, paddingRight: 40 }}
              auth={auth.WEB_CANCEL_QUALITY_TESTING_TASK}
            >
              取消
            </LinkWithAuth>
          </Popconfirm>
        ) : (
          <Link icon="close-circle-o" disabled style={{ fontSize: 14, opacity: 0.3, color: primary, paddingRight: 40 }}>
            取消
          </Link>
        )}
        <LinkWithAuth
          icon="bars"
          auth={auth.WEB_VIEW_QUALITY_TESTING_TASK}
          style={{ fontSize: 14 }}
          onClick={() => {
            this.context.router.history.push(`/qualityManagement/qcTask/detail/${code}/operationLog`);
          }}
        >
          查看操作日志
        </LinkWithAuth>
      </div>
    );
  };

  renderQcReportAuditActions = data => {
    const { code, qcConfig, status } = data || {};
    const qcConfigName = _.get(qcConfig, 'name', replaceSign);
    const scrapInspection = _.get(qcConfig, 'scrapInspection', false);
    const params = { taskCode: code, scrapInspection, qcConfigName };

    return (
      <div style={{ display: 'flex' }}>
        {status === QCTASK_STATUS_AUDITING && qcReportAuditConfigIsTrue() ? (
          <React.Fragment>
            <PassQcReportAuditLink
              icon="check-circle-o"
              style={passLinkStyle}
              params={params}
              redirectUrl={toQcTaskDetail({ code })}
              taskData={data}
            />
            <RejectQcReportAuditLink
              icon="close-circle-o"
              style={rejectLinkStyle}
              params={params}
              redirectUrl={toQcTaskDetail({ code })}
              taskData={data}
            />
          </React.Fragment>
        ) : null}
        <QcTaskOperationLogLink
          style={operationLogLinkStyle}
          icon="bars"
          auth={auth.WEB_VIEW_QUALITY_TESTING_TASK}
          code={code}
        >
          查看操作日志
        </QcTaskOperationLogLink>
      </div>
    );
  };

  renderRepeatQcAuditActions = data => {
    const { code, qcConfig, repeatReqId, ...rest } = data || {};
    const qcConfigName = _.get(qcConfig, 'name', replaceSign);
    const params = { taskCode: code, qcConfigName, repeatQcReqId: repeatReqId };

    return (
      <div style={{ display: 'flex' }}>
        {repeatReqId ? (
          <React.Fragment>
            <PassRepeatQcAuditLink
              icon="check-circle-o"
              style={passLinkStyle}
              params={params}
              redirectUrl={toQcTaskDetail({ code })}
            />
            <RejectRepeatQcAuditLink
              icon="close-circle-o"
              style={rejectLinkStyle}
              params={params}
              redirectUrl={toQcTaskDetail({ code })}
            />
          </React.Fragment>
        ) : null}
        <QcTaskOperationLogLink
          style={operationLogLinkStyle}
          icon="bars"
          auth={auth.WEB_VIEW_QUALITY_TESTING_TASK}
          code={code}
        >
          查看操作日志
        </QcTaskOperationLogLink>
      </div>
    );
  };

  renderActions = () => {
    const pathname = getPathname(this.props.match);
    const { data } = this.state;
    if (pathname.includes(QCTASK_BASE_URL)) {
      // 质检任务详情页
      return this.renderNormalActions(data);
    }
    if (pathname.includes(CREATE_REPEATQC_BASE_URL)) {
      // 复检审核详情页
      return this.renderRepeatQcAuditActions(data);
    }
    if (pathname.includes(QCREPORT_AUDIT_BASE_URL)) {
      // 质检报告审核详情页
      return this.renderQcReportAuditActions(data);
    }
    return null;
  };

  render() {
    const { data } = this.state;
    const unitName = _.get(data, 'material.unitName') ? `（${_.get(data, 'material.unitName')}）` : '';
    const materialName = _.get(data, 'material.name', '');
    const materialCode = _.get(data, 'material.code', '');
    const title = _.get(data, 'material') ? `${materialCode}/${materialName}${unitName}` : '';
    const useQrCode = isOrganizationUseQrCode();

    return (
      <div style={{ padding: 20 }}>
        <div className={styles.operations}>
          <p
            onClick={() => {
              this.context.router.history.push(`/bom/materials/${materialCode}/detail`);
            }}
          >
            {title}
          </p>
          {this.renderActions()}
        </div>
        <React.Fragment>
          <div style={containerWrapperStyle}>
            <QcConfig data={data} />
          </div>
          <div style={containerWrapperStyle}>
            <DetailPageItemContainer contentStyle={{ width: '100%', padding: '10px 0' }} itemHeaderTitle="质检物料">
              <ViewQcMaterial data={data} materialName={materialName} />
            </DetailPageItemContainer>
          </div>
          <div style={containerWrapperStyle}>
            <QcReportSummary data={data} />
          </div>
          <div style={containerWrapperStyle} className={styles.qcReportDetail}>
            <QcReportDetail data={data} />
          </div>
          {useQrCode ? (
            <div style={containerWrapperStyle} className={styles.qcReportDetail}>
              <QcReportResult data={data} />
            </div>
          ) : null}
          <div style={containerWrapperStyle}>
            <GeneralInfo data={data} />
          </div>
        </React.Fragment>
      </div>
    );
  }
}

QcTaskDetail.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseTemplateToLocale: PropTypes.any,
};

export default withForm({}, withRouter(QcTaskDetail));
