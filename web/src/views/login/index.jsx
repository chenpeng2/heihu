import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { userLogin, getUserInfo, getOrgInfoByCode } from 'src/services/auth/user';
import { Form, Input, Checkbox, Icon, message, Button, Spin, FormItem } from 'src/components';
import { navBlack } from 'src/styles/color/index';
import LocalStorage from 'src/utils/localStorage';
import { hashPassword } from 'utils/string';
import Raven from 'raven-js';
import appendQuery from 'append-query';
import * as constants from 'constants';
import Image from 'src/favicon.ico';

import { setOrganizationConfigInLocalStorage, setOrganizationInfoInLocalStorage } from 'src/utils/organizationConfig';
import { setSensorsUserProfile } from 'src/utils/sensors';
import { getLanguageType } from 'src/utils/locale/utils';

import styles from './styles.scss';

type Props = {
  location: {},
  form: any,
  history: any,
};

export class Login extends Component {
  state = {
    loading: false,
    type: 0, // { 0: 手机号登录, 1: 工厂账号登录 }
    code: null,
    orgLogoUrl: null,
    preLoginInfo: {},
    orgName: null,
  };
  props: Props;

  componentWillMount() {
    const preLoginInfo = LocalStorage.get(constants.FIELDS.LOGIN_INFO) || {};
    const { code: preCode } = preLoginInfo;
    const code = _.split(document.location.search, '?code=')[1] || preCode;
    this.setState({ preLoginInfo, type: code ? 1 : 0 }, () => {
      this.setOrgInfo(code);
    });
    const token = LocalStorage.get(constants.FIELDS.TOKEN_NAME);
    const auth = LocalStorage.get(constants.FIELDS.AUTH);
    if (token && token !== 'expired' && auth !== null) {
      this.authSucceed(token);
    }
  }

  authSucceed = token => {
    const { location, history } = this.props;
    const query = (location && location.query) || {};
    const callback = query.callback;
    if (callback) {
      window.location.href = appendQuery(callback, { token });
    } else {
      history.push('/');
    }
  };

  setOrgInfo = async code => {
    if (/^[a-zA-Z0-9]{6}$/.test(code)) {
      await getOrgInfoByCode(code)
        .then(({ data }) => {
          if (data && !data.data) {
            message.error('输入的工厂代码有误');
          }
          const uri = _.get(data, 'data.logo.uri');
          const orgName = _.get(data, 'data.name', code);
          // 如果 url中有工厂代码，则直接切换工厂账号登录方式
          this.setState({ code: code.replace(/\s/g, ''), orgName, orgLogoUrl: uri });
          window.history.pushState({ code }, '', `?code=${code}`);
        })
        .catch(err => console.log(err));
    } else {
      this.setState({ code, orgLogoUrl: null, orgName: code });
      window.history.pushState({ code }, '', '');
    }
  };

