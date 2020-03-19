import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { stringEllipsis } from 'utils/string';
import { replaceSign } from 'src/constants';
import { Icon, ItemHeader, Link } from 'components';
import { thousandBitSeparator } from 'utils/number';
import { format } from 'utils/time';
import { connect } from 'react-redux';
import classNames from 'classnames';
import styles from './styles.scss';

class ProducePlanDetail extends Component {
  props: {
    plan: {},
    style: {},
    onIconClick: () => {},
    onEditClick: () => {},
    inPage: string,
  };
  state = {};

  render() {
    const { plan, plan: { amount, operators, endTime }, style, onIconClick, onEditClick, inPage } = this.props;
    const { psTask, productOrderBomNode: { material, productOrder: { id: productOrderId, productOrderNo } } } = plan;
    const isProductOrderSchedule = inPage === 'productOrderSchedule';
    return (
      <div className={styles.planDetailGanttContainer} style={style}>
        <div className={styles.header}>采购详情</div>
        <div className={styles.content}>
          <ItemHeader
            style={{ marginLeft: 0, marginBottom: 20 }}
            title={
              <div>
                <span style={{ fontSize: 14, color: '#000' }}>详情</span>{' '}
                {inPage !== 'productOrderSchedule' ? (
                  <span className={styles.detailLink} onClick={() => onEditClick()}>
                    编辑<Icon type="right" />
                  </span>
                ) : null}
              </div>
            }
          />
          <div className={styles.titleContainer}>
            <div className={styles.title}>{material.code}</div>
            <div className={styles.subtitle}>{stringEllipsis(material.name, 23)}</div>
          </div>
          <div className={styles.contentContainer}>
            {inPage !== 'productOrderSchedule' ? (
              <div className={styles.row}>项目号：{productOrderNo}</div>
            ) : (
              <Link onClick={() => this.context.router.history.push(`/cooperate/productOrders/${productOrderId}/createPlan`)} className={styles.row}>
                项目号：{productOrderNo}
              </Link>
            )}
            <div className={styles.row}>
              采购量：{thousandBitSeparator(amount) || replaceSign} {material.unit.name}
            </div>
            <div className={styles.row}>
              已采购量：{psTask ? thousandBitSeparator(psTask.finishedAmount) : replaceSign} {material.unit.name}
            </div>
            <div className={styles.row}>
              结束时间：{psTask && psTask.finishAt ? format(psTask.finishAt, 'MM/DD HH:mm') : replaceSign}（计划：
              {format(endTime, 'MM/DD HH:mm')}）
            </div>
          </div>
          <div className={styles.contentContainer}>
            {/* <div className={styles.row}>物流主管：{lgOperatorList.reduce((a, b) => `${a} ${b.name}`, '')}</div> */}
            <div className={styles.row}>采购主管：{operators.reduce((a, b) => `${a} ${b.name}`, '')}</div>
          </div>
          <ItemHeader
            style={{ marginLeft: 0 }}
            title={
              <div>
                <span style={{ fontSize: 14, color: '#000' }}>任务</span>
                {inPage !== 'productOrderSchedule' ? (
                  <span
                    className={styles.detailLink}
                    onClick={() => {
                      window.open(`/cooperate/plans/purchase/${plan.id}/createTask`);
                    }}
                  >
                    任务列表<Icon type="right" />
                  </span>
                ) : null}
              </div>
            }
          />
          <div className={styles.contentContainer}>
            {!psTask && (
              <div
                className={classNames(styles.planIcon, isProductOrderSchedule ? styles.planIconGcNoHover : styles.planIconGc)}
                onClick={() => onIconClick()}
              >
                <span>购</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

ProducePlanDetail.contextTypes = {
  router: PropTypes.object,
};

export default connect(({ gantt: { inPage } }) => ({ inPage }))(ProducePlanDetail);
