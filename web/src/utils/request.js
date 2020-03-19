import { genAuthHeaders } from 'src/store/helpers';
import { history } from 'src/routes';
import LocalStorage from 'utils/localStorage';
import { FIELDS, VERSION } from 'constants';
import _ from 'lodash';
import ExpiredModal from 'components/modal/expiredModal';
import { message } from 'src/components';
import axios from 'axios';
import { setOrganizationConfigInLocalStorage, setOrganizationInfoInLocalStorage } from 'src/utils/organizationConfig';
import { logout } from 'src/views/app/accountInfo';
import { setSensorsUserProfile } from 'src/utils/sensors';
import { getParams } from 'src/utils/url';
import { getUserInfo } from 'src/services/auth/user';
import conf from 'src/configs/conf';
import { getLanguageTypeInLocalStorage, findLanguage } from 'src/utils/locale/utils';

import { showLoading } from './loading';
import { sign, signNeeded, getOrgId } from './sign';

let axiosInstance;

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const errortext = codeMessage[response.status] || response.statusText;
  const error = new Error(errortext);
  error.name = response.status;
  error.response = response;
  throw error;
}

export const getHeaders = () => ({
  'X-AUTH': LocalStorage.get(FIELDS.TOKEN_NAME),
  'X-SERVICE': 'gc-graphql',
  'X-CLIENT-VERSION': VERSION,
  'X-CLIENT': 'web',
});

const setUrlToken = () => {
  const { token } = getParams();
  if (!token) return false;

  // 调整到默认的页面
  history.push('/');

  if (token) {
    // 如果有token先设置token
    LocalStorage.set(FIELDS.TOKEN_NAME, token, 60 * 60 * 24);

    // 拉取用户数据
    getUserInfo()
      .then(({ data: { data } }) => {
        LocalStorage.set('USER', data);
        const { name, id, authorityCodes } = data;
        LocalStorage.set(FIELDS.AUTH, authorityCodes);
        LocalStorage.set(FIELDS.USER_INFO, { name, id });

        // growingIo配置
        setSensorsUserProfile();

        // 拉取工厂配置
        setOrganizationConfigInLocalStorage();
        setOrganizationInfoInLocalStorage();

        // 调整到默认的页面
        history.push('/');
      })
      .catch(({ response }) => {
        console.log(_.get(response, 'data.message'));
      });

    return true;
  }
};

const showLogoutModal = _.debounce((props: { message: String }) => {
  const { message, ...rest } = props || {};
  ExpiredModal({
    title: '登出提示',
    content: message,
    okText: '返回登出',
    onOk: () => logout(),
    ...rest,
  });
}, 1500);

export const checkLoginStatus = async () => {
  // 如果登录url中带有token那么直接登录
  if (await setUrlToken()) return;
  const token = LocalStorage.get(FIELDS.TOKEN_NAME);
  const auth = LocalStorage.get(FIELDS.AUTH);
  const pathname = document.location.pathname;
  const orgCode = _.split(document.location.search, '?code=')[1];
  if (pathname === '/login' || orgCode) return;
  if (!token) {
    // 登录信息丢失
    logout();
  }
  if (token === 'expired' && auth) {
    // 过期
    showLogoutModal({ message: '您的账户登录时长已超过3天，请重新登录。', title: '登录过期' });
  }
};

const signAndReRequest = async error => {
  if (!error && !error.config) return;

  const { config } = error;
  const { retry, url } = config;
  if (retry && retry.url === url) {
    message.warn('签名失败，请检查用户名和密码是否正确', 1);
    error.retry = undefined;
    return Promise.reject(new Error('签名失败，请检查用户名和密码是否正确'));
  }

  try {
    const ret = await sign();
    if (!ret) return;
    const orgId = getOrgId();
    const header = {
      'X-Signature-Org-Code': orgId,
      'X-Signature-User-Name': ret.username,
      'X-Signature-Password': ret.password,
    };
    config.headers = Object.assign({}, header, config.headers);
    config.retry = { url, time: new Date() };
    if (!axiosInstance) return;
    return axiosInstance.request(config);
  } catch (error) {
    if (error === 'canceled') {
      message.warn('电子签名取消');
    }
    return Promise.reject(new Error(''));
  }
};

const requestInterceptor = config => {
  const loading = _.get(config, 'loading', false);
  checkLoginStatus();
  const authHeaders = genAuthHeaders();
  if (loading && authHeaders) {
    showLoading(true);
  }
  if (!authHeaders) {
    const conf = {
      headers: {},
      method: config.method,
      url: '',
    };
    return conf;
  }
  const configHeaders = config && config.headers ? config.headers : {};

  // 后端需要的header
  const languageType = getLanguageTypeInLocalStorage();
  const { headerValue } = findLanguage(languageType) || {};

  const conf = {
    ...config,
    headers: {
      ...authHeaders,
      'content-type': 'application/json',
      ...configHeaders,
      'X-Lang': headerValue, // 国际化头
    },
  };
  return conf;
};

const responseInterceptor = response => {
  showLoading(false);
  return response;
};

const responseErrorInterceptor = (error, errorHandle) => {
  showLoading(false);
  const statusCode = _.get(error, 'response.status');
  const _message = _.get(error, 'response.data.message');
  const token = LocalStorage.get(FIELDS.TOKEN_NAME);
  if (statusCode === 401 && token) {
    showLogoutModal({ message: _message });
  } else if (signNeeded(error)) {
    return signAndReRequest(error);
  } else if (errorHandle && typeof errorHandle === 'function') {
    errorHandle(error);
  } else {
    message.error(_.get(error, 'response.data.description'));
  }
  return Promise.reject(error);
};

// 获取对request的配置能力，当需要对错误进行额外处理的时候可以调用这个函数来生成自己的instance
export const getCustomerInstance = errorHandle => {
  const config = { baseURL: conf.API };
  const instance = axios.create(config);
  instance.interceptors.request.use(requestInterceptor, error => Promise.reject(error));
  instance.interceptors.response.use(responseInterceptor, error => responseErrorInterceptor(error, errorHandle));
  return instance;
};

const defaultInstance = getCustomerInstance();
axiosInstance = defaultInstance;

export default defaultInstance;
