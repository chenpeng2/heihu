import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Modal as AntModal } from 'antd';
import { configHasSOP, includeOrganizationConfig, ORGANIZATION_CONFIG } from 'utils/organizationConfig';
import { getSOPTaskList } from 'services/knowledgeBase/sop';
import { ActionButton, openModal, Popconfirm, Modal, Link } from 'src/components';
import { primary } from 'src/styles/color/index';
import {
  cancelProjectVerify,
  getInjectMoldProjectDetail,
  getProjectBatchRecordAuditStatus,
} from 'src/services/cooperate/project';
import { queryProdTaskList, queryProdTaskListByProjectCodes } from 'services/cooperate/prodTask';
import { getProjectFinishReasonList } from 'services/knowledgeBase/projectFinishReason';
import { white } from 'src/styles/color';
import { getQcTasks, getQcTasksByProjectCodes } from 'services/cooperate/qcTask';
import { replaceSign, PROJECT_CATEGORY_INJECTION_MOULDING } from 'constants';
import FinishProjectModal from '../FinishProjectModal';
import { BATCH_RECORD_STATUS_PASSED } from '../../constant';
import styles from '../styles.scss';

const confirm = AntModal.confirm;
const MyModal = Modal.AntModal;
const PopConfirmWithCustomButton = Popconfirm.PopConfirmWithCustomButton;
const actionButtonBaseStyle = { color: primary, cursor: 'pointer', background: white };
const textBaseStyle = { marginLeft: 10, color: primary, cursor: 'pointer' };

type Props = {
  text: string,
  projectCode: string,
  updateStatusFn: () => {},
  style: {},
  iconType: string,
  useIcon: boolean,
  isGcIcon: boolean,
};

class UpdateStatusForProject extends Component {
  props: Props;
  state = {
    showPopConfirm: false,
    showFinishModal: false,
    error: {
      code: null,
      message: null,
    },
    title: null,
    canProjectBeAborted: false,
  };

  toggleFinishModalShow = visible => {
    this.setState({ showFinishModal: visible });
  };

  // 项目开始的时候用来判断是否去选择mbom或者工艺路线
  renderPopover = () => {
    const { text, projectCode, iconType, useIcon, isGcIcon } = this.props;
    const { router } = this.context;
    const { error } = this.state;
    const { code, message } = error || {};

    if (code === 'PROJECT_WITHOUT_MBOM_OR_PROCESSROUTING') {
      return (
        <PopConfirmWithCustomButton
          text={message}
          visible
          cancelText={'暂不选择'}
          okText={'去选择'}
          onConfirm={() => {
            router.history.push(`/cooperate/projects/${projectCode}/edit`);
          }}
          onCancel={() => {
            this.setState({ showPopConfirm: false });
          }}
          placement={'topRight'}
        >
          {useIcon ? (
            <span>
              <ActionButton style={actionButtonBaseStyle} isGcIcon={isGcIcon} iconType={iconType} text={text} />
            </span>
          ) : (
            <span style={textBaseStyle}>{text}</span>
          )}
        </PopConfirmWithCustomButton>
      );
    }
    if (code === 'PROJECT_HAS_RUNNING_TASKS') {
      return (
        <PopConfirmWithCustomButton
          text={message}
          visible
          onConfirm={() => {
            this.setState({ showPopConfirm: false });
          }}
          placement={'topRight'}
        >
          {useIcon ? (
            <span>
              <ActionButton style={actionButtonBaseStyle} isGcIcon={isGcIcon} iconType={iconType} text={text} />
            </span>
          ) : (
            <span style={textBaseStyle}>{text}</span>
          )}
        </PopConfirmWithCustomButton>
      );
    }

    return null;
  };

  checkSopBatchRecordAuditStatus = async projectCode => {
    if (configHasSOP() && includeOrganizationConfig(ORGANIZATION_CONFIG.ProjectBatchRecordAudit)) {
      try {
        const res = await getProjectBatchRecordAuditStatus({ projectCode });
        const data = _.get(res, 'data.data');
        const { status } = data || {};
        if (status !== BATCH_RECORD_STATUS_PASSED) {
          return false;
        }
      } catch (error) {
        console.log(error);
      }
    }
    return true;
  };

