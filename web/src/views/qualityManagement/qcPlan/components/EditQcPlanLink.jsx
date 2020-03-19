import React from 'react';
import { Link } from 'components';
import PropTypes from 'prop-types';

import { toEditQcPlan } from '../../navigation';

type Props = {
  params: {
    code: String,
    category: Number,
  },
};

const EditQcPlanLink = (props: Props, context) => {
  const { children, params } = props || {};
  const { changeChineseToLocale } = context;
  const url = toEditQcPlan(params);
  return <Link to={url}>{children || changeChineseToLocale('编辑')}</Link>;
};

EditQcPlanLink.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export default EditQcPlanLink;
