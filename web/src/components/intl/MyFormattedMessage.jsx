/**
 * @description: 国际化组件。主要用来翻译有html样式的内容
 *
 * @date: 2019/8/2 下午2:20
 */
import React from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';
import { findIntlIdByChineseText } from 'src/utils/locale/utils';
import { replaceSign } from 'src/constants';

const GcFormattedMessage = props => {
  const { id, style, defaultMessage, description, values, ...rest } = props;
  const _id = id || findIntlIdByChineseText(defaultMessage);
  if (!_id) {
    return (
      <span style={style} {...rest}>
        {defaultMessage || replaceSign}
      </span>
    );
  }

  return (
    <span style={style} {...rest}>
      <FormattedMessage defaultMessage={defaultMessage} description={description} values={values} id={_id} />
    </span>
  );
};

GcFormattedMessage.propTypes = {
  style: PropTypes.any,
  defaultMessage: PropTypes.any,
  id: PropTypes.any,
  description: PropTypes.any,
  values: PropTypes.any,
};

export default GcFormattedMessage;
