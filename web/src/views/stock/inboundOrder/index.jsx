import React, { Component } from 'react';
import _ from 'lodash';
import { Spin, withForm } from 'src/components';
import { setLocation } from 'utils/url';
import { getQuery } from 'src/routes/getRouteParams';
import moment from 'src/utils/time';
import { getInboundOrderList } from 'src/services/stock/inboundOrder';
import Filter from './filter';
import List from './list';
import InboundOrderOperation from './inboundOrderOperation';

type Props = {
  form: any,
  match: any,
  history: any,
};

class InboundOrder extends Component {
  props: Props;
  state = {
    data: {},
    loading: false,
    nextPage: 1,
  };

  componentDidMount() {
    const {
      match,
      form: { setFieldsValue },
    } = this.props;
    const query = getQuery(match);
    if (query && query.createdAt && query.createdAt.length) {
      query.createdAt = [moment(query.createdAt[0]), moment(query.createdAt[1])];
    } else {
      const initialCreatedAt = [
        moment()
          .subtract(7, 'days')
          .startOf('day'),
        moment().endOf('day'),
      ];
      query.createdAt = initialCreatedAt;
      query.page = 1;
      setLocation(this.props, p => ({ ...p, createdAt: initialCreatedAt, page: 1 }));
    }
    setFieldsValue(_.cloneDeep(query));
    this.fetchData(query || {});
  }

  fetchData = async value => {
    const params = this.getFormatParmas(value);
    this.setState({ loading: true });
    const data = _.get(await getInboundOrderList(params), 'data');
    this.setState({ data });
    this.setState({ loading: false });
  };

  getFormatParmas = value => {
    if (!value) return {};
    const { status, creator, inboundOrderCode, createdAt, ...rest } = value;
    const params = {
      status: status && status.key,
      creatorId: creator && creator.key,
      inboundOrderCode,
      ...rest,
    };
    if (createdAt && Array.isArray(createdAt) && createdAt.length) {
      params.createdAtFrom = Date.parse(createdAt[0]);
      params.createdAtTill = Date.parse(createdAt[1]);
    }
    return params;
  };

  handleSearch = () => {
    const { form } = this.props;
    const { getFieldsValue } = form;
    const value = getFieldsValue();
    setLocation(this.props, () => value);
    this.fetchData(value);
  };

  render() {
    const { form, history } = this.props;
    const { data, loading } = this.state;

    return (
      <Spin spinning={loading}>
        <Filter form={form} handleSearch={this.handleSearch} />
        <InboundOrderOperation history={history} />
        <List data={data} fetchData={this.fetchData} />
      </Spin>
    );
  }
}

export default withForm({}, InboundOrder);
