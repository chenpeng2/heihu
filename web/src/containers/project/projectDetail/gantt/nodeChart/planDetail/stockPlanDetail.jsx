import React, { Component } from 'react';
import { stringEllipsis } from 'utils/string';
import { Icon, ItemHeader } from 'components';
import { replaceSign } from 'src/constants';
import { thousandBitSeparator } from 'utils/number';
import { connect } from 'react-redux';
import styles from './styles.scss';

class ProducePlanDetail extends Component {
  props: {
    plan: {},
    style: {},
    onEditClick: () => {},
    inPage: string,
  };
  state = {};

  render() {
    const { plan, inPage, plan: { amount }, style, onEditClick } = this.props;
    const { productOrderBomNode: { material } } = plan;
    return (
      <div className={styles.planDetailGanttContainer} style={style}>
        <div className={styles.header}>库存详情</div>
        <div className={styles.content}>
          <ItemHeader
            style={{ marginLeft: 0, marginBottom: 20 }}
            title={
              <div>
                <span style={{ fontSize: 14, color: '#000' }}>详情</span>
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
            <div className={styles.row}>
              启用库存量：{thousandBitSeparator(amount) || replaceSign} {material.unit.name}
            </div>
          </div>
          {/* <div className={styles.contentContainer}>
            {lgOperatorList && lgOperatorList.length ? (
              <div className={styles.row}>物流负责人：{lgOperatorList.reduce((a, b) => `${a} ${b.name}`, '')}</div>
            ) : null}
          </div> */}
        </div>
      </div>
    );
  }
}

export default connect(({ gantt: { inPage } }) => ({ inPage }))(ProducePlanDetail);
