// 产品批次号选择。暂时没有使用。后期使用。不要删除
import React, { Component } from 'react';
import _ from 'lodash';

import { Select } from 'src/components';
import { getProductBatchSeq } from 'src/services/barCodeLabel';

const Option = Select.Option;

type Props = {
  projectCode: string,
};

class ProductBatchSeqSelect extends Component {
  props: Props;
  state = {
    data: [],
  };

  componentDidMount() {
    const { projectCode } = this.props;
    this.getData({ projectCode });
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.projectCode, this.props.projectCode)) {
      this.getData({ projectCodes: nextProps.projectCode });
    }
  }

  getData = params => {
    const { projectCodes } = params || {};

    console.log('projectCode', projectCodes);

    if (!projectCodes) return;

    getProductBatchSeq({ projectCodes }).then(res => {
      const data = _.get(res, 'data.data');

      if (Array.isArray(data)) {
        this.setState({
          data: data.map(i => {
            return {
              key: i,
              label: i,
            };
          }),
        });
      }
    });
  };

  render() {
    const { data } = this.state;

    return (
      <Select {...this.props}>
        {data.map(i => {
          const { key, label } = i || {};
          return (
            <Option value={key} key={key}>
              {label}
            </Option>
          );
        })}
      </Select>
    );
  }
}

export default ProductBatchSeqSelect;
