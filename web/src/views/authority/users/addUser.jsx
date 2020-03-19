import * as React from 'react';
import { Modal } from 'antd';
import { Button, withForm, Icon, message, FormattedMessage } from 'components';
import { addUser, enabledUser, orgInfo } from 'src/services/auth/user';
import { LANGUAGE_LIST, findLanguage, changeChineseToLocaleWithoutIntl } from 'src/utils/locale/utils';
import UserBaseForm from './common/UserBaseForm';
import NoAvailableUser from './common/noAvailableUser';
import styles from './index.scss';

type PropsType = {
  form: any,
  router: any,
};

class AddUser extends React.Component<PropsType> {
  renderOnSave(type, id) {
    if (type === 1) {
      return (
        <div className={styles.onSaveSamePop}>
          <div className={styles.top}>
            <Icon type="exclamation-circle-o" className={styles.contactIcon} />
            <p>
              <FormattedMessage
                defaultMessage={'系统检测到用户名和手机号完全相同的用户账号，是否直接启用已删除账号？'}
              />
            </p>
          </div>
          <div className={styles.footer}>
            <Button
              size="small"
              className={styles.use}
              type="default"
              onClick={() => {
                this.setState({ saveVisible: false });
              }}
            >
              暂不启用
            </Button>
            <Button
              size="small"
              className={styles.unuse}
              onClick={() => {
                enabledUser(id)
                  .then(() => {
                    this.setState({ saveVisible: false });
                    this.props.history.push(`/authority/users/user-detail/${id}`);
                  })
                  .catch(error => {
                    const { code } = error.response.data;
                    if (code === 'INSUFFICIENT_QUOTA') {
                      this.setState({ popoverContent: this.renderOnSave(2) });
                    }
                  });
              }}
            >
              直接启用
            </Button>
          </div>
        </div>
      );
    } else if (type === 2) {
      return (
        <NoAvailableUser
          onOk={() => {
            this.setState({ saveVisible: false });
          }}
        />
      );
    }
  }

  onSubmit = () => {
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const { deviceIds, attachments } = values;
        // 后端需要的key
        const { headerValue } = findLanguage(values.xlanguage) || {};

        const submitValue = {
          ...values,
          workgroupIds: values.workgroupIds && values.workgroupIds.map(({ key }) => key),
          workDepartmentIds: values.workDepartmentIds && values.workDepartmentIds.map(({ key }) => key),
          deviceIds: deviceIds && deviceIds.filter(n => n),
          attachments: attachments && attachments.map(({ id }) => id),
          // xlanguage: headerValue,
        };
        if (!values.fake) {
          submitValue.roleIds = values.roleIds.map(({ key }) => key);
        }
        addUser(submitValue)
          .then(({ data: { data: { id, active, password, name, username } } }) => {
            if (active) {
              message.success('用户添加成功');
              Modal.success({
                title: changeChineseToLocaleWithoutIntl('新建用户成功'),
                onOk: () => this.props.history.push(`/authority/users/user-detail/${id}`),
                content: (
                  <div>
                    <p>
                      {changeChineseToLocaleWithoutIntl('账号')}: {username}
                    </p>
                    <p>
                      {changeChineseToLocaleWithoutIntl('姓名')}: {name}
                    </p>
                    <p>
                      {changeChineseToLocaleWithoutIntl('密码')}: {password}
                    </p>
                  </div>
                ),
              });
            } else {
              this.setState({
                saveVisible: true,
                popoverContent: this.renderOnSave(1, id),
              });
            }
          })
          .catch(error => {
            const { code } = error.response.data;
            if (code === 'INSUFFICIENT_QUOTA') {
              this.setState({
                saveVisible: true,
                popoverContent: this.renderOnSave(2),
              });
            }
          });
      }
    });
  };

  render() {
    return <UserBaseForm {...this.props} onSubmit={this.onSubmit} form={this.props.form} type="create" />;
  }
}

export default withForm({ showFooter: false }, AddUser);
