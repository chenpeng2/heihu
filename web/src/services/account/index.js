import request from '../../utils/request';

export default async function getAccounts(params) {
  return request.get('rest/account', { params });
};

export async function getAccountsConfig() {
  return request.get('def/v1/config');
}