  openFinishModal = async ({ projectCode, updateStatusFn, projectCategory }) => {
    const queryTaskApi = configHasSOP() ? getSOPTaskList : queryProdTaskList;
    const canProjectFinished = await this.checkSopBatchRecordAuditStatus(projectCode);
    let processData = [];
    let qcTasks = [];

    if (configHasSOP() && !canProjectFinished) {
      AntModal.warning({
        wrapClassName: styles.cant_finished_project_confirm_modal,
        title: '审批',
        content: '审批尚「未全数通过」，不能结束项目！',
        cancelButtonProps: { ghost: true },
        cancelText: '知道了',
      });
      return;
    }

    if (canProjectFinished && projectCategory === PROJECT_CATEGORY_INJECTION_MOULDING) {
      const {
        data: { data: injectionProjectData },
      } = await getInjectMoldProjectDetail({ projectCode });
      const projectCodes = injectionProjectData.projects.map(({ projectCode }) => projectCode);
      const {
        data: { data: _processData },
      } = await queryProdTaskListByProjectCodes(
        {
          projectCodes,
        },
        { statuses: '1,2,3', needPage: true, size: 100 },
      );
      const {
        data: { data: _qcTasks },
      } = await getQcTasksByProjectCodes({ projectCodes, statuses: [1, 2] }, { size: 100 });
      processData = _processData;
      qcTasks = _qcTasks;
    } else if (canProjectFinished) {
      const {
        data: { data: _processData },
      } = await queryTaskApi({ fullProjectCode: projectCode, size: 100, page: 1 });
      const {
        data: { data: _qcTasks },
      } = await getQcTasks({ fullProjectCode: projectCode, size: 200, page: 1 });
      processData = _processData;
      qcTasks = _qcTasks;
    }

    const {
      data: { total: finishResultTotal },
    } = await getProjectFinishReasonList({ size: 1, page: 1, status: 1 });
    const dataSource = [];
    processData
      .filter(({ status }) => status === 1 || status === 2 || status === 3)
      .forEach(({ taskCode, status, processSeq, processName, workstation, operators, id, sopTaskId, sopTaskCode }) => {
        const statusMap = {
          1: 'unStart',
          2: 'running',
          3: 'pause',
        };
        dataSource.push({
          id: id || sopTaskId,
          code: taskCode || sopTaskCode,
          status: statusMap[status],
          processName,
          processSeq,
          workstation: workstation && workstation.name,
          operators:
            operators &&
            operators
              .filter(({ fake }) => fake === false)
              .map(({ name }) => name)
              .join('、'),
          type: '生产任务',
          path: configHasSOP() ? `/cooperate/SOPTask/detail/${sopTaskId}` : `/cooperate/prodTasks/detail/${id}`,
        });
      });
    qcTasks
      .filter(({ status }) => status === 0 || status === 1)
      .forEach(({ code, status, operatorName, task }) => {
        const { processSeq, processName, workstation, id } = task || {};
        const statusMap = {
          0: 'unStart',
          1: 'running',
        };
        dataSource.push({
          id,
          code,
          status: statusMap[status],
          processName: processName || replaceSign,
          processSeq: processSeq || replaceSign,
          workstation: workstation && workstation.name,
          operators: operatorName || replaceSign,
          type: '质检任务',
          path: `/qualityManagement/qcTask/detail/${code}`,
        });
      });
    if (dataSource.length > 0 || finishResultTotal > 0) {
      openModal({
        children: (
          <FinishProjectModal
            dataSource={dataSource}
            ref={inst => (this.finishForm = inst)}
            updateStatusFn={updateStatusFn}
          />
        ),
        title: '结束项目',
        okType: 'danger',
        okText: '结束',
        onOk: () => {
          this.finishForm.submit();
        },
      });
    } else {
      confirm({
        title: '确定结束该项目吗?',
        onOk: updateStatusFn,
        iconType: 'exclamation-circle',
        okText: '确定',
        cancelText: '取消',
      });
    }
  };

