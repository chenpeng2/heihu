import React, { Component } from 'react';
import _ from 'lodash';

import { Select } from 'antd';
import { getUsers } from 'src/services/auth/user';

const Option = Select.Option;

type Props = {
  params: {},
  style: {},
};

class AuditorSelect extends Component {
  props: Props;
  state = {
    data: [],
  };

  componentDidMount = () => {
    this.fetchData();
  };

  shouldComponentUpdate = (nextProps, nextState) => {
    if (!_.isEqual(nextProps.params, this.props.params)) {
      this.fetchData(nextProps.params);
    }
    return true;
  };

  fetchData = async p => {
    const { params } = this.props;

    await getUsers({ size: 50, active: true, ...params, ...p })
      .then(res => {
        const data = _.get(res, 'data.data');
        this.setState({ data });
      })
      .catch(err => console.log(err));
  };

  handleSearch = v => {
    this.fetchData({ name: v });
  };

  render() {
    const { data } = this.state;
    const { params, style, ...rest } = this.props;

    return (
      <Select
        onSearch={this.handleSearch}
        style={{ width: 200, ...style }}
        {...rest}
        filterOption={false}
      >
        {data && data.map(({ id, name }) => (<Option value={id} key={id}>{name}</Option>))}
      </Select>
    );
  }
}

export default AuditorSelect;
