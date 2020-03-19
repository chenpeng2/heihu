import React from 'react';

import { Link } from 'src/components';

const LinkToWorkingCalendarDetail = (props: { render: () => {}, id: string }) => {
  const { render, id } = props || {};
  if (!id) return null;

  const path = `/knowledgeManagement/workingCalendar/${id}/detail`;

  return (
    <Link to={path}>
      {render ? (
        render()
      ) : (
        <div style={{ marginRight: '10px', display: 'inline-block' }}>
          查看
        </div>
      )}
    </Link>
  );
};

export default LinkToWorkingCalendarDetail;
