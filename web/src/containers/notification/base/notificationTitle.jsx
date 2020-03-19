import React, { Component } from 'react';

import { Badge } from 'components';
import { error } from 'src/styles/color';

import styles from '../styles.scss';

type Props = {
  data: {},
};

class NotificationTitle extends Component {
  props: Props;
  state = {};

  render() {
    const {
      data: { body, status },
    } = this.props;
    const { title } = body || {};

    return (
      <div className={styles.notificationTitle}>
        {status ? null : <Badge.AntBadge dot color={error} />}
        {title}
      </div>
    );
  }
}

export default NotificationTitle;
