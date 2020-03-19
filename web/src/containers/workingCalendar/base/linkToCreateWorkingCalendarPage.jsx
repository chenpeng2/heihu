import React from 'react';

import { Link, Button } from 'src/components';

const LinkToCreateWorkingCalendarPage = (props: { render: () => {} }) => {
  const { render } = props || {};
  const path = '/knowledgeManagement/workingCalendar/create';

  return (
    <Link to={path}>
      {render ? (
        render()
      ) : (
        <Button style={{ margin: '20px' }} icon="plus-circle-o">
          创建规则
        </Button>
      )}
    </Link>
  );
};

export default LinkToCreateWorkingCalendarPage;
