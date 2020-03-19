import React from 'react';
import { Icon, Tooltip, FormattedMessage } from 'components';
import Color from 'styles/color';

const UnqualifiedProductTip = props => {
  return (
    <span>
      <FormattedMessage style={{ marginRight: 5 }} defaultMessage={'不合格品投产'} />
      <Tooltip.AntTooltip
        title={
          <FormattedMessage
            defaultMessage={'若选择“允许”，则该工序对应的生产任务在执行时允许投入质量状态为“不合格”的物料。'}
          />
        }
      >
        <Icon type="exclamation-circle-o" style={{ color: Color.primary }} />
      </Tooltip.AntTooltip>
    </span>
  );
};

export default UnqualifiedProductTip;
