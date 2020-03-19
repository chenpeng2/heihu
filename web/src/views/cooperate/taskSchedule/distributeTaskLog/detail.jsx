import React from 'react';
import { getScheduleLogDetail } from 'services/schedule';
import _ from 'lodash';
import { replaceSign } from 'constants';
import DetailBase from '../logBase/detailBase';

const LogDetail = props => {
  return <DetailBase {...props} fetchData={getScheduleLogDetail} title={'下发日志详情'} />;
};

export default LogDetail;
