import React from 'react';

import { Link, Button } from 'src/components';

const LinkToCreateWorkingTimePage = (props: { render: () => {} }) => {
  const { render } = props || {};
  const path = '/knowledgeManagement/workingTime/create';

  return (
    <Link to={path}>
      {render ? (
        render()
      ) : (
        <Button style={{ margin: '20px' }} icon="plus-circle-o">
          创建工作时间
        </Button>
      )}
    </Link>
  );
};

export default LinkToCreateWorkingTimePage;
