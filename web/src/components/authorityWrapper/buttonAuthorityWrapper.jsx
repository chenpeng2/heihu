import React from 'react';
import _ from 'lodash';

import LocalStorage from 'src/utils/localStorage';
import { checkLoginStatus } from 'utils/request';
import { getOrganizationConfigFromLocalStorage } from 'src/utils/organizationConfig';
import { openModal } from 'src/components';
import { queryESignatureStatus } from 'services/knowledgeBase/eSignature';
import ElectronicSignatrueModal from './electronicSignatrueModal';
import { FIELDS } from '../../constants';
import styles from './styles.scss';

/**
 * @api {buttonAuthorityWrapper} 为操作类按钮加上权限限制,一个高阶组件.
 * @APIGroup buttonAuthorityWrapper.
 * @apiParam {React.node} Component 传进来的组件.
 * @apiParam {[String]} authority 为传进来的组件需要的属性.
 * @apiExample {js} Example usage:
 * const MenuItem = buttonAuthorityWrapper(Menu.Item);
  <MenuItem authority={[PRODUCTORDER_LIST]} key="cooperate/productOrders">
    项目
  </MenuItem>
 */

type Props = {
  auth: [string],
  organizationConfig: [string],
  signConfigKey: string,
  onClick: () => {},
  validateFunc: () => {},
};
const { AUTH } = FIELDS;
export default Compo => {
  // 权限配置
  const auths = LocalStorage.get(AUTH);
  // 工厂配置
  const configs = getOrganizationConfigFromLocalStorage();

  return (props: Props) => {
    const { auth, organizationConfig, signConfigKey, onClick, validateFunc } = props;
    const noAuth =
      auths === null ||
      (!Array.isArray(auth) && !auths.includes(auth)) ||
      (Array.isArray(auth) && auth.length && !_.intersection(auths, auth).length);
    let hasRightConfig = true;
    let hasErrorConfigNum = 0;
    if (Array.isArray(organizationConfig)) {
      organizationConfig.forEach(({ key, value }) => {
        if (!configs[key] || (configs[key] && configs[key].configValue !== value)) {
          hasErrorConfigNum += 1;
        }
      });
      if (hasErrorConfigNum === organizationConfig.length) {
        hasRightConfig = false;
      }
    }
    const noConfig = configs === null || !hasRightConfig;

    if (auth && organizationConfig && (noAuth || noConfig)) {
      return <Compo className={styles.authButton} {...props} />;
    } else if (auth && noAuth) {
      return <Compo className={styles.authButton} {...props} />;
    } else if (organizationConfig && noConfig) {
      return <Compo className={styles.authButton} {...props} />;
    } else if (signConfigKey) {
      return (
        <Compo
          {...props}
          onClick={async () => {
            const { data } = await queryESignatureStatus(signConfigKey);
            const signStatus = data.data || false;
            // 弹出电子签名框之前是否需要验证表单之类，验证结果默认为true
            let validateResult = true;
            if (validateFunc) {
              validateResult = validateFunc();
            }
            if (validateResult) {
              if (signStatus) {
                openModal({
                  title: '电子签名',
                  footer: null,
                  children: <ElectronicSignatrueModal onClick={onClick} />,
                  width: 660,
                });
              } else {
                onClick();
              }
            }
          }}
        />
      );
    }

    return <Compo {...props} />;
  };
};
