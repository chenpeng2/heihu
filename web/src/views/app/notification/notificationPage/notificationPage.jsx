import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Card } from 'antd';

import { Link, Select, withForm, Checkbox, Pagination, PlainText } from 'src/components';
import { NotificationCategoryCard, NotificationCard } from 'src/containers/notification';
import { MODULES } from 'src/containers/notification/utils';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { queryMessageByCategory, queryMessageList, readAllMessages, readMessages } from 'src/services/message';
import { getQuery } from 'src/routes/getRouteParams';
import { setLocation } from 'utils/url';

import styles from './styles.scss';

const Option = Select.Option;
const FlexRow = {
  display: 'flex',
  alignItems: 'center',
};

type Props = {
  form: any,
  viewer: {
    messages: {},
  },
  match: {
    location: {},
  },
};

class NotificationPage extends Component {
  props: Props;
  state = {
    data: [],
    loading: false,
    lastMessage: [],
    modules: [],
    categories: null,
    unreadCount: 0,
    total: 0,
  };

  componentDidMount() {
    this.setInitialData();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { match } = this.props;
    const query = getQuery(match);
    const { match: nextMatch } = nextProps;
    const nextQuery = getQuery(nextMatch);
    if (!_.isEqual(query, nextQuery)) {
      this.fetchData(nextQuery);
    }
    return true;
  }

  setInitialData = () => {
    // 初始化下拉框内的options
    this.setCategorySelectData();
    this.setModuleSelectData();

    const { match } = this.props;
    const query = getQuery(match);

    this.props.form.setFieldsValue(query);
    this.fetchData(query);
  };

  fetchData = async params => {
    this.setState({ loading: true });
    const { match } = this.props;
    const { module, categoryCode, showByCategory } = this.props.form.getFieldsValue();
    const _params = {
      module: module && module === 'ALL' ? undefined : module,
      categoryCode: categoryCode && categoryCode === 'ALL' ? undefined : categoryCode,
      embed: 'message',
      size: 10,
      ...params,
    };
    const query = getQuery(match);
    setLocation(this.props, p => ({ ...p, ..._params }));
    const func = showByCategory ? queryMessageByCategory : queryMessageList;
    await func({ ...query, ..._params })
      .then(({ data: { data, total, unreadCount } }) => {
        this.setState({ total, data, unreadCount, loading: false });
      })
      .catch(err => {
        console.log(err);
        this.setState({ loading: false });
      });
  };

  setModuleSelectData = async () => {
    const {
      data: { data },
    } = await queryMessageByCategory();
    const modules = [];

    if (Array.isArray(data) && data.length > 0) {
      data.forEach(node => {
        const { module } = node;
        if (module) modules.push(module);
      });
    }

    console.log(_.uniq(modules));
    this.setState({ modules: _.uniq(modules), embed: undefined });
  };

  setCategorySelectData = async () => {
    let categories = {};
    const {
      data: { data },
    } = await queryMessageByCategory();
    if (Array.isArray(data) && data.length > 0) {
      categories = data.map(({ module, name, code }) => ({ module, label: name, value: code }));
    }
    this.setState({ categories, embed: undefined });
  };

  onModuleChange = (value, option) => {
    this.setCategorySelectData();
    this.props.form.resetFields(['categoryCode']);
    setTimeout(() => this.fetchData({ page: 1, size: 10 }), 50);
  };

  onCategoryChange = (value, option) => {
    const module = this.props.form.getFieldValue('module');
    const _module = option.props.module ? option.props.module : module;
    this.props.form.setFieldsValue({ module: _module });
    setTimeout(() => this.fetchData({ page: 1, size: 10 }), 50);
  };

  onShowByCategoryChange = () => {
    this.props.form.resetFields(['module']);
    this.setState({ data: null });
    setTimeout(() => this.fetchData({ page: 1, size: 10 }), 50);
  };

  readMessages = async params => {
    const { module, categoryCode } = this.props.form.getFieldsValue();
    let _params;
    if (module === 'ALL' && categoryCode === 'ALL') {
      // 读所有消息时不传参数
      _params = null;
    } else {
      _params = _.omitBy(
        {
          module: module === 'ALL' ? undefined : module,
          categoryCode: categoryCode === 'ALL' ? undefined : categoryCode,
          ...params,
        },
        _.isUndefined,
      );
    }

    await readAllMessages(_params).then(({ data: { statusCode } }) => {
      if (statusCode === 200) {
        this.fetchData({ size: 10, page: 1 });
      }
    });
  };

  onCategoryCardClick = (module, categoryCode) => {
    this.props.form.setFieldsValue({ module, showByCategory: false });
    this.fetchData({ module, categoryCode });
    setTimeout(() => this.props.form.setFieldsValue({ categoryCode }), 50);
  };

