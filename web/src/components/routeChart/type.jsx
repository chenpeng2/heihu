// @flow
import * as React from 'react';

export type nodeDataType = {};

export type nodeContainerDataType = {
  req: any,
  name: string,
  nodes: Array<nodeDataType>,
};

export type allDataType = Array<nodeContainerDataType>;

export type renderNodeType = (data: nodeDataType, dataIndex: number, nodeContainerDataIndex: number, allData: allDataType) => React.Node;

export type renderContainerType = (data: nodeContainerDataType, dataIndex: number, allData: allDataType) => React.Node;

