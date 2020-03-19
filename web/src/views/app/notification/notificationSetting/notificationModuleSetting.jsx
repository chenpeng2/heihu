import React, { Component } from 'react';
import _ from 'lodash';
import classNames from 'classnames';

import { Radio, message, withForm } from 'components';
import {
  NotificationModuleIcon,
  NotificationCategoryTemplate,
} from 'src/containers/notification';
import { setLocation } from 'utils/url';
import { getQuery } from 'src/routes/getRouteParams';
import { updateMessageCategorySetting, queryMessageByCategory } from 'src/services/message';
import { MODULES } from 'src/containers/notification/utils';

import styles from './styles.scss';

const RadioGroup = Radio.Group;

type Props = {
  form: any,
  history: {
    location: {},
  },
  match: any,
};

class NotificationModuleSetting extends Component {
  props: Props;
  state = {
    data: [],
    module: null,
    total: 0,
    receiveTotal: 0,
  };

  componentDidMount() {
    const { match } = this.props;
    const query = getQuery(match);
    this.setState({ ...query }, () => {
      this.fetchData({ ...query });
    });
  }

  fetchData = async params => {
    const { match } = this.props;
    const query = getQuery(match);
    const { data: { data } } = await queryMessageByCategory({ ...query, ...params });
    this.formatData(data);
  };

  formatData = data => {
    if (Array.isArray(data) && data.length > 0) {
      const total = data.length;
      const receiveTotal = data.filter(({ receive }) => receive).length;

      this.setState({ receiveTotal, total });
    }

    this.setState({ data });
  };

  onReceiveSettingChange = async (e, ids, bulkSetting) => {
    // bulkSetting: 用来标记是否点击批量设置，一旦点击过单个设置之后，则批量设置不选中
    const { data: { statusCode } } = await updateMessageCategorySetting(ids && ids.map(id => ({ receive: e.target.value, id })));

    if (statusCode === 200) {
      message.success('设置成功！');

      if (!bulkSetting) {
        // 如果不是批量设置，则要清空上次选择
        this.props.form.resetFields(['bulkSetting']);
      }

      // 修改后将数据更新
      this.fetchData();
    }
  };

  renderModule = module => {
    const { receiveTotal, total, data } = this.state;
    const { form: { getFieldDecorator } } = this.props;

    // 过滤出所有可配置的消息类型id（批量设置时需要），且当ids长度为0时则表明该分类下都不可配置
    const ids = data && data.filter(({ configurable }) => configurable).map(({ id }) => id);

    return (<div
      className={classNames(!receiveTotal ? styles.unreceivedModule : '', styles.moduleRow)}
    >
      <NotificationModuleIcon iconStyle={{ fontSize: 32, marginRight: 2 }} data={{ module }} />
      <div className={styles.moduleName}>{MODULES[module]}</div>
      <div className={styles.moduleReceiveTip}>
        {receiveTotal === 0 ?
          '不接收通知' : `共${total}类通知，现接收${receiveTotal}类通知`
        }
      </div>
      <div className={styles.bulkSetting}>
        <span>批量设置</span>
        {getFieldDecorator('bulkSetting')(
          <RadioGroup disabled={ids && ids.length === 0} onChange={(e) => this.onReceiveSettingChange(e, ids, true)} >
            <Radio value={1}>接收</Radio>
            <Radio value={0}>不接收</Radio>
          </RadioGroup>,
        )}
      </div>
    </div>);
  };

  render() {
    const { data, module } = this.state;

    return (
      <div>
        {this.renderModule(module)}
        {data && data.map(template => (<NotificationCategoryTemplate
          data={template}
          onReceiveSettingChange={this.onReceiveSettingChange}
        />))}
      </div>
    );
  }
}

export default withForm({}, NotificationModuleSetting);
