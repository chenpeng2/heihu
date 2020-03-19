import React, { Component } from 'react';

import styles from '../styles.scss';

type Props = {
  data: {},
};

class NotificationContent extends Component {
  props: Props;
  state = {};

  render() {
    const { data: { body } } = this.props;
    const { content } = body || {};

    return (
      <div className={styles.notificationContent}>
        { content }
      </div>
    );
  }
}

export default NotificationContent;
