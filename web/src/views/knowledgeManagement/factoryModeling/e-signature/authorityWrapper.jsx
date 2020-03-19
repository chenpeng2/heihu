import React from 'react';
import LocalStorage from 'src/utils/localStorage';
import _ from 'lodash';

import { FIELDS } from 'src/constants';

type Props = {
  auth: [string],
};
/**
 * 暂时只做了权限disabled，有其他需要之后再加
 * ex：
 *    const AuthLink = AuthorityWrapper(Link);
 *    <AuthLink auth={[auth.WEB_START_PROJECT, auth.WEB_CANCEL_PROJECT]} {...props} />
 *    <AuthLink auth={auth.WEB_START_PROJECT} {...props} />
 */

export default WrappedComponent => {
  const auths = LocalStorage.get(FIELDS && FIELDS.AUTH);

  return (props: Props) => {
    const { auth, ...rest } = this.props;
    const noAuth = auths === null || (!Array.isArray(auth) && !auths.includes(auth)) || (Array.isArray(auth) && auth.length && !_.intersection(auths, auth).length);

    return (<WrappedComponent disabled={noAuth} {...rest} />);
  };
};
