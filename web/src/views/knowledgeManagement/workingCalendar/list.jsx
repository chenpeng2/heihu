import React, { Component } from 'react';
import _ from 'lodash';

import { Icon, openModal, Modal } from 'src/components';
import { border, primary } from 'src/styles/color';
import { getWorkingCalendarList } from 'src/services/knowledgeBase/workingCalendar';
import Filter from 'src/containers/workingCalendar/list/filter';
import Table from 'src/containers/workingCalendar/list/table';
import { setLocation } from 'utils/url';
import { getLocation, getQuery } from 'src/routes/getRouteParams';
import LinkToCreateWorkingCalendarPage from 'src/containers/workingCalendar/base/linkToCreateWorkingCalendarPage';
import Graph from 'src/containers/workingCalendar/list/graph';

const getData = async params => {
  const res = await getWorkingCalendarList(params);

  return _.get(res, 'data');
};

type Props = {
  style: {},
  match: {},
};

class List extends Component {
  props: Props;
  state = {
    listData: null,
    loading: false,
    totalAmount: 0,
    modalVisible: false,
    visible: false,
  };

  componentDidMount() {
    this.fetchDataAndSetState();
  }

  fetchDataAndSetState = (params, cb) => {
    this.setState({ loading: true });

    const { match } = this.props;
    const id = _.get(this.props, 'match.params.id');
    const lastParams = getQuery(match);
    const location = getLocation(match);
    location.query = { ...location.query, operatingHourId: id, ...params };
    setLocation(this.props, () => location.query);
    getData({ ...lastParams, ...params, size: 10 })
      .then(res => {
        const { data, total } = res || {};
        this.setState({
          listData: data,
          totalAmount: total,
        });
      })
      .finally(() => {
        this.setState({ loading: false }, () => {
          if (cb && typeof cb === 'function') cb();
        });
      });
  };

  renderFilter = () => {
    return <Filter style={{ borderBottom: `1px solid ${border}` }} fetchData={this.fetchDataAndSetState} />;
  };

  renderTable = () => {
    const { loading, listData, totalAmount } = this.state;

    return <Table fetchData={this.fetchDataAndSetState} loading={loading} data={listData} totalAmount={totalAmount} />;
  };

  renderMiddle = () => {
    return (
      <div>
        <LinkToCreateWorkingCalendarPage />
        <div
          style={{ display: 'inline-block', color: primary, cursor: 'pointer' }}
          onClick={() => {
            this.setState({ visible: true });
          }}
        >
          <Icon iconType={'gc'} type={'chakanjilu'} />
          <span>查看生产日历</span>
        </div>
      </div>
    );
  };

  renderModal = () => {
    return (
      <Modal.AntModal
        title={'生产日历'}
        width={820}
        bodyStyle={{ padding: 0 }}
        footer={null}
        visible={this.state.visible}
        onCancel={() => {
          this.setState({ visible: false });
        }}
      >
        <Graph />
      </Modal.AntModal>
    );
  };

  render() {
    return (
      <div>
        {this.renderFilter()}
        {this.renderMiddle()}
        {this.renderTable()}
        {this.renderModal()}
      </div>
    );
  }
}

export default List;
