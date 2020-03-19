import React from 'react';
import CreateRepairTaskByDevice from './device';
import CreateRepairTaskByTooling from './tooling';

type Props = {
  location: any,
};

const CreateRepairTask = (props: Props) => {
  const { location } = props;
  const { query } = location;
  // type是指是设备创建维修任务还是工装创建维修任务
  const { type = 'device' } = query;

  if (type === 'tooling') {
    return <CreateRepairTaskByTooling />;
  }

  return <CreateRepairTaskByDevice />;
};

export default CreateRepairTask;
