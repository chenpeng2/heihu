import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Steps, Link, openModal, Tooltip, message } from 'components';
import auth from 'src/utils/auth';
import { closeModal } from 'components/modal';
import LocalStorage from 'utils/localStorage';
import { replaceSign, FIELDS } from 'src/constants';
import { primary } from 'src/styles/color';
import { getProjectBatchRecordAuditDetail, auditProjectBatchRecord } from 'src/services/cooperate/project';
import { arrayIsEmpty } from 'utils/array';
import AuditForm from '../base/AuditForm';
import {
  BATCH_RECORD_STATUS_PASSED,
  projectBatchRecordAuditResultMap,
  BATCH_RECORD_AUDIT_RESULT_PASSED,
  BATCH_RECORD_AUDIT_RESULT_CREATED,
  BATCH_RECORD_AUDIT_RESULT_FAILED,
} from '../constant';
import styles from './styles.scss';

const { Step } = Steps;
const baseLinkStyle = { marginLeft: 10 };

class BatchRecordAuditProcess extends React.PureComponent {
  constructor(props) {
    super(props);
    this.AuditFormInst = React.createRef();
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    const { params } = this.props;
    const { projectCode } = params || {};
    this.getBatchRecordAuditDetail(projectCode);
  }

  getBatchRecordAuditDetail = async projectCode => {
    const res = await getProjectBatchRecordAuditDetail({ projectCode });
    const data = _.get(res, 'data.data');
    this.setState({ data });
  };

  renderProcessDetail = () => {
    const { data } = this.state;
    const { params, refetchData } = this.props;
    if (arrayIsEmpty(data)) return replaceSign;
    const lastIndex = _.findLastIndex(data, o => o.status === BATCH_RECORD_AUDIT_RESULT_PASSED);
    const current = lastIndex >= 0 ? lastIndex + 1 : 0;
    return (
      <div className={styles.batch_record_audit_process}>
        <span className="label">审批进度</span>
        <Steps direction="vertical" size="small" current={current}>
          {data.map(node => {
            const { approvers, remark, status, id, seq } = node;
            const userInfo = LocalStorage.get(FIELDS && FIELDS.USER);
            const { id: currentUserId } = userInfo || {};
            const ids = approvers.map(({ id }) => id);
            const names = approvers.map(({ name }) => name);
            return (
              <Step
                title={
                  <span style={seq !== current ? { opacity: 0.7 } : null}>
                    <Tooltip text={names.join(',')} length={20} />
                    <span
                      style={
                        status === BATCH_RECORD_AUDIT_RESULT_PASSED
                          ? { ...baseLinkStyle, color: primary }
                          : baseLinkStyle
                      }
                    >
                      {projectBatchRecordAuditResultMap[status] || replaceSign}
                    </span>
                    {seq === current && ids.includes(currentUserId) && status !== BATCH_RECORD_AUDIT_RESULT_PASSED ? (
                      <Link
                        style={baseLinkStyle}
                        onClick={e => {
                          openModal({
                            title: '审批',
                            width: 660,
                            autoClose: false,
                            children: <AuditForm wrappedComponentRef={this.AuditFormInst} />,
                            onOk: () => {
                              const AuditFormInst = this.AuditFormInst.current.props.form;
                              AuditFormInst.validateFieldsAndScroll(async (err, values) => {
                                if (!err) {
                                  const { status, ...rest } = _.omitBy(values, _.isUndefined);
                                  await auditProjectBatchRecord({
                                    id,
                                    status: status
                                      ? BATCH_RECORD_AUDIT_RESULT_PASSED
                                      : BATCH_RECORD_AUDIT_RESULT_FAILED,
                                    ...rest,
                                  })
                                    .then(res => {
                                      const statusCode = _.get(res, 'data.statusCode');
                                      if (statusCode === 200) {
                                        message.success('审批成功');
                                        closeModal();
                                        if (typeof refetchData === 'function') {
                                          refetchData();
                                        }
                                        const { params } = this.props;
                                        const { projectCode } = params || {};
                                        this.getBatchRecordAuditDetail(projectCode);
                                      }
                                    })
                                    .catch(err => console.log(err));
                                }
                              });
                            },
                          });
                        }}
                      >
                        审批
                      </Link>
                    ) : null}
                  </span>
                }
                description={
                  [BATCH_RECORD_AUDIT_RESULT_PASSED, BATCH_RECORD_AUDIT_RESULT_FAILED].includes(status)
                    ? `${remark || replaceSign}`
                    : null
                }
              />
            );
          })}
        </Steps>
      </div>
    );
  };

  showProcessModal = () => {
    openModal({
      title: '审批进度',
      width: 660,
      children: this.renderProcessDetail(),
      footer: null,
    });
  };

  render() {
    return (
      <Link onClick={this.showProcessModal} {...this.props}>
        查看审批进度
      </Link>
    );
  }
}

BatchRecordAuditProcess.propTypes = {
  params: PropTypes.object,
  refetchData: PropTypes.func,
};

export default BatchRecordAuditProcess;
