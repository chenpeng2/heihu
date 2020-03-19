import React from 'react';
import _ from 'lodash';
import { FIELDS } from 'src/constants';
import LocalStorage from '../localStorage';

export default WrappedComponent => {
  const auths = LocalStorage.get(FIELDS && FIELDS.AUTH);

  return props => {
    const { auth, ...rest } = this.props;
    const noAuth =
      auths === null ||
      (!Array.isArray(auth) && !auths.includes(auth)) ||
      (Array.isArray(auth) && auth.length && !_.intersection(auths, auth).length);

    return <WrappedComponent disabled={noAuth} {...rest} />;
  };
};
