import React, { Component } from 'react';
import Base from './base';

type Props = {
  location: {
    query: {},
  },
};

class CreateStorage extends Component {
  props: Props;
  state = {};

  render() {
    const { location: { query } } = this.props;

    return (
      <Base type={'创建'} query={query} />
    );
  }
}

export default CreateStorage;
