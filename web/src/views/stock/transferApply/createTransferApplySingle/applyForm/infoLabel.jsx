import React from 'react';
import { renderTooltip } from '../../createTransferApplyForTaskSchedule/utils';

const InfoLabel = ({ title, info }) => {
  return <span>{renderTooltip(title, info)}</span>;
};

export default InfoLabel;
