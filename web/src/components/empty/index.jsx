import React from 'react';
import { Empty as AntEmpty } from 'antd';

type EmptyPropTypes = {};

export default function Empty(props: EmptyPropTypes) {
  return <AntEmpty {...props} />;
}
