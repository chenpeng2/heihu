import React, { Component } from 'react';

import
  moment,
  {
    showYesterdayTime,
    formatUnixMoment,
    showTodayTime,
    isYesterday,
    isToday,
  }
from 'src/utils/time';

import styles from '../styles.scss';

type Props = {
  data: {},
};

class CategoryTitle extends Component {
  props: Props;
  state = {};

  formatDate = _date => {
    if (!_date) return;
    const date = formatUnixMoment(_date);
    if (isToday(date)) {
      return showTodayTime(date);
    } else if (isYesterday(date)) {
      return showYesterdayTime(date);
    }
    return moment(date).format('YYYY/MM/DD HH:mm:ss');
  };

  render() {
    const { data: { categoryName, moduleName, createdAt } } = this.props;
    const dateAfterFormat = this.formatDate(createdAt);

    return (
      <div className={styles.notificationCategoryTitle}>
        <div>
          { moduleName ? `${moduleName} | ${categoryName}` : categoryName }
        </div>
      { createdAt ? <div style={{ marginLeft: 30, color: 'rgba(0, 0, 0, 0.4)' }}>{ dateAfterFormat }</div> : null }
      </div>
    );
  }
}

export default CategoryTitle;
