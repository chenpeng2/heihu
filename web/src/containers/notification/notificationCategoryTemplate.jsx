import React, { Component } from 'react';
import classNames from 'classnames';

import {
  NotificationModuleIcon,
} from 'src/containers/notification';
import { Radio } from 'antd';

import styles from './styles.scss';

const RadioGroup = Radio.Group;

type Props = {
  data: {
    receive: boolean,
  },
  onReceiveSettingChange: () => {},
};

class NotificationCategoryTemplate extends Component {
  props: Props;
  state = {};

  render() {
    const { data } = this.props;
    const { id, content, title, name, configurable, receive } = data || {};

    return (
      <div style={{ fontSize: 14, display: 'flex', flexDirection: 'column', padding: '23px 20px', borderBottom: '1px solid #F1F2F5' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <NotificationModuleIcon iconStyle={{ fontSize: 20 }} data={data} />
          <div style={{ color: 'rgba(0, 0, 0, 0.4)' }}>{name}</div>
          <div className={classNames(styles.setting, configurable ? '' : styles.unconfigurableSetting)}>
            <RadioGroup disabled={!configurable} value={receive ? 1 : 0} onChange={(e) => this.props.onReceiveSettingChange(e, [id])}>
              <Radio value={1}>接收</Radio>
              <Radio value={0}>不接收</Radio>
            </RadioGroup>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div>{title}</div>
          <div style={{ color: 'rgba(0, 0, 0, 0.4)' }}>{content}</div>
        </div>
      </div>
    );
  }
}

export default NotificationCategoryTemplate;
