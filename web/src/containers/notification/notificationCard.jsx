import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';

import {
  NotificationModuleIcon,
  NotificationCategoryTitle,
  NotificationTitle,
  NotificationContent,
} from 'src/containers/notification';
import { readMessages } from 'src/services/message';

import { MODULES } from './utils';
import { getNextPageUrl } from './helper/navigationHelper';
import { messageWarn } from './helper/getWarnHelper';

import styles from './styles.scss';

type Props = {
  data: {},
  goDetailPage: boolean,
  history: any,
  fetchData: () => {},
};

class NotificationCard extends Component {
  props: Props;
  state = {};

  goNextPage = () => {
    const { data } = this.props;
    const { body, category, id, status } = data || {};
    const { meta } = body || {};
    const { entityId, entityCode } = meta || {};
    return async () => {
      if (!entityId && typeof category !== 'number') {
        messageWarn('该任务不存在');
        return null;
      }

      const nextPageUrl = getNextPageUrl({ ...meta, category }, { taskId: entityId, entityCode });

      if (status === 0) {
        await readMessages([id])
          .then(() => {
            if (!nextPageUrl) {
              // 如果不做跳转的即刷新列表
              if (typeof fetchData === 'function') this.props.fetchData();
            }
          })
          .catch(err => console.log(err));
      }
      if (nextPageUrl) {
        if (nextPageUrl.pathname && nextPageUrl.search) {
          const { pathname, search } = nextPageUrl;
          return this.props.history.push({ pathname, search });
        }
        return this.props.history.push({ pathname: nextPageUrl, query: { random: Math.random() } });
      }
      return null;
    };
  };

  render() {
    // category: 通知类型; module: 通知所属业务模块;
    const {
      data: { module, categoryName, body, createdAt, status },
      goDetailPage,
    } = this.props;
    const data = {
      module,
      moduleName: MODULES[module],
      categoryName,
      body,
      createdAt,
      status,
    };

    return (
      <div
        className={classNames(status ? styles.readMessages : styles.unreadMessages, styles.notificationCardWrapper)}
        onClick={goDetailPage ? this.goNextPage() : null}
      >
        <div className={styles.notificationCard}>
          <div className={styles.categoryTitle}>
            <NotificationModuleIcon data={data} />
            <NotificationCategoryTitle data={data} />
          </div>
          <div className={styles.notificationPreview}>
            <NotificationTitle data={data} />
            <NotificationContent data={data} />
          </div>
        </div>
      </div>
    );
  }
}

NotificationCard.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(NotificationCard);
