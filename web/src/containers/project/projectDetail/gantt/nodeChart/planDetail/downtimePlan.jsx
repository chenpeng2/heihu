import React, { Component, Fragment } from 'react';
import { stringEllipsis } from 'utils/string';
import PropTypes from 'prop-types';
import { replaceSign } from 'src/constants';
import { Button, message, Popconfirm } from 'src/components';
import { connect } from 'react-redux';
import { closeModal } from 'components/modal';
import { Icon, ItemHeader, Link } from 'components';
import { format } from 'utils/time';
import { blacklakeGreen } from 'styles/color';
import classNames from 'classnames';
import { lockTask, unlockTask, cancelTask } from 'src/services/schedule';
import styles from './styles.scss';

const TASK_CATEGORY_MAP = {
  repair: '维修任务',
  maintain: '保养任务',
  check: '点检任务',
};

const TASK_STATUS_MAP = {
  1: '审批中',
  2: '未开始',
  3: '执行中',
  4: '已暂停',
  5: '已结束',
  6: '已取消',
  7: '已驳回',
};

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

  render() {
    const {
      task: { taskCode, taskCategory, taskStatus },
      style,
      disabled: _disabled,
      inPage, // 如果为productOrderSchedule页面下的甘特图，需要隐藏一些操作
    } = this.props;
    const disabled = inPage === 'productOrderSchedule' || _disabled;

    return (
      <div className={styles.planDetailGanttContainer} style={style}>
        <div className={styles.header}>停机计划详情</div>
        <div className={styles.content}>
          <div className={styles.contentContainer}>
            <div className={styles.row}>
              <div className={styles.title}>任务编号</div>
              <div className={styles.content}>{taskCode}</div>
            </div>
            <div className={styles.row}>
              <div className={styles.title}>任务类型</div>
              <div className={styles.content}>{TASK_CATEGORY_MAP[taskCategory]}</div>
            </div>
            <div className={styles.row}>
              <div className={styles.title}>状态</div>
              <div className={styles.content}>{TASK_STATUS_MAP[taskStatus]}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ProducePlanDetail.contextTypes = {
  router: PropTypes.object,
};

const mapStateToProps = ({ gantt: { inPage } }) => ({
  inPage,
});

export default connect(mapStateToProps)(ProducePlanDetail);
