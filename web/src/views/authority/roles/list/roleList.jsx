import * as React from 'react';
import { SimpleTable, Link, Icon, Progress, Popconfirm, openModal, message, FormattedMessage } from 'components';
import { Tag } from 'antd';
import classNames from 'classnames';
import { getRoles, addRoleUsers, removeUser } from 'src/services/auth/role';
import RoleAddUser from '../roleAddUser';
import styles from '../index.scss';

class RoleList extends React.Component {
  state = {
    dataSource: [],
    removeUser: null,
    loading: false,
  };

  componentDidMount() {
    this.setDataSource();
  }

  setDataSource = async () => {
    this.setState({ loading: true });
    const {
      data: { data },
    } = await getRoles({ embed: 'users' });
    const dataSource = data
      .map(userGroup => ({
        ...userGroup,
        key: userGroup.id,
      }))
      .filter(({ quota }) => quota > 0);
    this.setState({ dataSource, loading: false });
  };

  columns = [
    {
      title: '角色名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: name => (
        <span>
          <Icon iconType="gc" type="yonghu" />
          {name}
        </span>
      ),
    },
    {
      title: '已用/总数',
      dataIndex: 'quota',
      key: 'quota',
      width: 140,
      render: (quota, record) => (
        <div style={{ width: 120, position: 'relative', height: 16, display: 'flex', alignItem: 'center' }}>
          <Progress.AntProgress
            showInfo={false}
            percent={(record.used * 100) / quota}
            style={{ width: 64, marginRight: 4 }}
            strokeWidth={5}
          />
          <span>
            {record.used}/{quota}
          </span>
        </div>
      ),
    },
    {
      title: '已有成员列表',
      dataIndex: 'users',
      key: 'users',
      render: (users, record) => {
        return (
          users &&
          users.map(({ name, id }) => (
            <div style={{ position: 'relative', display: 'inline-block', marginRight: 10 }} kye={id}>
              <Popconfirm
                title={
                  <FormattedMessage
                    defaultMessage={'确定解除用户{username}的{rolename}角色吗?'}
                    values={{
                      username: name,
                      rolename: record.name,
                    }}
                  />
                }
                visible={this.state.removeUser === `${record.name}#${id}`}
                onCancel={() => {
                  this.setState({ removeUser: null });
                }}
                onConfirm={() => {
                  this.removeUser({ userId: id, roleId: record.id });
                }}
                onVisibleChange={visible => {
                  if (!visible) {
                    this.setState({ removeUser: null });
                  }
                }}
              >
                <Tag
                  className={styles.userTag}
                  closable
                  onClose={e => {
                    e.preventDefault();
                    this.setState({ removeUser: `${record.name}#${id}` });
                  }}
                >
                  {name}
                </Tag>
              </Popconfirm>
            </div>
          ))
        );
      },
    },
    {
      title: '操作',
      key: 'operation',
      width: 110,
      dataIndex: 'id',
      render: (id, { used, quota }) =>
        used !== quota && (
          <Link
            onClick={() => {
              openModal({
                title: (
                  <span>
                    <FormattedMessage defaultMessage={'添加成员'} />（<Link>{used}</Link>/{quota}）
                  </span>
                ),
                children: (
                  <RoleAddUser
                    length={quota - used}
                    wrappedComponentRef={inst => (this.addUserRef = inst)}
                    roleId={id}
                  />
                ),
                onOk: () => {
                  this.addUserRef.submit();
                },
                onSuccess: () => {
                  message.success('添加成功！');
                  this.setDataSource();
                },
              });
            }}
          >
            添加成员
          </Link>
        ),
    },
  ];

  removeUser = async ({ userId, roleId }) => {
    this.setState({ loading: true });
    await removeUser(roleId, userId);
    this.setState({ removeUser: null });
    await this.setDataSource();
    message.success('解除成功');
    this.setState({ loading: false });
  };

  render() {
    const { dataSource, loading } = this.state;
    return (
      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <SimpleTable columns={this.columns} dataSource={dataSource} pagination={false} loading={loading} />
      </div>
    );
  }
}

export default RoleList;
