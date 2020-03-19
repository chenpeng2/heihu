import React, { Component } from 'react';
import _ from 'lodash';

import { Select } from 'components';
import { getUsers } from 'src/services/auth/user';

const Option = Select.Option;

type propTypes = {
  params: {},
  loadOnFocus: boolean,
  style: {},
  preOptions: [Node],
};

class AuditorSelect extends Component<propTypes> {
  constructor(props) {
    super(props);
    this.handleSearch = _.debounce(this.handleSearch, 800);
    this.state = {
      data: [],
    };
  }

  componentDidMount = () => {
    const { loadOnFocus } = this.props;
    if (!loadOnFocus) {
      this.fetchData();
    }
  };

  fetchData = async p => {
    const { params } = this.props;

    await getUsers({ ...params, ...p, size: 50, active: true })
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
    const { preOptions, params, loadOnFocus, style, ...rest } = this.props;

    return (
      <Select style={{ width: 200, ...style }} onSearch={this.handleSearch} onFocus={() => (loadOnFocus ? this.fetchData() : null)} {...rest}>
        {preOptions}
        {data &&
          data.map(({ id, name }) => (
            <Option key={id} value={id}>
              {name}
            </Option>
          ))}
      </Select>
    );
  }
}

export default AuditorSelect;
