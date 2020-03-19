import React, { Component, Fragment } from 'react';
import { stringEllipsis } from 'utils/string';
import PropTypes from 'prop-types';
import { replaceSign } from 'src/constants';
import { Button, message, Popconfirm, Tooltip } from 'src/components';
import { connect } from 'react-redux';
import openModal, { closeModal } from 'components/modal';
import { Icon, ItemHeader, Link } from 'components';
import { thousandBitSeparator } from 'utils/number';
import { format } from 'utils/time';
import { blacklakeGreen } from 'styles/color';
import { arrayIsEmpty, arrayRemoveDuplicates } from 'utils/array';
import {
  lockTask,
  lockInjectTask,
  unlockTask,
  unlockInjectTask,
  cancelTask,
  cancelInjectTask,
} from 'src/services/schedule';
import { getTransferApplyFromTask } from 'services/cooperate/materialRequest';
import { PRODUCE_STATUS_MAP, STATUS_MAP } from '../../../constants';
import styles from './styles.scss';

const AntModal = openModal.AntModal;

class ProducePlanDetail extends Component {
  props: {
    task: {},
    style: {},
    onIconClick: () => {},
    onEditClick: () => {},
    onDetailClick: () => {},
    fetchData: () => {},
    inPage: string,
    disabled: boolean,
  };
  state = {};

  lockTask = async () => {
    const { task, fetchData } = this.props;
    if (task.type === 'injectTask') {
      await lockInjectTask(task.taskCode);
    } else {
      await lockTask(task.taskCode);
    }
    message.success('锁定成功！');
    fetchData();
    closeModal();
  };

  unlockTask = async () => {
    const { task, fetchData } = this.props;
    if (task.type === 'injectTask') {
      await unlockInjectTask(task.taskCode);
    } else {
      await unlockTask(task.taskCode);
    }
    message.success('解锁成功！');
    fetchData();
    closeModal();
  };

  cancelTask = async () => {
    const { task, fetchData } = this.props;
    const {
      data: { data: materialRequest },
    } = await getTransferApplyFromTask([task.taskCode], { status: 1 });
    const handleCancel = async () => {
      if (task.type === 'injectTask') {
        await cancelInjectTask(task.taskCode);
      } else {
        await cancelTask(task.taskCode);
      }

      message.success('取消成功！');
      fetchData();
      closeModal();
    };

    if (!arrayIsEmpty(materialRequest)) {
      const codes = arrayRemoveDuplicates(materialRequest.map(({ code }) => code)).join('，');
      AntModal.confirm({
        title: '确定取消?',
        content: `该任务关联以下转移申请：${codes},确定取消这个任务吗？`,
        okText: '取消',
        cancelText: '暂不取消',
        onOk: handleCancel,
      });
      return;
    }
    handleCancel();
  };

  handleEdit = async () => {
    const { onEditClick } = this.props;
    // const {
    //   data: { data: materialRequest },
    // } = await getTransferApplyFromTask([task.taskCode], { status: 1 });
    // if (!arrayIsEmpty(materialRequest)) {
    //   const codes = arrayRemoveDuplicates(materialRequest.map(({ code }) => code)).join('，');
    //   AntModal.confirm({
    //     title: '确定保存？',
    //     content: `该任务关联以下转移申请：${codes},保存后会重新创建转移申请并占用库存，存在占用失败的风险，确定保存这个任务吗？`,
    //     okText: '保存',
    //     cancelText: '暂不保存',
    //     onOk: onEditClick,
    //   });
    //   return;
    // }
    onEditClick();
  };

  renderRow = ({ title, content }) => {
    const { changeChineseToLocale } = this.context;
    return (
      <div className={styles.row}>
        <div className={styles.title}>{changeChineseToLocale(title)}</div>
        <div className={styles.content}>{typeof content === 'string' ? changeChineseToLocale(content) : content}</div>
      </div>
    );
  };

