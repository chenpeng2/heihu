import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import auth from 'src/utils/auth';
import { arrayIsEmpty } from 'utils/array';
import { borderGrey } from 'src/styles/color';
import { closeModal } from 'components/modal';
import { Link, Modal, openModal, withForm, message } from 'components';
import { getSOPTaskList } from 'src/services/knowledgeBase/sop';
import { queryQcTaskList } from 'src/services/qualityManagement/qcTask';
import { createProjectBatchRecordAudit } from 'src/services/cooperate/project';
import {
  SOP_TASK_STATUS_UNSTART,
  SOP_TASK_STATUS_EXECUTING,
  SOP_TASK_STATUS_PAUSE,
} from 'src/views/knowledgeManagement/flowEngine/common/SOPTaskConstant';
import {
  QCTASK_STATUS_UNSTARTED,
  QCTASK_STATUS_STARTED,
  QCTASK_STATUS_AUDITING,
  QCTASK_STATUS_REJECTED,
} from 'src/views/qualityManagement/constants';
import BatchRecordAuditForm from './BatchRecordAuditForm';
import styles from './styles.scss';

const AntModal = Modal.AntModal;

class BatchRecordAuditLink extends React.Component {
  state = {};

  showConfirmModal = () => {
    AntModal.confirm({
      iconType: 'exclamation-circle',
      title: '提示',
      content: '存在状态不是已结束或已取消状态的任务',
      okText: '确定申请',
      cancelText: '暂不申请',
      onOk: () => {
        this.showAuditModal();
      },
    });
  };

  showAuditModal = () => {
    const { form, params, refetchData } = this.props;
    const { projectCode } = params || {};
    openModal(
      {
        title: '申请审批',
        width: 1000,
        disabledRelayModalClassname: true,
        footer: null,
        children: (
          <BatchRecordAuditForm
            onSuccess={() => {
              const { approvers } = this.props.form.getFieldsValue() || {};
              const audits = approvers
                .filter(x => x)
                .map((approver, i) => {
                  const approverIds = approver.map(({ key }) => key);
                  return { seq: i, approverIds };
                });
              createProjectBatchRecordAudit({ projectCode, audits }).then(res => {
                const statsCode = _.get(res, 'data.statusCode');
                if (statsCode === 200) {
                  message.success('申请审批成功');
                  closeModal();
                  if (typeof refetchData === 'function') {
                    refetchData();
                  }
                }
              });
            }}
            onCancel={() => closeModal()}
            batchRecordAuditors={[]}
            form={form}
          />
        ),
      },
      this.context,
    );
  };

  checkAllSopTaskFinished = () => {
    const projectCode = _.get(this.props, 'params.projectCode');
    const sopTaskStatuses = [SOP_TASK_STATUS_UNSTART, SOP_TASK_STATUS_EXECUTING, SOP_TASK_STATUS_PAUSE].join(',');
    const params = { page: 1, size: 1, statuses: sopTaskStatuses, projectCode };

    getSOPTaskList(params)
      .then(res => {
        const unFinishedTaskTotal = _.get(res, 'data.total');
        if (unFinishedTaskTotal !== 0) {
          this.showConfirmModal();
          return;
        }
        this.checkAllQcTaskFinished();
      })
      .catch(err => console.log(err));
  };

  checkAllQcTaskFinished = () => {
    const projectCode = _.get(this.props, 'params.projectCode');
    const params = {
      size: 1,
      page: 1,
      projectCode,
      statuses: [QCTASK_STATUS_UNSTARTED, QCTASK_STATUS_STARTED, QCTASK_STATUS_AUDITING, QCTASK_STATUS_REJECTED].join(
        ',',
      ),
    };

    queryQcTaskList(params)
      .then(res => {
        const unFinishedTaskTotal = _.get(res, 'data.total');

        if (unFinishedTaskTotal !== 0) {
          this.showConfirmModal();
          return;
        }
        this.showAuditModal();
      })
      .catch(err => console.log(err));
  };

  handleClick = () => {
    this.checkAllSopTaskFinished();
  };

  render() {
    return (
      <Link onClick={this.handleClick} auth={auth.WEB_AUDIT_BATCH_RECORD} {...this.props}>
        申请审批
      </Link>
    );
  }
}

BatchRecordAuditLink.propTypes = {
  form: PropTypes.any,
  refetchData: PropTypes.func,
};

export default withForm({}, withRouter(BatchRecordAuditLink));
