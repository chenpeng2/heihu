import React from 'react';
import { replaceSign } from 'constants';

const TaskDetailHeader = (props: { taskNo: string, taskStatus: string }) => {
  const { taskNo, taskStatus } = props;
  const liStyle = {
    marginTop: 10,
  };
  const labelStyle = {
    paddingRight: 5,
  };
  return (
    <ul style={{ paddingLeft: 16 }}>
      <li style={liStyle}>
        <span style={labelStyle}>任务号:</span>
        <span>{taskNo || replaceSign}</span>
      </li>
      <li style={liStyle}>
        <span style={labelStyle}>任务状态:</span>
        <span>{ taskStatus || replaceSign}</span>
      </li>
    </ul>
  );
};

export default TaskDetailHeader;
