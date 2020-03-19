import * as React from 'react';
import PropTypes from 'prop-types';
import { Button, withForm, Icon } from 'components';
import { editUser, orgInfo } from 'src/services/auth/user';
import { getUserFromLocalStorage } from 'src/utils/localStorage';
import { findLanguage } from 'src/utils/locale/utils';
import UserBaseForm from './common/UserBaseForm';

import styles from './index.scss';

type PropsType = {
  form: any,
  match: {
    params: any,
  },
  history: any,
};

class EditUser extends React.Component<PropsType> {
  state = {
    quota: 0,
    used: 0,
    treeData: [],
    allTreeData: [],
    selectWorkDepartments: [],
    deviceIds: [],
  };

  onSubmit = () => {
    const {
      form,
      match: {
        params: { id },
      },
      history,
    } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const { deviceIds, attachments } = values;
        const { headerValue } = findLanguage(values.xlanguage) || {};
        const submitValue = {
          ...values,
          workDepartmentIds: values.workDepartmentIds && values.workDepartmentIds.map(({ key }) => key),
          // workDepartmentIds: _.get(values, 'workDepartmentIds') ? values.workDepartmentIds.map(({ value }) => value) : null,
          roleIds: values.roleIds && values.roleIds.map(({ key }) => key),
          workgroupIds: values.workgroupIds.map(({ key }) => key),
          fake: undefined,
          deviceIds: deviceIds && deviceIds.filter(n => n),
          attachments: attachments && attachments.map(({ id }) => id),
          // xlanguage: headerValue,
        };
        editUser(id, submitValue)
          .then(({ data: { data: { id } } }) => {
            history.push(`/authority/users/user-detail/${id}`);
          })
          .then(() => {
            // 如果改变的是当前账号的语言，需要改变项目的语言
            const { xlanguage, phone } = values;
            const { phone: userPhone } = getUserFromLocalStorage();
            if (phone === userPhone && xlanguage) {
              const { changeLanguageType } = this.context;
              if (xlanguage) changeLanguageType(xlanguage);
            }
          });
      }
    });
  };

  renderOnSave(type) {
    if (type === 1) {
      return (
        <div className={styles.onSaveSamePop}>
          <div className={styles.top}>
            <Icon type="exclamation-circle-o" className={styles.contactIcon} />
            <p>系统检测到用户名和手机号完全相同的用户账号，是否直接启用已删除账号？</p>
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
            <Button size="small" className={styles.unuse}>
              直接启用
            </Button>
          </div>
        </div>
      );
    } else if (type === 2) {
      return (
        <div className={styles.onSaveSamePop}>
          <div className={styles.top}>
            <Icon type="close-circle" className={styles.contactIcon} />
            <div>
              <p className={styles.contact}>没有更多可用帐号了，购买更多帐号请联系：</p>
              <p>电话：400-921-0816</p>
              <p>邮箱：contact@blacklake.cn</p>
            </div>
          </div>
          <div className={styles.footer}>
            <Button
              size="small"
              type="default"
              onClick={() => {
                this.setState({ saveVisible: false });
              }}
            >
              知道了
            </Button>
          </div>
        </div>
      );
    }
  }

  render() {
    const { form } = this.props;
    return <UserBaseForm {...this.props} form={form} onSubmit={this.onSubmit} type="edit" />;
  }
}

EditUser.contextTypes = {
  changeLanguageType: PropTypes.any,
};

export default withForm({ showFooter: false }, EditUser);
