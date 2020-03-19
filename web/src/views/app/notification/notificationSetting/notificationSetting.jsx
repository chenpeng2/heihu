import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';

import { Link } from 'components';
import { NotificationModuleIcon } from 'src/containers/notification';
import { queryMessageByCategory } from 'src/services/message';
import { getQuery } from 'src/routes/getRouteParams';
import { MODULES } from 'src/containers/notification/utils';

import styles from './styles.scss';

type Props = {
  match: any,
  data: {},
  history: {
    push: () => {}
  }
};

class NotificationSetting extends Component {
  props: Props;
  state = {
    receiveList: {},
    modules: [],
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    // 拉取所有消息类型，所以没有params
    const {
      data: { data },
    } = await queryMessageByCategory();
    const modules = [];

    if (Array.isArray(data) && data.length > 0) {
      data.forEach(node => {
        const { module } = node;
        if (module) modules.push(module);
      });
      const groupByModule = _.groupBy(data, 'module');
      const receiveList = {};
      Object.keys(groupByModule).forEach(module => {
        const groupById = _.groupBy(groupByModule[module], 'id');

        _.set(receiveList, `${module}.total`, Object.keys(groupById).length);

        // let unreceiveTotal = 0;
        let receiveTotal = 0;
        // let configurableTotal = 0;

        Object.keys(groupById).forEach(id => {
          // const unreceived =
          //   Array.isArray(groupById[id]) &&
          //   groupById[id].filter(x => x && !x.receive);
          const received =
            Array.isArray(groupById[id]) &&
            groupById[id].filter(x => x && x.receive);
          // const configurable =
          //   Array.isArray(groupById[id]) &&
          //   groupById[id].filter(x => x && x.configurable);

          // unreceiveTotal += unreceived && unreceived.length;
          receiveTotal += received && received.length;
          // configurableTotal += configurable && configurable.length;
        });

        // _.set(receiveList, `${module}.unreceiveTotal`, unreceiveTotal);
        _.set(receiveList, `${module}.receiveTotal`, receiveTotal);

        // 统计每一模块下能配置的消息类型总数，至少存在一条可开启批量设置
        // _.set(receiveList, `${module}.configurable`, configurableTotal >= 1);
      });

      this.setState({ receiveList });
    }

    this.setState({ modules: _.uniq(modules) });
  };

  renderModule = (module, i) => {
    const { receiveList } = this.state;
    const receive = receiveList[module].receiveTotal !== 0;

    return (
      <div
        key={i}
        className={classNames(
          !receive ? styles.unreceivedModule : '',
          styles.moduleRow,
        )}
      >
        <NotificationModuleIcon
          iconStyle={{ fontSize: 32, marginRight: 2 }}
          data={{ module }}
        />
        <div className={styles.moduleName}>{MODULES[module]}</div>
        <div className={styles.moduleReceiveTip}>
          {receiveList[module].receiveTotal === 0
            ? '不接收通知'
            : `共${receiveList[module].total}类通知，现接收${
                receiveList[module].receiveTotal
              }类通知`}
        </div>
        <Link
          className={styles.moduleSetting}
          onClick={() => this.props.history.push(`/messages/setting/moduleSetting?module=${module}`)}
        >
          设置
        </Link>
      </div>
    );
  };

  render() {
    const { modules } = this.state;

    return <div>{modules && modules.map((x, i) => this.renderModule(x, i))}</div>;
  }
}

NotificationSetting.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(NotificationSetting);
