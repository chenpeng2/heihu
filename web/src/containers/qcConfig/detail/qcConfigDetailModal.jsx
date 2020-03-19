/**
 * @description: 质检方案的modal展示。qcModal只有有数据才可以调用。这个加上了有id的情况
 *
 * @date: 2019/4/4 上午11:02
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { getQcConfigByIds } from 'src/services/qcConfig';
import QcModal from 'src/components/modal/qcModal';

class QcDetailModal extends Component {
  state = {
    _qcConfigData: [],
  };

  componentDidMount() {
    this.getQcConfigsData(this.props);
  }

  componentDidUpdate(preProps) {
    if (!_.isEqual(preProps.qcConfigIds, this.props.qcConfigIds)) {
      this.getQcConfigsData(this.props);
    }
    if (!_.isEqual(preProps.qcConfigDetailData, this.props.qcConfigDetailData)) {
      this.getQcConfigsData(this.props);
    }
  }

  getQcConfigsData = async props => {
    if (!props) return;
    const { qcConfigIds, qcConfigDetailData } = props;
    if (Array.isArray(qcConfigDetailData) && qcConfigDetailData.length) {
      this.setState({
        _qcConfigData: qcConfigDetailData,
      });
      return;
    }

    if (Array.isArray(qcConfigIds) && qcConfigIds.length) {
      const res = await getQcConfigByIds(qcConfigIds);
      const data = _.get(res, 'data.data');
      this.setState({
        _qcConfigData: data,
      });
    }
  };

  render() {
    const { _qcConfigData } = this.state;
    return <QcModal data={_qcConfigData} {...this.props} />;
  }
}

QcDetailModal.propTypes = {
  style: PropTypes.object,
  qcConfigIds: PropTypes.array, // 如果传了qcConfig的ids那么拉取数据
  qcConfigDetailData: PropTypes.array, // 如果传了具体的数据，那么就用具体的数据。优先级比ids高
};

export default QcDetailModal;
