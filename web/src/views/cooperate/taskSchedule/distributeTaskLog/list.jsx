import React from 'react';
import { getScheduleLogs } from 'services/schedule';
import ListBase from '../logBase/listBase';

const LogList = props => {
  return <ListBase {...props} fetchData={params => getScheduleLogs({ ...params, type: 1 })} />;
};

export default LogList;
