// 成品条码标签打印
import React, { Component } from 'react';

import ProjectList from 'src/containers/electronicTags/printPage/projectList';
import CreateTag from 'src/containers/electronicTags/printPage/createTag';
import ChoosePrint from 'src/containers/electronicTags/printPage/print/choosePrint';
import TagList from 'src/containers/electronicTags/printPage/createTag/tagList';

const PrintPage = () => {
  return (
    <div style={{ padding: 20 }}>
      <ProjectList />
      <CreateTag />
      <TagList />
      <ChoosePrint />
    </div>
  );
};

export default PrintPage;
