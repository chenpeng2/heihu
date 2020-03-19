import React, { Component } from 'react';
import _ from 'lodash';
import moment, { formatRangeUnix } from 'src/utils/time';
import { getQuery } from 'src/routes/getRouteParams';
import { getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';
import { queryDeliverRecordList } from 'src/services/stock/deliverRecord';
import { setLocation } from 'utils/url';
import { isOrganizationUseQrCode } from 'src/utils/organizationConfig';
import LgTransfersList from './list';
import FilterForLgTransfers from './filter';

type Props = {
  match: any,
};

class LgTransfers extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.filterRef = React.createRef();
    this.state = {
      config: null,
      data: null,
      isSearch: false,
      loading: false,
      exportParams: null,
    };
  }

  componentWillMount() {
    const config = getOrganizationConfigFromLocalStorage();
    this.setState({ config });
  }

  componentDidMount() {
    const Filter = this.filterRef.current;
    const { match } = this.props;
    const queryMatch = getQuery(match);
    const _queryMatch = _.cloneDeep(queryMatch);
    if (queryMatch) {
      if (queryMatch.duration && queryMatch.duration.length > 0) {
        queryMatch.duration[0] = moment(queryMatch.duration[0]);
        queryMatch.duration[1] = moment(queryMatch.duration[1]);
      }
      Filter.setFieldsValue(_queryMatch);
      this.setState({ exportParams: this.getFormatParams(queryMatch) });
    }
    this.getAndSetData({ ...queryMatch });
  }

  resetFormValue = () => {
    const Filter = this.filterRef.current;
    const { resetFields } = Filter;
    resetFields();
  };

  getAndSetData = (params, query) => {
    const { match } = this.props;
    const _query = query || this.getFormatParams(getQuery(match));
    const _params = this.getFormatParams(params);
    const variables = Object.assign({}, { ..._query, ..._params });
    this.setState({ loading: true });
    setLocation(this.props, () => params);
    queryDeliverRecordList(variables)
      .then(data => {
        this.setState({ data: data.data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  getFormatParams = value => {
    const params = {};
    Object.keys(value).forEach(prop => {
      if (value[prop]) {
        switch (prop) {
          case 'account':
          case 'operatorId':
          case 'materialCode':
            params[prop] = value[prop].key;
            break;
          case 'duration':
            if (value.duration.length > 0) {
              const _duration = formatRangeUnix(value.duration);
              params.createdAtFrom = _duration[0];
              params.createdAtTill = _duration[1];
            }
            break;
          case 'customer':
              params.customerCode = value[prop].key;
            break;
          case 'storage':
            if (value[prop].length) {
              if (value[prop][0]) {
                let id = '';
                const level = value[prop][0].split(',')[2];
                if (level === '3') {
                  id = value[prop].map(n => n.split(',')[0]).join(',');
                } else {
                  id = value[prop][0].split(',')[0];
                }
                switch (level) {
                  case '1':
                    params.houseId = id;
                    break;
                  case '2':
                    params.firstStorageId = id;
                    break;
                  case '3':
                    params.secondStorageId = id;
                    break;
                  default:
                    break;
                }
              }
            }
            break;
          default:
            params[prop] = value[prop];
        }
      }
    });
    return params;
  };

  handleSearch = () => {
    const Filter = this.filterRef.current;
    const value = Filter.getFieldsValue();
    this.setState({ exportParams: this.getFormatParams(value), isSearch: true }, () => {
      this.setState({ isSearch: false });
    });
    if (sensors) {
      sensors.track('web_stock_deliverLgTransfers_search', {
        FilterCondition: value,
      });
    }
    this.getAndSetData({ ...value, size: 10, page: 1 }, {});
  };

  handleReset = () => {
    this.resetFormValue();
    this.setState({ isSearch: true, exportParams: {} }, () => {
      this.setState({ isSearch: false });
    });
    this.getAndSetData({}, {});
  };

  render() {
    const { match } = this.props;
    const { data, loading, exportParams, isSearch } = this.state;
    const useQrCode = isOrganizationUseQrCode();

    return (
      <div>
        <FilterForLgTransfers
          ref={this.filterRef}
          match={match}
          handleSearch={this.handleSearch}
          handleReset={this.handleReset}
          userQrCode={useQrCode}
        />
        <LgTransfersList
          data={data}
          loading={loading}
          exportParams={exportParams}
          refetch={this.getAndSetData}
          userQrCode={useQrCode}
          isSearch={isSearch}
        />
      </div>
    );
  }
}

export default LgTransfers;