  handleSubmit = e => {
    this.setState({ loading: true });
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        const { code, orgName } = this.state;
        const { remember, phoneLoginPassword, orgLoginPassword, ...payloads } = values;
        const { type } = this.state;
        if (remember) {
          global.log('should remember username');
        }

        const variables =
          type === 0
            ? {
                phone: payloads.phone.replace(/\s/g, ''),
                password: hashPassword(phoneLoginPassword),
              }
            : {
                type,
                code,
                username: payloads.username.replace(/\s/g, ''),
                password: hashPassword(orgLoginPassword),
              };

        let loginSucceed = false;

        userLogin(variables)
          .then(async ({ data: { data: loginData, statusCode, message: error } }) => {
            loginSucceed = statusCode === 200;
            if (loginSucceed) {
              // 登陆成功后重新设置语言
              const { changeLanguageType } = this.context;
              getLanguageType().then(languageType => changeLanguageType(languageType));

              LocalStorage.set(constants.FIELDS.TOKEN_NAME, loginData, { expiration: 3 * 24 * 60 * 60 });
              LocalStorage.set(constants.FIELDS.USER_NAME, payloads.username || payloads.phone);
              await setSensorsUserProfile();
              if (sensors) {
                sensors.track('web_login');
              }
              await setOrganizationConfigInLocalStorage();
              await setOrganizationInfoInLocalStorage();
              await getUserInfo()
                .then(({ data: { data } }) => {
                  LocalStorage.set('USER', data);
                  const {
                    name,
                    id,
                    authorityCodes,
                    phone,
                    username,
                    org: { code },
                  } = data;
                  LocalStorage.set(constants.FIELDS.AUTH, authorityCodes);
                  LocalStorage.set(constants.FIELDS.USER_INFO, { name, id });
                  LocalStorage.set(constants.FIELDS.LOGIN_INFO, {
                    code,
                    orgName,
                    username,
                    phone,
                  });
                  Raven.setUserContext({
                    username,
                    gccode: code,
                  });
                  setTimeout(() => this.authSucceed(loginData), 100);
                })
                .catch(({ response }) => {
                  console.log(_.get(response, 'data.message'));
                });
            } else {
              message.error(error);
            }
          })
          .catch(({ response }) => {
            console.log(_.get(response, 'data.message'));
          })
          .finally(() => {
            this.setState({ loading: false });
          });
      } else {
        this.setState({ loading: false });
      }
    });
  };

  renderPhoneLoginForm = () => {
    const {
      loading,
      preLoginInfo: { phone },
    } = this.state;
    const { getFieldDecorator } = this.props.form;
    const { changeChineseToLocale } = this.context;

    return (
      <Form onSubmit={this.handleSubmit} className={styles.loginForm}>
        <FormItem>
          {getFieldDecorator('phone', {
            initialValue: phone,
            rules: [
              {
                required: true,
                message: changeChineseToLocale('请输入手机号'),
              },
              { pattern: /^\d{11}$/, message: changeChineseToLocale('请输入合法的手机号') },
            ],
          })(<Input maxLength="11" addonBefore={<Icon type="user" />} placeholder="手机号" />)}
        </FormItem>
        <FormItem>
          {getFieldDecorator('phoneLoginPassword', {
            rules: [
              {
                required: true,
                message: changeChineseToLocale('请输入密码'),
              },
            ],
          })(<Input addonBefore={<Icon type="lock" />} type="password" placeholder="密码" />)}
        </FormItem>
        <FormItem>
          <Spin spinning={loading}>
            <Button style={{ width: '100%', height: 32 }} type="primary" htmlType="submit">
              {loading ? '登 录 中...' : '登 录'}
            </Button>
          </Spin>
        </FormItem>
        <FormItem>
          {getFieldDecorator('remember', {
            valuePropName: 'checked',
            initialValue: true,
          })(
            <Checkbox style={{ color: 'rgba(0, 20, 14, 0.4)', lineHeight: '20px' }}>
              {changeChineseToLocale('保持登录')}
            </Checkbox>,
          )}
        </FormItem>
      </Form>
    );
  };

  renderOrgLoginForm = () => {
    const {
      loading,
      orgName,
      preLoginInfo: { username },
    } = this.state;
    const { getFieldDecorator, setFieldsValue, getFieldValue } = this.props.form;
    const { changeChineseToLocale } = this.context;

    return (
      <Form onSubmit={this.handleSubmit} className={styles.loginForm}>
        <FormItem>
          {getFieldDecorator('code', {
            initialValue: orgName,
            rules: [
              {
                required: true,
                message: changeChineseToLocale('请输入工厂代码'),
              },
              { validator: this.manufactoryCodeValidator },
            ],
          })(
            <Input
              maxLength="6"
              addonBefore={<Icon type="home" />}
              placeholder="工厂代码"
              onFocus={() => {
                setFieldsValue({ code: this.state.code });
              }}
              onBlur={async () => {
                await this.setOrgInfo(getFieldValue('code'));
                setFieldsValue({ code: this.state.orgName });
              }}
            />,
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('username', {
            initialValue: username,
            rules: [
              {
                required: true,
                message: changeChineseToLocale('请输入账号'),
              },
            ],
          })(<Input maxLength="20" addonBefore={<Icon type="user" />} placeholder="账号" key="phone" />)}
        </FormItem>
        <FormItem>
          {getFieldDecorator('orgLoginPassword', {
            rules: [
              {
                required: true,
                message: changeChineseToLocale('请输入密码'),
              },
            ],
          })(<Input addonBefore={<Icon type="lock" />} type="password" placeholder="密码" />)}
        </FormItem>
        <FormItem>
          <Spin spinning={loading}>
            <Button style={{ width: '100%', height: 32 }} type="primary" htmlType="submit">
              {loading ? '登 录 中...' : '登 录'}
            </Button>
          </Spin>
        </FormItem>
        <FormItem>
          {getFieldDecorator('remember', {
            valuePropName: 'checked',
            initialValue: true,
          })(<Checkbox style={{ color: 'rgba(0, 20, 14, 0.4)', lineHeight: '20px' }}>保持登录</Checkbox>)}
        </FormItem>
      </Form>
    );
  };

  renderTypeFilter = () => {
    const { changeChineseToLocale } = this.context;
    const { type } = this.state;
    return (
      <div className={styles.loginTypeFilter}>
        <div
          onClick={() => {
            this.setState({ type: 0 });
          }}
          style={type === 0 ? { color: navBlack } : null}
        >
          {changeChineseToLocale('手机号登录')}
        </div>
        <div
          onClick={() => {
            this.setState({ type: 1 });
          }}
          style={type === 1 ? { color: navBlack } : null}
        >
          {changeChineseToLocale('工厂账号登录')}
        </div>
      </div>
    );
  };

  renderLoginHeader = () => {
    const { orgLogoUrl } = this.state;
    return (
      <div className={styles.loginHeader}>
        {orgLogoUrl ? <img alt="logo" src={orgLogoUrl} /> : this.renderLoginTitle()}
      </div>
    );
  };

  renderLoginContent = () => {
    const { type } = this.state;
    return (
      <div className={styles.loginContent}>
        {this.renderTypeFilter()}
        {type === 0 ? this.renderPhoneLoginForm() : this.renderOrgLoginForm()}
      </div>
    );
  };

  renderLoginTitle = () => {
    return (
      <div className={styles.loginTitle} onClick={() => window.open('https://www.blacklake.cn')}>
        {window.companyName === '黑湖智造' && <img src={Image} alt="" height={36} style={{ paddingRight: 10 }} />}
        <span>{window.companyName}</span>
      </div>
    );
  };

  manufactoryCodeValidator = (rule, value, cb) => {
    const { changeChineseToLocale } = this.context;

    if (value && value === this.state.orgName) return cb();
    const reg = /^[a-zA-Z0-9]{6}$/;
    if (!reg.test(value) && value) {
      return cb(changeChineseToLocale('请输入正确工厂代码（6位数字或字母）'));
    }
    return cb();
  };

  render() {
    const hostname = window.location.hostname;

    return (
      <div className={styles.loginWrapper}>
        {hostname && hostname.endsWith('genormis.com') ? null : (
          <div className={styles.blLogo} onClick={() => window.open('https://www.blacklake.cn')} />
        )}
        <div className={styles.loginFormContainer}>
          {this.renderLoginHeader()}
          {this.renderLoginContent()}
        </div>
      </div>
    );
  }
}

Login.contextTypes = {
  changeLanguageType: PropTypes.any,
  changeChineseToLocale: PropTypes.any,
};

export default Form.create()(Login);
