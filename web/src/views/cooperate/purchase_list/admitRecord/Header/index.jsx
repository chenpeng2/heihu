import React from 'react';
import { black } from 'styles/color';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';

type Props = {
  intl: any,
};

function Header(props: Props) {
  const style = { margin: '20px 0 30px 20px', color: black, fontSize: 16, display: 'inline-block' };
  return <div style={style}>{changeChineseToLocale('入厂记录', props.intl)}</div>;
}

export default React.memo(injectIntl(Header));
