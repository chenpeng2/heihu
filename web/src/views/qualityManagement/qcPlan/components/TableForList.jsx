import React from 'react';
import { Table } from 'components';

export function getQcPlanListColumns(props) {
  return [];
}

export function QcPlanListTable() {
  return <Table rowKey={record => record.code} />;
}

export default 'dummy';
