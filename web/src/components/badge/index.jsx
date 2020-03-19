// @flow
import React from 'react';
import { Badge } from 'antd';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import { primary } from 'styles/color';

const MyBadge = (props: { intl: any, color: string, style: any, text: string, size: number }): any => {
  const { color, style, text, size, intl } = props;
  const baseStyle = { display: 'inline-block' };
  return (
    <div style={style}>
      <div
        style={{
          ...baseStyle,
          background: color || primary,
          marginRight: 10,
          width: size || 8,
          height: size || 8,
          borderRadius: '50%',
        }}
      />
      <div style={{ ...baseStyle }}>{typeof text === 'string' ? changeChineseToLocale(text, intl) : intl}</div>
    </div>
  );
};
const BadgeWithIntl = injectIntl(props => {
  const { text, intl, ...rest } = props;
  return <Badge text={typeof text === 'string' ? changeChineseToLocale(text, intl) : text} {...rest} />;
});

BadgeWithIntl.MyBadge = injectIntl(MyBadge);
BadgeWithIntl.AntBadge = Badge;

export default BadgeWithIntl;
