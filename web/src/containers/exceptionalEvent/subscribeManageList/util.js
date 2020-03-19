import _ from 'lodash';

import { getUsers } from 'src/services/auth/user';
import { getWorkgroups } from 'src/services/auth/workgroup';

export const USER_TYPE = {
  user: 0,
  userGroup: 1,
};

export const externalSearch = async params => {
  const { search, ...rest } = params || {};

  const usersData = await getUsers({ name: search, ...rest });
  const groupsData = await getWorkgroups({ name: search, ...rest });

  const users = _.get(usersData, 'data.data').map(({ id, name }) => {
    return { key: `${id}-user`, label: name };
  });
  const groups = _.get(groupsData, 'data.data').map(({ id, name }) => {
    return { key: `${id}-userGroup`, label: name };
  });

  return [].concat(users).concat(groups);
};

export const formatUser = value => {
  if (!value) return null;

  console.log(value);
  const { key, label } = value || {};
  const _value = key ? key.split('-') : [];

  return {
    userType: USER_TYPE[_value[1]],
    userId: _value[0],
    userName: label,
  };
};

export default 'dummy';
