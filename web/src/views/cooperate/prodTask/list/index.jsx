import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { setLocation } from 'utils/url';
import { queryProdTaskList, setMultiBulkPriority } from 'src/services/cooperate/prodTask';
import { getQuery, getLocation } from 'src/routes/getRouteParams';
import { formatRangeTimeToMoment } from 'utils/time';
import { getTablePageSizeFromLocalStorage } from 'utils/localStorage';
import { Button, Icon, message } from 'src/components';
import { border, middleGrey } from 'src/styles/color';
import auth from 'src/utils/auth';

import ProdTaskTable from './table';
import ProdTaskFilter, { getFormatParams } from './filter';
import CONSTANT from '../constant';

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

  onSetMultiBulkPriority = async () => {
    const { selectedRowKeys, data } = this.state;
    const { changeChineseToLocale } = this.context;

    const params = {
      taskIds: selectedRowKeys,
    };

    try {
      const response = await setMultiBulkPriority(params);
      message.success(changeChineseToLocale('批量标记成功'));
      if (Array.isArray(data.data)) {
        const formatedData = data.data.map(item => {
          if (selectedRowKeys.includes(item.id)) {
            return {
              ...item,
              priority: 1,
            };
          }
          return item;
        });

        this.setState({ data: { ...data, data: formatedData }, showRowSelection: false, selectedRowKeys: [] });
      }
    } catch (err) {
      console.log('err: ', err);
    }
  };

  getAndSetData = (params, query) => {
    const { match } = this.props;
    this.setState({ loading: true });

    const _query = query || getFormatParams(getQuery(match));
    const _params = getFormatParams(params);
    const variables = { ..._query, ..._params };

    if (_params.sortBy == null) {
      variables.order = undefined;
      variables.sortBy = undefined;
    }
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

  renderOperation() {
    const { showRowSelection, selectedRowKeys } = this.state;
    const { changeChineseToLocale, changeChineseTemplateToLocale } = this.context;

    if (!showRowSelection) {
      return (
        <Button
          auth={auth.WEB_BULK_SET_PRIOR}
          ghost
          style={{ marginRight: 10 }}
          onClick={() => this.setState({ showRowSelection: true })}
        >
          <Icon iconType={'gc'} type={'piliangcaozuo'} />
          {changeChineseToLocale('批量标记优先')}
        </Button>
      );
    }
    return (
      <React.Fragment>
        <Button
          ghost
          style={{ marginRight: 10 }}
          onClick={this.onSetMultiBulkPriority}
          disabled={selectedRowKeys.length === 0}
        >
          标记
        </Button>
        <Button
          type={'default'}
          onClick={() => {
            this.setState({ showRowSelection: false });
          }}
        >
          取消
        </Button>
        <span style={{ marginLeft: 10, color: middleGrey }}>
          {changeChineseTemplateToLocale('已选择{amount}个结果', { amount: selectedRowKeys.length })}
        </span>
      </React.Fragment>
    );
  }

  render() {
    const { data, loading, pagination, selectedRowKeys, showRowSelection } = this.state;

    return (
      <div className="search-select-input">
        <ProdTaskFilter wrappedComponentRef={e => (this.filter = e)} fetchData={this.getAndSetData} />
        <div style={{ position: 'absolute', borderTop: `1px solid ${border}`, padding: '20px', zIndex: 2 }}>
          {this.renderOperation()}
        </div>
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
