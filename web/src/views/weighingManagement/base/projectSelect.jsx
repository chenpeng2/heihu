import React, { Component } from 'react';
import _ from 'lodash';

import { Select } from 'components';

import { getProjectList } from 'src/services/cooperate/project';

const { Option } = Select;

type Props = {
  loadOnFocus: boolean,
};

class ProjectSelect extends Component {
  props: Props;
  constructor(props) {
    super(props);
    this.handleSearch = _.debounce(this.handleSearch, 800);
    this.firstFocus = false; // 第一次focus不应该拉取数据
    this.state = {
      data: [],
    };
  }

  componentDidMount = () => {
    if (!this.props.loadOnFocus) {
      this.handleSearch();
    }
  };

  fetchData = async params => {
    // 项目状态过滤[已结束, 已取消]
    await getProjectList({ size: 50, statuses: '1,2,3', ...params })
      .then(({ data: { data } }) => {
        // 过滤：项目创建类型为工艺路线时没有物料清单
        // const _filter = _.filter(data, o => o && o.createdType !== 'processRouting');
        this.setState({ data });
      })
      .catch(err => console.log(err));
  };

  handleSearch = search => {
    this.fetchData({ search });
  };

  render() {
    const { data } = this.state;

    return (
      <Select
        onSearch={this.handleSearch}
        onFocus={() => {
          // 默认第一次focus是不拉数据的，若需要loadOnFocus则单独再拉一次
          if (this.firstFocus || this.props.loadOnFocus) {
            this.handleSearch();
          } else {
            this.firstFocus = true;
          }
        }}
        allowClear
        filterOption={false}
        {...this.props}
      >
        {data && data.map(({ projectCode }) => <Option key={projectCode}>{projectCode}</Option>)}
      </Select>
    );
  }
}

export default ProjectSelect;
