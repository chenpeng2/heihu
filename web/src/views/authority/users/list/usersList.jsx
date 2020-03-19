import React, { Component } from 'react';
import {
  Button,
  FilterSortSearchBar,
  withForm,
  Input,
  Select,
  SimpleTable,
  OpenModal,
  Link,
  Icon,
  Popover,
  Badge,
  Tooltip,
  message,
  Checkbox,
  FormattedMessage,
} from 'components';
import SearchSelect from 'components/select/searchSelect';
import { setLocation, getParams } from 'utils/url';
import log from 'utils/log';
import colors from 'styles/color';
import { getUsers, disabledUser, enabledUser, orgInfo, updateUsersStatus } from 'src/services/auth/user';
import { replaceSign } from 'src/constants';
import NoAvailableUser from '../common/noAvailableUser';
import ResetPasswordForm from '../resetPasswordForm';
import styles from '../index.scss';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;
const Avatar = Icon.Avatar;
const selectModeInitState = {
  onSelectMode: false,
  selectAll: false,
  selectedRowKeys: [],
};
class UserList extends Component {
  props: {
    form: any,
  };
  state = {
    visible: false,
    loading: false,
    dataSource: [],
    total: 0,
    noAvailableUser: null,
    quota: null,
    used: null,
    query: {},
    ...selectModeInitState,
  };

  componentDidMount() {
    const { queryObj } = getParams();
    const init = { page: 1, active: true, fake: 'all', ...queryObj };
    this.props.form.setFieldsValue(init);
    this.setDataSource(init);
  }

  setDataSource = async params => {
    this.setState({ loading: true });
    const _params = { ...getParams().queryObj, ...params };
    try {
      setLocation(this.props, _params);
      orgInfo().then(({ data: { data: { quota, used } } }) => {
        this.setState({ quota, used });
      });
      const query = {
        embed: 'workgroups,roles',
        size: 10,
        ..._params,
      };
      const {
        data: { data, total },
      } = await getUsers(query);
      const dataSource = data.map(user => ({
        ...user,
        key: user.id,
      }));
      this.setState({ dataSource, loading: false, total, query });
    } catch (error) {
      log.error(error);
      this.setState({ loading: false });
    }
  };

  handleResetPassword = (id, name, username, password) => {
    OpenModal(
      {
        title: '重置密码',
        footer: null,
        children: (
          <ResetPasswordForm
            inModal="true"
            data={{ userId: id, name, username, oldPassword: password }}
            onSuccess={data => {
              this.setDataSource();
            }}
          />
        ),
      },
      this.context,
    );
  };

