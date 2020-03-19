import * as React from 'react';
import PropTypes from 'prop-types';
import { Link, Popover, Icon, message, Spin, Attachment, FormattedMessage } from 'components';
import { replaceSign } from 'constants';
import { getUser, disabledUser, enabledUser } from 'src/services/auth/user';
import _ from 'lodash';
import { arrayIsEmpty } from 'utils/array';
import { findLanguageByHeaderValue } from 'src/utils/locale/utils';

import NoAvailableUser from './common/noAvailableUser';
import styles from './index.scss';

type PropsType = {
  match: {
    params: {
      id: string,
    },
  },
  router: {
    push: () => {},
  },
};

const AttachmentFile = Attachment.AttachmentFile;

class UserDetail extends React.Component<PropsType> {
  state = {
    user: {},
    noAvailableUser: false,
    spinning: false,
    warehouses: [],
    workshops: [],
  };

  componentDidMount() {
    this.getUserDetail();
  }

  getUserDetail = async () => {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    this.setState({ spinning: true });
    const {
      data: { data },
    } = await getUser(id);
    const { workDepartments } = data || {};
    const groups = _.groupBy(workDepartments, 'type');
    const warehouses = _.get(groups, '0', []).map(x => _.get(x.warehouse, 'name'));
    const workshops = _.get(groups, '1', []).map(x => _.get(x.workshop, 'name'));
    this.setState({ user: data, warehouses, workshops });
    this.setState({ spinning: false });
  };

  render() {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    const { changeChineseToLocale } = this.context;
    const {
      user: {
        username,
        name,
        phone,
        email,
        active,
        roles,
        workgroups,
        fake,
        limitLoginDevice,
        deviceIds,
        attachmentFiles,
        xlanguage,
      },
      noAvailableUser,
      spinning,
      workshops,
      warehouses,
    } = this.state;
    const mapRenders = [
      { title: '账号', render: <span>{username}</span> },
      { title: '姓名', render: <span>{name}</span> },
      { title: '手机号', render: <span>{phone || replaceSign}</span> },
      { title: '邮箱', render: <span>{email || replaceSign}</span> },
      {
        title: '状态',
        render: (
          <React.Fragment>
            <FormattedMessage defaultMessage={active ? '启用' : '停用'} style={{ marginRight: 10 }} />
            <div className={active ? 'switch-open' : 'switch-close'}>
              {active ? (
                <FormattedMessage
                  defaultMessage={'停用'}
                  onClick={async () => {
                    this.setState({ spinning: true });
                    disabledUser(id)
                      .then(() => {
                        message.success('停用成功');
                        this.getUserDetail();
                      })
                      .finally(() => {
                        this.setState({ spinning: false });
                      });
                  }}
                />
              ) : (
                <Popover
                  visible={noAvailableUser}
                  trigger="click"
                  onVisibleChange={value => {
                    if (value === false) {
                      this.setState({ noAvailableUser: false });
                    }
                  }}
                  content={<NoAvailableUser onOk={() => this.setState({ noAvailableUser: null })} />}
                >
                  <FormattedMessage
                    defaultMessage={'启用'}
                    onClick={() => {
                      this.setState({ spinning: true });
                      enabledUser(id)
                        .then(() => {
                          this.getUserDetail();
                          message.success('启用成功');
                        })
                        .catch(error => {
                          const { code } = error.response.data;
                          if (code === 'INSUFFICIENT_QUOTA') {
                            this.setState({ noAvailableUser: true });
                          }
                        })
                        .finally(() => {
                          this.setState({ spinning: false });
                        });
                    }}
                  />
                </Popover>
              )}
            </div>
          </React.Fragment>
        ),
      },
      {
        title: '角色',
        render: (
          <span className={styles.childrenSplit} style={{ lineHeight: '19px' }}>
            {_.get(roles, 'length')
              ? roles.map(({ name }, index) => (
                  <span key={`yonghu${index}-${name}`}>
                    <Icon iconType="gc" type="yonghu" />
                    {name}
                  </span>
                ))
              : replaceSign}
          </span>
        ),
      },
      {
        title: '工作部门',
        render: (
          <span className={styles.childrenSplit} style={{ lineHeight: '19px' }}>
            <p style={{ marginBottom: 2 }}>
              <FormattedMessage defaultMessage={'车间'} />：
              {_.get(workshops, 'length') ? _.join(workshops, '、') : replaceSign}
            </p>
            <p>
              <FormattedMessage defaultMessage={'仓库'} />：
              {_.get(warehouses, 'length') ? _.join(warehouses, '、') : replaceSign}
            </p>
          </span>
        ),
      },
      {
        title: '用户组',
        render: (
          <FormattedMessage
            className={styles.childrenSplit}
            style={{ lineHeight: '19px' }}
            defaultMessage={
              _.get(workgroups, 'length')
                ? workgroups.map(({ name }, index) => (
                    <span key={`yonghuzu${index}-${name}`}>
                      <Icon iconType="gc" type="yonghuzu" />
                      {name}
                    </span>
                  ))
                : replaceSign
            }
          />
        ),
      },
      {
        title: '虚拟用户',
        render: <FormattedMessage defaultMessage={fake ? '是' : '否'} />,
      },
      !fake && {
        title: '登录设备限制',
        render: <FormattedMessage defaultMessage={limitLoginDevice ? '是' : '否'} />,
      },
      !fake &&
        limitLoginDevice && {
          title: '设备标签',
          render: <FormattedMessage defaultMessage={deviceIds && deviceIds.join(',')} />,
        },
      !fake && {
        title: '附件',
        render: <FormattedMessage defaultMessage={!arrayIsEmpty(attachmentFiles) && AttachmentFile(attachmentFiles)} />,
      },
      // {
      //   title: '默认语言',
      //   render: (
      //     <span>
      //       {xlanguage && findLanguageByHeaderValue(xlanguage)
      //         ? findLanguageByHeaderValue(xlanguage).label
      //         : '跟随工厂默认语言'}
      //     </span>
      //   ),
      // },
    ]
      .filter(n => n)
      .map(node => ({
        ...node,
        title: node.title,
      }));
    return (
      <Spin spinning={spinning}>
        <div className={styles.detail}>
          <div className={styles.header}>
            <span className={styles.title}>{name}</span>
            <span className={styles.right}>
              {active && (
                <Link to={`/authority/users/user-edit/${id}`} icon="edit">
                  编辑
                </Link>
              )}
              <Link to={`${location.pathname}/operation-log`} icon="bars">
                查看操作记录
              </Link>
            </span>
          </div>
          <div>
            {mapRenders
              .filter(n => n)
              .map(({ title, render }) => (
                <div className={styles.row} key={title}>
                  <FormattedMessage defaultMessage={title} />
                  {render}
                </div>
              ))}
          </div>
        </div>
      </Spin>
    );
  }
}

UserDetail.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default UserDetail;
