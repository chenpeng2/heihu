import React, { Component } from 'react';

import { NotificationModuleIcon, NotificationCategoryTitle, NotificationContent } from 'src/containers/notification';
import { Badge, Link } from 'components';
import { MODULES } from './utils';

import styles from './styles.scss';

type Props = {
  data: {},
  children: [],
  onCategoryCardClick: () => {},
  readAllCategoryMessages: () => {},
};

class NotificationCategoryCard extends Component {
  props: Props;
  state = {};

  render() {
    // category: 通知类型; module: 通知所属业务模块; unreadCount: 未读消息数量
    const { data, onCategoryCardClick } = this.props;
    const { module, categoryName, body, createdAt, unreadCount, code } = data || {};
    const message = {
      module,
      moduleName: MODULES[module],
      categoryName,
      body,
      createdAt,
      unreadCount,
    };

    return (
      <div
        onClick={() => onCategoryCardClick(module, code)}
        className={unreadCount ? styles.unreadMessages : styles.readMessages}
      >
        <div className={styles.notificationCategoryCard}>
          <div style={{ display: 'flex' }}>
            <Badge.AntBadge count={unreadCount}>
              <NotificationModuleIcon iconStyle={{ fontSize: 32 }} data={message} />
            </Badge.AntBadge>
            <div className="rightComponent">
              <NotificationCategoryTitle data={message} />
              <NotificationContent data={message} />
            </div>
          </div>
          <div>
            <Link
              onClick={e => {
                e.stopPropagation();
                this.props.readAllCategoryMessages({ module, categoryCode: code });
              }}
              disabled={unreadCount === 0}
            >
              标为已读
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default NotificationCategoryCard;
