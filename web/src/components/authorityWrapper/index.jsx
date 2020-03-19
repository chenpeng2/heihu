import React from 'react';
import _ from 'lodash';

import { checkLoginStatus } from 'utils/request';
import LocalStorage from 'src/utils/localStorage';
import { getOrganizationConfigFromLocalStorage } from 'src/utils/organizationConfig';
import { arrayIsEmpty } from 'src/utils/array';

import { FIELDS } from '../../constants';

/**
 * @api {authorityWrapper} 加上权限限制,一个高阶组件.
 * @APIGroup authorityWrapper.
 * @apiParam {React.node} Component 传进来的组件.
 * @apiParam {[String]} authority 为传进来的组件需要的属性.
 * @apiExample {js} Example usage:
 * const MenuItem = authorityWrapper(Menu.Item);
   <MenuItem authority={[PRODUCTORDER_LIST]} key="cooperate/productOrders">
     项目
   </MenuItem>
 */

type Props = {
  auth: [string],
  organizationConfig: [string],
};
const { AUTH, TOKEN_NAME } = FIELDS;
const authorityWrapper = Compo => {
  return (props: Props) => {
    const { auth, organizationConfig } = props;

    // 处理登录信息丢失
    checkLoginStatus();
    const auths = LocalStorage.get(AUTH);

    // 权限配置
    if (auth) {
      if (
        (!Array.isArray(auth) && !auths.includes(auth)) ||
        (Array.isArray(auth) && auth.length && !_.intersection(auths, auth).length)
      ) {
        return null;
      }
    }

    // 工厂配置
    const configs = getOrganizationConfigFromLocalStorage();

    let hasRightConfig = true;
    let hasErrorConfigNum = 0;
    if (!arrayIsEmpty(organizationConfig)) {
      organizationConfig.forEach(({ key, value }) => {
        if (!configs[key] || (configs[key] && configs[key].configValue !== value)) {
          hasErrorConfigNum += 1;
        }
      });
      if (hasErrorConfigNum === organizationConfig.length) {
        hasRightConfig = false;
      }
    }

    if (configs === null || !hasRightConfig) {
      return null;
    }

    return <Compo {...props} />;
  };
};

export default authorityWrapper;