  verifyProjectCancel = () => {
    const { projectCode } = this.props;
    cancelProjectVerify(projectCode).then(res => {
      const { hasSubProject, canSubProjectBeAborted } = _.get(res, 'data.data') || {};
      this.setState({ hasSubProject, canSubProjectBeAborted });

      this.getCancelText(hasSubProject, canSubProjectBeAborted);
    });
  };

  getCancelText = (hasSubProject, canSubProjectBeAborted) => {
    const { projectCode } = this.props;

    // 如果有非取消状态的子项目且已不可取消，则弹层提示取消失败
    if (hasSubProject && !canSubProjectBeAborted) {
      this.setState({
        title: '取消项目失败，该项目有不可取消的子项目',
        canProjectBeAborted: false,
        showPopConfirm: true,
      });
      return;
    }

    // 如果有非取消状态的子项目且可以取消，则弹层提示同时取消。
    if (hasSubProject && canSubProjectBeAborted) {
      this.setState({
        title: '取消项目后，该项目的子项目也会被取消，确定取消项目吗？',
        canProjectBeAborted: true,
        showPopConfirm: true,
      });
      return;
    }

    // 如果没有非取消状态的子项目，则弹层提示二次确认
    this.setState({
      title: `取消项目${projectCode}吗？`,
      canProjectBeAborted: true,
      showPopConfirm: true,
    });
  };

  render() {
    const { text, updateStatusFn, style, iconType, useIcon, isGcIcon, projectCategory } = this.props;
    const { showPopConfirm, title, canProjectBeAborted } = this.state;

    if (text === '取消' && showPopConfirm && canProjectBeAborted) {
      return (
        <PopConfirmWithCustomButton
          text={title}
          onConfirm={async () => {
            await updateStatusFn();
            this.setState({ showPopConfirm: false });
          }}
          onCancel={() => {
            this.setState({ showPopConfirm: false });
          }}
          okText={'取消'}
          cancelText={'暂不取消'}
          visible
          placement={'topRight'}
        >
          {useIcon ? (
            <span>
              <ActionButton style={actionButtonBaseStyle} isGcIcon={isGcIcon} iconType={iconType} text={text} />
            </span>
          ) : (
            <span style={textBaseStyle}>{text}</span>
          )}
        </PopConfirmWithCustomButton>
      );
    }

    if (text === '取消' && showPopConfirm && !canProjectBeAborted) {
      return (
        <PopConfirmWithCustomButton
          text={title}
          onConfirm={() => {
            this.setState({ showPopConfirm: false });
          }}
          okText={'知道了'}
          visible
          placement={'topRight'}
        >
          {useIcon ? (
            <span>
              <ActionButton style={actionButtonBaseStyle} isGcIcon={isGcIcon} iconType={iconType} text={text} />
            </span>
          ) : (
            <span style={textBaseStyle}>{text}</span>
          )}
        </PopConfirmWithCustomButton>
      );
    }

    if (text !== '取消' && showPopConfirm) {
      return this.renderPopover();
    }

    return (
      <span
        onClick={async () => {
          if (text === '取消') {
            this.verifyProjectCancel();
          } else if (text === '结束') {
            await this.openFinishModal(this.props);
          } else {
            const res = await updateStatusFn();
            const { data } = res || {};
            const { code, description: message } = data || {};
            if (code && message) {
              this.setState({
                showPopConfirm: true,
                error: {
                  code,
                  message,
                },
              });
            }
          }
        }}
        style={style}
      >
        {useIcon ? (
          <span>
            <ActionButton style={actionButtonBaseStyle} isGcIcon={isGcIcon} iconType={iconType} text={text} />
          </span>
        ) : (
          <Link style={textBaseStyle}>{text}</Link>
        )}
      </span>
    );
  }
}

UpdateStatusForProject.contextTypes = {
  router: PropTypes.object,
};

export default UpdateStatusForProject;