  getColumns = () => {
    const { noAvailableUser, onSelectMode } = this.state;
    const columns = [
      {
        title: '姓名',
        dataIndex: 'name',
        fixed: 'left',
        width: 180,
        render: (text, { bgColor }) => (
          <React.Fragment>
            <Avatar color={bgColor} name={text} />
            <Tooltip length={12} text={text || replaceSign} />
          </React.Fragment>
        ),
      },
      {
        title: '账号',
        dataIndex: 'username',
        fixed: 'left',
        width: 140,
        render: text => <Tooltip length={12} text={text || replaceSign} />,
      },
      {
        title: '手机号',
        type: 'phone',
        dataIndex: 'phone',
        width: 120,
        render: text => text || replaceSign,
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        width: 130,
        render: text => (text ? <Tooltip text={text} length={12} /> : replaceSign),
      },
      {
        title: '角色',
        dataIndex: 'roles',
        render: roles =>
          roles.length > 0 && (
            <Tooltip text={roles.map(({ name }) => name).reduce((prev, next) => `${prev},${next}`)} length={30} />
          ),
      },
      {
        title: '用户组',
        dataIndex: 'workgroups',
        render: workgroups => {
          const str =
            workgroups && workgroups.length > 0
              ? workgroups.map(({ name }) => name).reduce((prev, next) => `${prev},${next}`)
              : replaceSign;
          return <Tooltip text={str} length={30} />;
        },
      },
      {
        title: '虚拟用户',
        dataIndex: 'fake',
        render: fake => <FormattedMessage defaultMessage={fake ? '是' : '否'} />,
      },
      {
        title: '状态',
        fixed: 'right',
        width: 110,
        dataIndex: 'active',
        render: active => (active ? <Badge status="success" text="启用中" /> : <Badge status="error" text="停用中" />),
      },
      {
        title: '操作',
        width: 200,
        dataIndex: 'id',
        fixed: 'right',
        render: (id, { fake, active, name, username, password }) => (
          <div className={styles.childrenSplit}>
            {!fake && (
              <Link disabled={onSelectMode} onClick={() => this.handleResetPassword(id, name, username, password)}>
                重置密码
              </Link>
            )}
            {active && (
              <Link disabled={onSelectMode} to={`${location.pathname}/user-edit/${id}`}>
                编辑
              </Link>
            )}
            <Link disabled={onSelectMode}>
              {active ? (
                <Link
                  onClick={async () => {
                    await disabledUser(id);
                    this.setDataSource();
                    message.success('停用成功');
                  }}
                >
                  停用
                </Link>
              ) : (
                <Popover
                  visible={noAvailableUser === id}
                  trigger="click"
                  onVisibleChange={value => {
                    if (value === false) {
                      this.setState({ noAvailableUser: null });
                    }
                  }}
                  content={<NoAvailableUser onOk={() => this.setState({ noAvailableUser: null })} />}
                >
                  <FormattedMessage
                    defaultMessage={'启用'}
                    onClick={() => {
                      enabledUser(id)
                        .then(() => {
                          this.setDataSource();
                          message.success('启用成功');
                        })
                        .catch(error => {
                          const { code } = error.response.data;
                          if (code === 'INSUFFICIENT_QUOTA') {
                            this.setState({ noAvailableUser: id });
                          }
                        })
                        .finally(() => this.setState({ loading: false }));
                    }}
                  />
                </Popover>
              )}
            </Link>
            <Link to={`${location.pathname}/user-detail/${id}`} disabled={onSelectMode}>
              详情
            </Link>
          </div>
        ),
      },
    ];
    return columns.map(node => ({
      key: node.title,
      ...node,
    }));
  };

  handlePatchUpdate = async active => {
    this.setState({ loading: true });
    const { selectAll, selectedRowKeys } = this.state;
    if (!selectAll && selectedRowKeys.length === 0) {
      message.error('请选择至少一个用户');
      return;
    }
    await updateUsersStatus(
      {
        active,
        userIds: selectAll ? null : selectedRowKeys,
      },
      this.state.query,
    );
    message.success('操作成功!');
    this.setState(selectModeInitState);
    this.setDataSource({ page: 1 });
  };

