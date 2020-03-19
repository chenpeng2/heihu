import React from 'react';

import { Link, Icon } from 'src/components';

const LinkToEditPage = (props: { render: () => {}, style: {} }) => {
  const { render, code, iconType, style } = props || {};
  if (!code) return null;

  const path = `/cooperate/materialRequest/${code}/edit`;

  return (
    <Link to={path} style={style}>
      {render ? (
        render()
      ) : (
        <div style={{ marginRight: 10, display: 'inline-block' }}>
          {iconType ? (
            <Icon
              type={iconType}
              style={{
                fontSize: '16px',
                marginRight: 10,
                verticalAlign: 'middle',
              }}
            />
          ) : null}
          <span style={{ marginLeft: iconType ? 5 : 0 }}>编辑</span>
        </div>
      )}
    </Link>
  );
};

export default LinkToEditPage;
