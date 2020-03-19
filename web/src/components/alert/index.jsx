import React from 'react';
import { injectIntl } from 'react-intl';
import { Alert } from 'antd';

import { changeChineseToLocale } from 'utils/locale/utils';

/**
 * @api {Alert} 警告.
 * @APIGroup Alert.
 * @apiExample {js} Example usage:
 * 例子参见antd的Alert
 */

type Props = {
  intl: any,
};

const CustomAlert = (props: Props) => {
  const { intl, message, description, closeText, ...rest } = props || {};

  const newProps = {
    message: changeChineseToLocale(message, intl),
    description: changeChineseToLocale(description, intl),
    closeText: changeChineseToLocale(closeText, intl),
    ...rest,
  };
  return <Alert {...newProps} />;
};

export default injectIntl(CustomAlert);