  renderNotification = data => {
    const { loading } = this.state;

    if (loading || !data) return null;

    const showByCategory = this.props.form.getFieldValue('showByCategory');

    return (
      <div>
        <div>
          {Array.isArray(data) && data.length > 0 ? (
            data.map(message => (
              <Card bordered={false} key={message.id}>
                <NotificationCard fetchData={this.fetchData} goDetailPage={!showByCategory} data={message} />
              </Card>
            ))
          ) : (
            <PlainText text="暂无消息" style={{ padding: 20 }} />
          )}
        </div>
        {this.renderPagination()}
      </div>
    );
  };

  renderNotificationByCategory = data => {
    const { loading } = this.state;

    if (loading || !data) return null;

    return Array.isArray(data)
      ? data.map(({ id, lastMessage, unreadCount, code, module }) => {
          return (
            <Card bordered={false} key={id}>
              <NotificationCategoryCard
                onCategoryCardClick={this.onCategoryCardClick}
                data={{ ...lastMessage, unreadCount, code, module }}
                readAllCategoryMessages={this.readMessages}
              />
            </Card>
          );
        })
      : null;
  };

  renderCategoryOptions = () => {
    const { categories } = this.state;
    const module = this.props.form.getFieldValue('module');

    if (!categories) return null;

    // 如果当前有筛选「业务类型」的话，就要按照当前「业务类型」过滤一遍「消息类型」
    if (module !== 'ALL') {
      const filter = Array.isArray(categories) && categories.filter(x => x.module === module);
      return filter.map(({ module, value, label }) => (
        <Option module={module} key={`${module}-${value}`} value={value}>
          {label}
        </Option>
      ));
    }

    return (
      Array.isArray(categories) &&
      categories.map(({ module, value, label }) => (
        <Option module={module} key={`${module}-${value}`} value={value}>
          {label}
        </Option>
      ))
    );
  };

  renderPagination = props => {
    const { match } = this.props;
    const { total } = this.state;
    const { page, size } = getQuery(match);

    return (
      <Pagination
        current={page || 1}
        total={total}
        pageSize={size || 10}
        style={{ float: 'right', margin: 20 }}
        onChange={page => {
          const variables = {
            page,
            size: 10,
          };
          this.fetchData(variables);
        }}
      />
    );
  };

  render() {
    const { unreadCount, modules, data } = this.state;
    const {
      form: { getFieldDecorator, getFieldValue },
    } = this.props;
    const _showByCategory = getFieldValue('showByCategory');

    return (
      <div className={styles.notificationPage}>
        <div style={{ ...FlexRow, padding: 20, justifyContent: 'space-between', borderBottom: '1px solid #F1F2F5' }}>
          <div style={FlexRow}>
            <PlainText text="通知" style={{ fontSize: 22, color: 'black' }} />
            <PlainText text="{unreadCount}条未读" intlParams={{ unreadCount }} style={{ marginLeft: 10 }} />
            <Link style={{ marginLeft: 10 }} onClick={this.readMessages} disabled={unreadCount === 0}>
              全部标记为已读
            </Link>
          </div>
          <div style={FlexRow}>
            <PlainText text="通知种类筛选" />
            {getFieldDecorator('module', {
              initialValue: 'ALL',
            })(
              <Select
                style={{ width: 200, marginLeft: 10 }}
                onSelect={this.onModuleChange}
                onFocus={this.setModuleSelectData}
              >
                <Option value="ALL">{changeChineseToLocaleWithoutIntl('全部')}</Option>
                {modules.map(key => (
                  <Option key={key} value={key}>
                    {MODULES[key]}
                  </Option>
                ))}
              </Select>,
            )}
            {_showByCategory
              ? null
              : getFieldDecorator('categoryCode', {
                  initialValue: 'ALL',
                })(
                  <Select
                    style={{ width: 200, marginLeft: 10 }}
                    onFocus={this.setCategorySelectData}
                    onSelect={this.onCategoryChange}
                  >
                    <Option value="ALL">{changeChineseToLocaleWithoutIntl('全部')}</Option>
                    {this.renderCategoryOptions()}
                  </Select>,
                )}
            {getFieldDecorator('showByCategory', {
              valuePropName: 'checked',
              onChange: e => this.onShowByCategoryChange(e),
            })(<Checkbox style={{ marginLeft: 10 }}>聚类显示</Checkbox>)}
          </div>
          <div style={FlexRow}>
            <Link icon="setting" to="/messages/setting/allModules">
              通知设置
            </Link>
          </div>
        </div>
        <div>{_showByCategory ? this.renderNotificationByCategory(data) : this.renderNotification(data)}</div>
      </div>
    );
  }
}

export default withForm({}, withRouter(NotificationPage));
