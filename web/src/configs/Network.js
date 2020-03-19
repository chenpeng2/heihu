/**
 * Created by huangyuchen on 03/12/2016.
 */
import CONF, { VERSION } from './conf';

const API = CONF.API;
const SUBSCRIPTION_URL = CONF.SUBSCRIPTION_URL;

console.log('app configuration', { ...CONF, API, SUBSCRIPTION_URL, VERSION });

export default {
  API,
  SUBSCRIPTION_URL,
};
