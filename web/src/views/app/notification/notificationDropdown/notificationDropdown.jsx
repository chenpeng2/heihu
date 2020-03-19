import React, { Component } from 'react';
import { genAuthHeaders } from 'store/helpers';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Popover, Card } from 'antd';
import _ from 'lodash';

import LocalStorage from 'utils/localStorage';
import * as constants from 'constants';
import MyStore from 'store';
import { Icon, Link, Badge, PlainText } from 'src/components';
import { setNotificationMenuState } from 'src/store/redux/actions';
import { queryUnreadMessage, queryMessageList, readAllMessages } from 'src/services/message';
import CONFIGURATION from 'src/configs/conf';
import { NotificationCard } from 'src/containers/notification/index';

import styles from './styles.scss';

const FlexRow = {
  display: 'flex',
  alignItems: 'center',
};

type Props = {
  viewer: { id: string },
  notificationMenuState: {
    visible: boolean,
  },
};

export const closeNotificationDropDown = () => {
  MyStore.dispatch(setNotificationMenuState({ visible: false }));
};

class NotificationDropDown extends Component {
  props: Props;
  state = {
    topFiveUnReadMessages: [],
    unreadCount: 0,
    visible: _.get(this.props, 'notificationMenuState.visible'),
  };

  async componentDidMount() {
    await this.fetchData();

    if (!CONFIGURATION.isDev) {
      this.intervalId = setInterval(() => {
        this.queryUnreadCount().catch(err => {
          clearInterval(this.intervalId);
        });
      }, 10000);
    }
  }

  componentWillUnmount() {
    if (!CONFIGURATION.isDev) {
      clearInterval(this.intervalId);
    }
  }

  queryUnreadCount = async () => {
    const token = LocalStorage.get(constants.FIELDS.TOKEN_NAME);

    if (token && token !== 'expired') {
      const {
        data: { total },
      } = await queryUnreadMessage();
      this.setState({ unreadCount: total });
    }
  };

  fetchData = async () => {
    const {
      data: { data: topFiveUnReadMessages, unreadCount },
    } = await queryMessageList({ page: 1, size: 5, status: 0 });
    this.setState({ topFiveUnReadMessages, unreadCount });
  };

  handleVisibleChange = visible => {
    this.setState({ visible }, () => {
      if (visible) {
        this.fetchData();
      }
    });
  };

  renderButton = () => {
    const { router } = this.context;
    return (
      <Link
        style={{ cursor: 'pointer', fontSize: 14, width: '100%' }}
        onClick={() => {
          this.setState({ visible: false }, () => {
            router.history.push('/messages');
          });
        }}
      >
        查看全部
      </Link>
    );
  };

  renderNotificationMenu = UnReadMessages => {
    return (
      <div className={styles.menuContainer}>
        {UnReadMessages && UnReadMessages.length ? (
          UnReadMessages.map(node => {
            return (
              <Card bordered={false} key={node.id}>
                <NotificationCard goDetailPage data={node} />
              </Card>
            );
          })
        ) : (
          <div
            style={{
              fontSize: 14,
              textAlign: 'center',
              height: 54,
              lineHeight: '54px',
              color: 'rgba(0, 0, 0, 0.4)',
              borderBottom: '1px solid #F1F2F5',
            }}
          >
            <PlainText text="没有新通知" />
          </div>
        )}
        <Card>{this.renderButton()}</Card>
      </div>
    );
  };

  readMessages = async () => {
    await readAllMessages().then(({ data: { statusCode } }) => {
      if (statusCode === 200) {
        this.fetchData();
      }
    });
  };

  renderNotificationTitle = () => {
    const { unreadCount } = this.state;

    return (
      <div style={{ ...FlexRow, justifyContent: 'space-between' }}>
        <PlainText text="通知" style={{ fontSize: 22 }} />
        <div>
          <PlainText
            text="{unreadCount}条未读"
            intlParams={{ unreadCount }}
            style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.4)' }}
          />
          <Link style={{ fontSize: 14, paddingLeft: 10 }} disabled={unreadCount === 0} onClick={this.readMessages}>
            全部标记为已读
          </Link>
        </div>
      </div>
    );
  };

  render() {
    const { unreadCount, visible, topFiveUnReadMessages } = this.state;
    const title = this.renderNotificationTitle();
    const content = this.renderNotificationMenu(topFiveUnReadMessages);

    return (
      <Popover
        autoAdjustOverflow
        overlayClassName={styles.notificationDropdown}
        placement="bottom"
        title={title}
        visible={visible}
        content={content}
        trigger="click"
        onVisibleChange={this.handleVisibleChange}
      >
        <div>
          <div className={styles.notificationDropdownBadgeContainer}>
            <Badge.AntBadge count={unreadCount}>
              <Icon iconType="gc" type="tongzhi" style={{ fontSize: '20px' }} />
            </Badge.AntBadge>
          </div>
        </div>
      </Popover>
    );
  }
}

NotificationDropDown.contextTypes = {
  router: PropTypes.object,
};

export default connect(({ notificationMenuState }) => ({ notificationMenuState }))(NotificationDropDown);
