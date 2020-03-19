import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { setLocation } from 'utils/url';
import { queryInjectMoldTaskList } from 'services/cooperate/injectMoldTask';
import { getQuery } from 'src/routes/getRouteParams';
import { formatRangeTimeToMoment } from 'utils/time';
import ProdTaskTable from './table';
import ProdTaskFilter, { getFormatParams } from './filter';

type Props = {
  push: () => {},
  children: Node,
  match: {},
  form: {
    getFieldDecorator: () => {},
    getFieldsValue: () => {},
  },
};

class FilterForProdTaskList extends Component {
  props: Props;

  state = {
    data: null,
    loading: false,
  };

  componentDidMount() {
    const { match } = this.props;
    const queryMatch = getQuery(match);
    const filterInstanceRef = _.get(this.filter, 'wrappedInstance');
    const { startTimeReal, endTimeReal } = queryMatch;
    if (startTimeReal) {
      queryMatch.startTimeReal = formatRangeTimeToMoment(startTimeReal);
    }
    if (endTimeReal) {
      queryMatch.endTimeReal = formatRangeTimeToMoment(endTimeReal);
    }
    if (queryMatch && filterInstanceRef && typeof filterInstanceRef.setInitialValue === 'function') {
      filterInstanceRef.setInitialValue(queryMatch);
    }
    this.getAndSetData({ statuses: [{ label: '执行中', key: '2' }], ...queryMatch });
  }

  getAndSetData = (params, query) => {
    const { match } = this.props;
    const _query = query || getFormatParams(getQuery(match));
    const _params = getFormatParams(params);
    const variables = Object.assign({}, { ..._query, ..._params });
    this.setState({ loading: true });
    setLocation(this.props, p => {
      return { ...p, ...params };
    });
    queryInjectMoldTaskList(variables)
      .then(res => {
        this.setState({
          data: res && res.data,
          pagination: {
            current: _params && _params.page,
            total: _.get(res, 'data.total'),
            pageSize: (_params && _params.size) || 10,
          },
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  render() {
    const { data, loading, pagination } = this.state;

    return (
      <div className="search-select-input">
        <ProdTaskFilter wrappedComponentRef={e => (this.filter = e)} fetchData={this.getAndSetData} />
        <ProdTaskTable data={data} refetch={this.getAndSetData} loading={loading} pagination={pagination} />
      </div>
    );
  }
}

FilterForProdTaskList.contextTypes = {
  router: PropTypes.object,
};

export default withRouter(FilterForProdTaskList);