  render() {
    const { form } = this.props;
    const { dataSource, loading, total, quota, used, onSelectMode, selectAll, selectedRowKeys } = this.state;
    const { getFieldDecorator } = form;

    return (
      <div className={styles.list}>
        <div className={styles.filter}>
          <FilterSortSearchBar searchDisabled>
            <ItemList>
              <Item label="姓名">{getFieldDecorator('name')(<Input />)}</Item>
              <Item label="角色">
                {getFieldDecorator('roleId', {
                  initialValue: null,
                })(
                  <SearchSelect
                    type="role"
                    placeholder="全部"
                    labelInValue={false}
                    handleData={data => {
                      return [{ label: '全部', key: null }, ...data];
                    }}
                  />,
                )}
              </Item>
              <Item label="状态">
                {getFieldDecorator('active', {
                  initialValue: null,
                })(
                  <Select
                    placeholder="全部"
                    allowClear
                    options={[
                      { label: '全部', value: null },
                      { label: '启用', value: true },
                      { label: '停用', value: false },
                    ]}
                  />,
                )}
              </Item>
              <Item label="账号">{getFieldDecorator('username')(<Input />)}</Item>
              <Item label="手机号">{getFieldDecorator('phone')(<Input />)}</Item>
              <Item label="用户组">
                {getFieldDecorator('groupId', {
                  initialValue: null,
                })(
                  <SearchSelect
                    labelInValue={false}
                    type="workgroup"
                    handleData={data => [{ label: '全部', key: null }, ...data]}
                  />,
                )}
              </Item>
              <Item label="邮箱">{getFieldDecorator('email')(<Input />)}</Item>
              <Item label="虚拟用户">
                {getFieldDecorator('fake')(
                  <Select
                    options={[
                      { label: '全部', value: 'all' },
                      { label: '是', value: true },
                      { label: '否', value: false },
                    ]}
                  />,
                )}
              </Item>
            </ItemList>
          </FilterSortSearchBar>
          <Button
            className={styles.searchButton}
            onClick={() => {
              this.setDataSource({ ...form.getFieldsValue(), page: 1 });
            }}
            icon={'search'}
          >
            查询
          </Button>
        </div>
        {onSelectMode ? (
          <div style={{ marginBottom: 20 }} className="child-gap">
            <Checkbox
              checked={selectAll}
              onChange={e => this.setState({ selectAll: e.target.checked })}
              style={{ display: 'inline' }}
            />
            <FormattedMessage defaultMessage={'跨页全选'} />
            <Button ghost onClick={() => this.handlePatchUpdate(true)} loading={loading}>
              批量启用
            </Button>
            <Button ghost onClick={() => this.handlePatchUpdate(false)} loading={loading}>
              批量停用
            </Button>
            <span>
              <FormattedMessage defaultMessage={'已选'} /> <Link>{selectAll ? total : selectedRowKeys.length}</Link>
            </span>
            <Button
              ghost
              onClick={() => {
                this.setState({ onSelectMode: false, selectedRowKeys: [], selectAll: false });
              }}
            >
              取消
            </Button>
          </div>
        ) : (
          <div style={{ marginBottom: 20 }} className="child-gap">
            <Link to={`${location.pathname}/add-user`}>
              <Button icon="plus-circle-o">新增用户</Button>
            </Link>
            <Button
              ghost
              iconType="gc"
              icon="piliangcaozuo"
              onClick={() => {
                this.setState({ onSelectMode: true });
              }}
            >
              批量启用停用
            </Button>
          </div>
        )}
        <div>
          <SimpleTable
            loading={loading}
            columns={this.getColumns()}
            dataSource={dataSource}
            style={{ marginLeft: 0 }}
            scroll={{ x: 1500 }}
            pagination={{
              total,
              onChange: page => {
                this.setDataSource({ page });
              },
            }}
            rowSelection={
              onSelectMode && {
                selectedRowKeys,
                getCheckboxProps: record =>
                  selectAll && {
                    disabled: true,
                    checked: true,
                  },
                onChange: selectedRowKeys => {
                  this.setState({ selectedRowKeys });
                },
              }
            }
          />
        </div>
        <p className={styles.accountUsed}>
          <FormattedMessage defaultMessage={'账号使用'} />: <span style={{ color: colors.primary }}>{used}</span>/
          {quota}
          <Popover
            content={
              <div className={styles.tipContent}>
                <Icon type="exclamation-circle-o" className={styles.contactIcon} />
                <div>
                  <p className={styles.contact}>
                    <FormattedMessage defaultMessage={'购买更多账号请联系'} />：
                  </p>
                  <p>
                    <FormattedMessage defaultMessage={'电话'} />
                    ：400-921-0816
                  </p>
                  <p>
                    <FormattedMessage defaultMessage={'邮箱'} />
                    ：contact@blacklake.cn
                  </p>
                </div>
              </div>
            }
          >
            <Icon type="exclamation-circle-o" className={styles.tipIcon} />
          </Popover>
        </p>
      </div>
    );
  }
}

export default withForm({ showFooter: false }, UserList);
