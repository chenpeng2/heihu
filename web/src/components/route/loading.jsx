import React from 'react';
import Loadable from 'react-loadable';
import { createBrowserHistory } from 'history';
import { Spin } from 'antd';

const containerStyle = {
  textAlign: 'center',
  height: '100%',
  width: '100%',
  display: 'flex',
  jusitfyContent: 'space-around',
};
const childrenStyle = {
  fontSize: 40,
  width: '100%',
  alignSelf: 'center',
};

const history = createBrowserHistory();

export default ({ isLoading, error }: { isLoading: boolean, error: any }) => {
  if (isLoading) {
    return (
      <div style={containerStyle}>
        <Spin size="large" style={childrenStyle} />
      </div>
    );
  } else if (error) {
    history.replace('/');
  }
  return null;
};
