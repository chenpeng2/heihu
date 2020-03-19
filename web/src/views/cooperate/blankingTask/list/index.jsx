import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { setLocation } from 'utils/url';
import { queryProdTaskList } from 'src/services/cooperate/prodTask';
import { getQuery } from 'src/routes/getRouteParams';
import { formatRangeTimeToMoment } from 'utils/time';
import { getTablePageSizeFromLocalStorage } from 'utils/localStorage';
import { Button, buttonAuthorityWrapper } from 'src/components';

import ProdTaskTable from './table';
import ProdTaskFilter, { getFormatParams } from './filter';
import CONSTANT from '../constant';

const ButtonWithAuth = buttonAuthorityWrapper(Button);

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
    selectedRowKeys: [],
    showRowSelection: false,
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
    const pageSize = getTablePageSizeFromLocalStorage(CONSTANT.TABLE_UNIQUE_KEY);
    this.getAndSetData({ statuses: [{ label: '执行中', key: '2' }], ...queryMatch, size: pageSize });
  }

  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  getAndSetData = (params, query) => {
    const { match } = this.props;
    this.setState({ loading: true });

    const _query = query || getFormatParams(getQuery(match));
    const _params = getFormatParams(params);
    const variables = {
      ..._query,
      ..._params,
      category: CONSTANT.CATEGORY_BAITING,
      sortBy: 'startTimePlanned',
      order: 1,
    };

    setLocation(this.props, p => {
      return { ...p, ...params };
    });

    queryProdTaskList(variables)
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
    const { data, loading, pagination, selectedRowKeys, showRowSelection } = this.state;

    return (
      <div className="search-select-input">
        <ProdTaskFilter wrappedComponentRef={e => (this.filter = e)} fetchData={this.getAndSetData} />
        <ProdTaskTable
          data={data}
          refetch={this.getAndSetData}
          loading={loading}
          pagination={pagination}
          selectedRowKeys={selectedRowKeys}
          onSelectChange={this.onSelectChange}
          showRowSelection={showRowSelection}
        />
      </div>
    );
  }
}

FilterForProdTaskList.contextTypes = {
  router: PropTypes.object,
  changeChineseToLocale: PropTypes.func,
  changeChineseTemplateToLocale: PropTypes.any,
};

export default withRouter(FilterForProdTaskList);
