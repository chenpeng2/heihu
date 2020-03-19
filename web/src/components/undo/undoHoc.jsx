import React, { Component } from 'react';
import openUndo from './openUndo';

const undoHoc = WrappedComponent => {
  return class UndoHoc extends Component {
    state = {};
    render() {
      return <WrappedComponent {...this.props} undo={openUndo} />;
    }
  };
};


export default undoHoc;
