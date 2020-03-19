import * as React from 'react';
import {
  Button,
  SimpleTable,
  Input,
  Link,
  openModal,
  Popconfirm,
  Select,
  message,
  FilterSortSearchBar,
  withForm,
  Icon,
  Tooltip,
  FormattedMessage,
} from 'components';
import { getWorkgroups, disabledWorkgroup, removeUser, enabledWorkgroup } from 'src/services/auth/workgroup';
import { Tag } from 'antd';
import classNames from 'classnames';
import { setLocation, getParams } from 'utils/url';
import styles from './index.scss';
import GroupAddUser from './groupAddUser';
import AddUserGroup from './addUserGroup';

const Option = Select.Option;
const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
type PropsType = {
  form: any,
};

class UserGroupList extends React.Component<PropsType> {
  state = {
    removeUser: null,
    addUser: null,
    dataSource: [],
    loading: false,
    disabledGroup: null,
  };

  componentDidMount() {
    const query = { active: true, ...getParams().queryObj };
    this.props.form.setFieldsValue(query);
    this.setDataSource(query);
  }

  setDataSource = params => {
    const _params = { active: true, ...getParams().queryObj, ...params };
    setLocation(this.props, _params);
    this.setState({ loading: true });
    getWorkgroups({
      embed: 'members',
      ..._params,
    })
      .then(({ data: { data } }) => {
        const dataSource = data.map(node => ({ ...node, key: node.id }));
        this.setState({ dataSource });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  columns = [
    {
      title: '用户组',
      dataIndex: 'name',
      key: 'name',
      width: 190,
      render: name => (
        <span>
          <Icon iconType="gc" type="yonghuzu" />
          <Tooltip text={name} length={14} />
        </span>
      ),
    },
    {
      title: '已有用户',
      dataIndex: 'members',
      render: (members, record) =>
        members.map(({ name, id, fake }) => (
          <div style={{ position: 'relative', display: 'inline-block', marginRight: 10 }} key={id}>
            <Popconfirm
              title={`确定将用户"${name}"从"${record.name}"中移除?`}
              visible={this.state.removeUser === `${record.name}#${id}`}
              onCancel={() => {
                this.setState({ removeUser: null });
              }}
              onConfirm={() => {
                this.removeUser(record.id, id);
              }}
              onVisibleChange={visible => {
                if (!visible) {
                  this.setState({ removeUser: null });
                }
              }}
            >
              <Tag
                className={classNames(styles.userTag, fake && styles['userTag-dash'])}
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
        )),
    },
    {
      title: '操作',
      dataIndex: 'id',
      width: 180,
      render: (id, { active, members, name }) => {
        return (
          <div className={styles.childrenSplit}>
            {active && (
              <Link
                onClick={() => {
                  openModal({
                    title: '添加成员',
                    children: <GroupAddUser wrappedComponentRef={inst => (this.addMembers = inst)} groupId={id} />,
                    onOk: async () => {
                      await this.addMembers.submit();
                      message.success('添加用户成功!');
                      this.setDataSource();
                    },
                  });
                }}
              >
                添加用户
              </Link>
            )}
            {active && (
              <Link
                onClick={() => {
                  openModal({
                    title: '编辑用户组',
                    children: (
                      <AddUserGroup
                        setDataSource={this.setDataSource}
                        type="edit"
                        groupId={id}
                        wrappedComponentRef={inst => (this.editUsergroup = inst)}
                        name={name}
                      />
                    ),
                    onOk: async () => {
                      await this.editUsergroup.submit();
                      this.setDataSource();
                    },
                  });
                }}
              >
                编辑
              </Link>
            )}
            {active ? (
              <Popconfirm
                title={<FormattedMessage defaultMessage={'确定停用{name}用户组?'} values={{ name }} />}
                trigger="click"
                visible={this.state.disabledGroup === id}
                onVisibleChange={visible => {
                  if (!visible) {
                    this.setState({ disabledGroup: null });
                  }
                }}
                onConfirm={() => this.disableUserGroup(id)}
              >
                <Link onClick={() => this.setState({ disabledGroup: id })}>停用</Link>
              </Popconfirm>
            ) : (
              <Link onClick={() => this.enabledUserGroup(id)}>启用</Link>
            )}
          </div>
        );
      },
    },
  ];

  removeUser = async (groupId, userId) => {
    await removeUser(groupId, userId);
    this.setDataSource();
    this.setState({ removeUser: null });
    message.success('用户移除成功');
  };

  disableUserGroup = async id => {
    await disabledWorkgroup(id);
    this.setDataSource();
    message.success('停用成功!');
  };

  enabledUserGroup = async id => {
    await enabledWorkgroup(id);
    this.setDataSource();
    message.success('启用成功!');
  };

  render() {
    const { loading, dataSource } = this.state;
    const {
      form: { getFieldDecorator, getFieldsValue },
    } = this.props;
    return (
      <div className={styles.list}>
        <div className={styles.filter}>
          <FilterSortSearchBar searchDisabled style={{ flex: 1 }}>
            <ItemList>
              <Item label="用户组">{getFieldDecorator('name')(<Input />)}</Item>
              <Item label="状态">
                {getFieldDecorator('active', {
                  initialValue: null,
                })(
                  <Select
                    placeholder="全部"
                    options={[
                      { label: '全部', value: null },
                      { label: '启用中', value: true },
                      { label: '停用中', value: false },
                    ]}
                  />,
                )}
              </Item>
            </ItemList>
          </FilterSortSearchBar>
          <div className={styles.search}>
            <Button
              icon="search"
              style={{ marginLeft: 10 }}
              onClick={() => {
                this.setDataSource(getFieldsValue());
              }}
            >
              查询
            </Button>
          </div>
        </div>
        <div className={styles.addGroup}>
          <Button
            icon="plus-circle-o"
            onClick={() => {
              openModal({
                title: '新增用户组',
                children: (
                  <AddUserGroup
                    wrappedComponentRef={inst => (this.addUserGroupRef = inst)}
                    setDataSource={this.setDataSource}
                  />
                ),
                onOk: async () => {
                  await this.addUserGroupRef.submit();
                },
              });
            }}
          >
            新增用户组
          </Button>
        </div>
        <SimpleTable loading={loading} columns={this.columns} dataSource={dataSource} pagination={false} />
      </div>
    );
  }
}

export default withForm({}, UserGroupList);
