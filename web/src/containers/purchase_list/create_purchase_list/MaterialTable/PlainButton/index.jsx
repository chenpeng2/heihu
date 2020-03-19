import React from 'react';
import { primary } from 'styles/color';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';

type Props = {
  onPress: () => void,
  intl: any,
};

function PlainButton(props: Props) {
  const { onPress } = props;
  const style = { color: primary, cursor: 'pointer', margin: '0 5px 0 0' };
  return (
    <span onClick={onPress} style={style}>
      {changeChineseToLocale('删除', props.intl)}
    </span>
  );
}

export default React.memo(injectIntl(PlainButton));
