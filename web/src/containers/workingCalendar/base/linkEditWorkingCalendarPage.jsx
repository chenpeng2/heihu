import React from 'react';

import { Link } from 'src/components';

const LinkToCreateWorkingCalendarPage = (props: { render: () => {}, id: string }) => {
  const { render, id } = props || {};
  if (!id) return null;

  const path = `/knowledgeManagement/workingCalendar/${id}/edit`;

  return (
    <Link to={path}>
      {render ? (
        render()
      ) : (
        <div style={{ marginRight: '10px', display: 'inline-block' }} icon="plus-circle-o">
          编辑
        </div>
      )}
    </Link>
  );
};

export default LinkToCreateWorkingCalendarPage;
