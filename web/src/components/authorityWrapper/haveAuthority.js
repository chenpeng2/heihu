import LocalStorage from 'utils/localStorage';
import { checkLoginStatus } from 'utils/request';
import { FIELDS } from '../../constants';

const haveAuthority = auth => {
  const { AUTH } = FIELDS;
  const auths = LocalStorage.get(AUTH);
  return auths.includes(auth);
};

export default haveAuthority;
