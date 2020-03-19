import React from 'react';
import { Icon, Tooltip } from 'components';

const RelationWorkerTooltip = () => {
  return (
    <Tooltip.AntTooltip title="该设置会影响全部子节点的工位">
      <Icon type="exclamation-circle-o" style={{ marginLeft: 4 }} />
    </Tooltip.AntTooltip>
  );
};

export default RelationWorkerTooltip;
