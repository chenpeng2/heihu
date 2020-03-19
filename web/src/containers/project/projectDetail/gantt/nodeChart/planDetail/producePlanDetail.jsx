import React, { Component } from 'react';
import { stringEllipsis } from 'utils/string';
import PropTypes from 'prop-types';
import { replaceSign } from 'src/constants';
import { Button } from 'src/components';
import { connect } from 'react-redux';
import { thousandBitSeparator } from 'utils/number';
import { Icon, ItemHeader, Link } from 'components';
import { format } from 'utils/time';
import classNames from 'classnames';
import styles from './styles.scss';

class ProducePlanDetail extends Component {
  props: {
    task: {},
    style: {},
    onIconClick: () => {},
    onEditClick: () => {},
    onDetailClick: () => {},
    inPage: string,
    disabled: boolean,
  };
  state = {};

  render() {
    const {
      task,
      task: { taskCode, projectCode, status, statusDisplay, operators, workstation, startTimePlanned, endTimePlanned, startTimeReal, endTimeReal },
      style,
      disabled: _disabled,
      onEditClick,
      onDetailClick,
      inPage, // 如果为productOrderSchedule页面下的甘特图，需要隐藏一些操作
    } = this.props;
    console.log(task);
    const disabled = inPage === 'productOrderSchedule' || _disabled;

    return (
      <div className={styles.planDetailGanttContainer} style={style}>
        <div className={styles.header}>
          任务详情
          <span className={styles.detailLink} onClick={() => onDetailClick()}>
            查看
            <Icon type="right" />
          </span>
        </div>
        <div className={styles.content}>
          {/* <div className={styles.titleContainer}>
            <div className={styles.title}>{material.code}</div>
            <div className={styles.subtitle}>{stringEllipsis(material.name, 23)}</div>
          </div> */}
          <div className={styles.contentContainer}>
            <div className={styles.row}>
              <div className={styles.title}>任务编号</div>
              <div className={styles.content}>{taskCode}</div>
            </div>
            <div className={styles.row}>
              <div className={styles.title}>项目编号</div>
              <div className={styles.content}>{projectCode}</div>
            </div>
            <div className={styles.row}>
              <div className={styles.title}>状态</div>
              <div className={styles.content}>{statusDisplay}</div>
            </div>
            <div className={styles.row}>
              <div className={styles.title}>负责人</div>
              <div className={styles.content}>{operators && operators.length ? operators.map(e => e.name).join(',') : replaceSign}</div>
            </div>
            <div className={styles.row}>
              <div className={styles.title}>工位</div>
              <div className={styles.content}>{workstation ? workstation.name : replaceSign}</div>
            </div>
            <div className={styles.row}>
              <div className={styles.title}>计划时间</div>
              <div className={styles.content}>
                {startTimePlanned ? format(startTimePlanned) : replaceSign}～{endTimePlanned ? format(endTimePlanned) : replaceSign}
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.title}>实际时间</div>
              <div className={styles.content}>
                {startTimeReal ? format(startTimeReal) : replaceSign}～{status === 4 && endTimeReal ? format(endTimeReal) : replaceSign}
              </div>
            </div>
          </div>
          {!disabled ? (
            <div style={{ display: 'flex' }}>
              <Button style={{ margin: '0 auto', width: 114 }} onClick={onEditClick}>
                编辑
              </Button>
            </div>
          ) : null}
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
