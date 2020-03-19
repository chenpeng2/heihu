import { changeChineseToLocale } from 'utils/locale/utils';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

type Props = {
  intl: any,
  children: String,
  templateParams: Object,
};

const Text = ({ children, intl, templateParams }: Props, context) => {
  if (templateParams) {
    const { changeChineseTemplateToLocale } = context;
    return changeChineseTemplateToLocale(children, templateParams);
  }
  return changeChineseToLocale(children, intl);
};

Text.contextTypes = {
  changeChineseTemplateToLocale: PropTypes.any,
};

export default injectIntl(Text);