  render() {
    const {
      task,
      task: {
        purchaseOrderCode,
        taskCode,
        workOrderCode,
        processCode,
        processName,
        status,
        produceStatus,
        injectSubTasks,
        amount,
        planAmount,
        mouldUnit,
        startTimePlanned,
        endTimePlanned,
        startTimeReal,
        endTimeReal,
        outMaterial,
        isMouldConflict,
        mouldConflicts,
        reason,
      },
      style,
      disabled: _disabled,
    } = this.props;
    console.log(task);
    const { name, needDownTime, downTime, needPrepareTime, prepareTime, needUpTime, upTime } = mouldUnit || {};
    const disabled = _disabled;
    let rowItem = [
      {
        title: '订单编号',
        content: purchaseOrderCode || replaceSign,
      },
      {
        title: '工单编号',
        content: workOrderCode || replaceSign,
      },
      {
        title: '工序产出物料',
        content: (
          <Tooltip
            text={
              Array.isArray(outMaterial) && outMaterial.length
                ? outMaterial.map(e => `${e.code}/${e.name}`).join(',')
                : replaceSign
            }
            length={35}
          />
        ),
      },
      {
        title: '工序',
        content: `${processCode}/${processName}`,
      },
      {
        title: '任务编号',
        content: taskCode,
      },
    ];
    if (mouldUnit) {
      rowItem = rowItem.concat([
        {
          title: '模具',
          content: (
            <Fragment>
              <span style={{ color: isMouldConflict ? '#FF3824' : '#000' }}>{name}</span>
              {isMouldConflict ? (
                <span style={{ paddingLeft: 5, color: 'rgba(0, 0, 0, 0.6)' }}>
                  {mouldConflicts.map(e => e.desc).join(',')}
                </span>
              ) : null}
            </Fragment>
          ),
        },
        {
          title: '需要上模',
          content: (
            <Fragment>
              {needUpTime ? '是' : '否'}{' '}
              {needUpTime ? <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>上模时间：{upTime}分钟</span> : null}
            </Fragment>
          ),
        },
        {
          title: '需要调机',
          content: (
            <Fragment>
              {needPrepareTime ? '是' : '否'}{' '}
              {needPrepareTime ? (
                <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>调机时间：{prepareTime}分钟</span>
              ) : null}
            </Fragment>
          ),
        },
        {
          title: '需要下模',
          content: (
            <Fragment>
              {needDownTime ? '是' : '否'}{' '}
              {needDownTime ? <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>下模时间：{downTime}分钟</span> : null}
            </Fragment>
          ),
        },
      ]);
    }

    rowItem = rowItem.concat([
      {
        title: '状态',
        content: (
          <Fragment>
            {status === 'DISTRIBUTED'
              ? PRODUCE_STATUS_MAP[produceStatus] && PRODUCE_STATUS_MAP[produceStatus].display
              : STATUS_MAP[status] && STATUS_MAP[status].display}
            {reason ? (
              <span style={{ paddingLeft: 10, color: PRODUCE_STATUS_MAP[produceStatus].color }}>({reason})</span>
            ) : null}
          </Fragment>
        ),
      },
      {
        title: '生产进度',
        content:
          task.type === 'injectTask'
            ? injectSubTasks
                .map(({ amount, realAmount }) => `${thousandBitSeparator(realAmount)}／${thousandBitSeparator(amount)}`)
                .join(',')
            : `${thousandBitSeparator(amount)} / ${thousandBitSeparator(planAmount)}`,
      },
      {
        title: '计划时间',
        content: `${format(startTimePlanned)}～${format(endTimePlanned)}`,
      },
      {
        title: '实际时间',
        content: `${startTimeReal ? format(startTimeReal) : replaceSign}～
        ${(produceStatus === 4 || produceStatus === 'DONE') && endTimeReal ? format(endTimeReal) : replaceSign}`,
      },
    ]);

    return (
      <div className={styles.planDetailGanttContainer} style={style}>
        <div className={styles.header}>
          任务详情
          {/* <span className={styles.detailLink} onClick={() => onDetailClick()}>
            查看
          </span> */}
          {status === 'DISTRIBUTED' ? null : (
            <Fragment>
              <Link disabled={disabled} onClick={this.handleEdit}>
                <span className={styles.detailLink}>
                  <Icon style={{ paddingRight: 4 }} type="edit" />
                  编辑
                </span>
              </Link>
              {status === 'SCHEDULED' ? (
                <Link disabled={disabled} onClick={this.lockTask}>
                  <span className={styles.detailLink}>
                    <Icon iconType="gc" style={{ paddingRight: 4 }} type="suodingduiyingjiesuo" />
                    锁定
                  </span>
                </Link>
              ) : (
                <Link disabled={disabled} onClick={this.unlockTask}>
                  <span className={styles.detailLink}>
                    <Icon iconType="gc" style={{ paddingRight: 4 }} type="jiesuo" />
                    解锁
                  </span>
                </Link>
              )}
              <Popconfirm title="确认要取消吗？" onConfirm={this.cancelTask} okText="确认" cancelText="取消">
                <Link disabled={disabled}>
                  <span className={styles.detailLink}>
                    <Icon style={{ paddingRight: 4 }} color={blacklakeGreen} type="close-circle-o" />
                    取消
                  </span>
                </Link>
              </Popconfirm>
            </Fragment>
          )}
        </div>
        <div className={styles.content}>
          <div className={styles.contentContainer}>{rowItem.map(e => this.renderRow(e))}</div>
        </div>
      </div>
    );
  }
}

ProducePlanDetail.contextTypes = {
  router: PropTypes.object,
  changeChineseToLocale: () => {},
};

const mapStateToProps = ({ gantt: { inPage } }) => ({
  inPage,
});

export default connect(mapStateToProps)(ProducePlanDetail);
