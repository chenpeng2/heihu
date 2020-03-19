import React, { Component } from 'react';
import Base from './base';

type Props = {
  location: {
    query: {},
  },
};

class EditStoreHouse extends Component {
  props: Props;
  state = {};

  render() {
    const { location: { query } } = this.props;
    return (
      <Base type={'编辑'} query={query} />
    );
  }
}

export default EditStoreHouse;
