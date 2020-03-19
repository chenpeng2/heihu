import React, { Component } from 'react';

import { Icon } from 'components';

import { ICON } from '../utils';
import styles from '../styles.scss';

type Props = {
  data: {},
  iconStyle: {},
};

class NotificationModuleIcon extends Component {
  props: Props;
  state = {};

  render() {
    const { data: { module }, iconStyle } = this.props;
    const icon = ICON[module] ? ICON[module].name : null;
    const defaultIconStyle = {
      fontSize: 20,
      color: ICON[module] ? `${ICON[module].color}` : 'black',
    };

    return (
      <div className={styles.notificationModuleIcon}>
        <Icon style={{ ...defaultIconStyle, ...iconStyle }} iconType="gc" type={icon} />
      </div>
    );
  }
}

export default NotificationModuleIcon;
