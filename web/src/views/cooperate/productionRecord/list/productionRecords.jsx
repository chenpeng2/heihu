import React, { Component } from 'react';
import { remove, omit } from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Tabs } from 'antd';
import withForm from 'components/form';
import { replaceSign } from 'src/constants';
import { setLocation } from 'utils/url';
import { stringEllipsis } from 'utils/string';
import { Tooltip } from 'components';
import { formatToUnix, formatTodayUnderline } from 'utils/time';
import { getPathname, getQuery } from 'src/routes/getRouteParams';
import {
  queryCurrentProduction,
  queryHistoricProduction,
  queryProduction,
} from 'src/services/datagram/productionRecords';
import ProductionRecordsTab from './productionRecordsTab';
import { exportXlsxFile } from '../../../../utils/exportFile';
import styles from './styles.scss';

type Props = {
  viewer: any,
  relay: any,
  children: Element,
  getCurrentRecords: boolean,
  disableTimeSelect: boolean,
  match: any,
  form: any,
  intervals: any,
  location: {
    pathname: string,
  },
};

class ProductionRecords extends Component {
  props: Props;
  state = {
    loading: false,
    dataSource: [],
    columns: [],
    pagination: {},
    filterCategory: 'byProject',
  };

  componentDidMount() {
    this.setState({
      params: {
        page: 1,
        size: 10,
        groupBy: 1,
      },
    });
  }

  fetchData = async variables => {
    const { data } = await queryProduction({ ...variables });
    return data;
  };

  getVariables = (params, query) => {
    const { match } = this.props;
    const _query = query || getQuery(match);
    const variables = Object.assign({}, { ..._query, ...params });
    delete variables.duration;
    return variables;
  };

  updateData = async (params, query) => {
    this.setState({ loading: true });
    const { form } = this.props;
    const variables = this.getVariables(params, query);
    const data = await this.fetchData(variables);
    form.setFieldsValue({ ...variables });
    setLocation(this.props, p => {
      return { ...p, ...params };
    });
    this.setState({
      [this.state.filterCategory]: {
        dataSource: data.data.list,
        columns: this.getColumns(data.data.header),
        loading: false,
        pagination: {
          total: data.total,
          current: params.page,
        },
      },
    });
  };

  // onSearch = value => {
  //   const { filterCategory } = this.state;
  //   const duration = value[`duration-${filterCategory}`];
  //   const interval = value[`interval-${filterCategory}`];
  //   if (duration && duration.length && !this.props.getCurrentRecords) {
  //     value.timeFrom = formatToUnix(
  //       duration[0].set({
  //         hour: 0,
  //         minute: 0,
  //         second: 0,
  //       }),
  //     );
  //     value.timeTill = formatToUnix(
  //       duration[1].set({
  //         hour: 23,
  //         minute: 59,
  //         second: 59,
  //       }),
  //     );
  //   } else {
  //     value.timeFrom = null;
  //     value.timeTill = null;
  //   }
  //   const filters = filterCategories[this.state.filterCategory].filters.map(x => x.fieldDecorator);
  //   filters.forEach(x => {
  //     value[x] = value[x] && value[x].map(y => y.key);
  //   });
  //   const unwanted = [
  //     'operatorIds',
  //     'projectCodes',
  //     'purchaseOrderCodes',
  //     'outputMaterialCodes',
  //     'outputMaterialNames',
  //     'workstationIds',
  //     'processCodes',
  //   ];
  //   remove(unwanted, x => filters.find(y => y === x));
  //   unwanted.forEach(x => delete value[x]);
  //   value.groupBy = Object.keys(filterCategories).findIndex(x => x === this.state.filterCategory) + 1;
  //   const params = {
  //     page: 1,
  //     size: 10,
  //     interval,
  //     ...omit(value, [`duration-${filterCategory}`, `interval-${filterCategory}`, 'search']),
  //   };
  //   this.setState(
  //     {
  //       selectNode: {},
  //       lastCategory: this.state.filterCategory,
  //       [`interval-${filterCategory}`]: interval,
  //       [`duration-${filterCategory}`]: duration,
  //     },
  //     () => {
  //       this.updateData(params, {});
  //     },
  //   );
  // };

  // onReset = () => {
  //   this.updateData(
  //     {
  //       page: 1,
  //       size: 10,
  //       groupBy: Object.keys(filterCategories).findIndex(x => x === this.state.filterCategory) + 1,
  //     },
  //     {},
  //   );
  // };

  getDynamicColumn = ({ display, key }) => ({
    title: display,
    dataIndex: key,
    maxWidth: { C: 8 },
    render: (value, record, index) => {
      return (
        <div key={`${key}-${index}`}>
          {value ? (
            <Tooltip placement="top" title={value}>
              <span>{stringEllipsis(`${value}`, 20)}</span>
            </Tooltip>
          ) : typeof value === 'string' ? (
            replaceSign
          ) : (
            '0'
          )}
        </div>
      );
    },
  });

  getColumns = headers => {
    const _headers = Object.entries(headers).map(x => ({ display: x[1], key: x[0] }));
    const columns = [];
    _headers.forEach(header => columns.push(this.getDynamicColumn(header)));
    return columns;
  };

  onClickExport = async () => {
    // const variables = this.getVariables({ size: 300 });
    // const { data } = await this.fetchData(variables);
    // exportXlsxFile(
    //   [this.getColumns(data.header).map(x => x.title), ...data.list.map(x => Object.values(x))],
    //   `${this.props.getCurrentRecords ? '当日产量统计' : '历史产量统计'}_${
    //     filterCategories[this.state.filterCategory].display
    //   }_${formatTodayUnderline()}.xlsx`,
    // );
  };

  render() {
    const { intervals, disableTimeSelect } = this.props;
    return (
      <div id="production_records" className={styles.productionRecords}>
        <div className="search-select-input">
          <ProductionRecordsTab
            // onSearch={this.onSearch}
            // onReset={this.onReset}
            // onRefetch={this.updateData}
            // onClickExport={this.onClickExport}
            // intervals={intervals}
            // disableTimeSelect={disableTimeSelect}
            // fieldValues={{ duration: this.state.duration, interval: this.state.interval }}
            // {...omit(this.state[this.state.filterCategory], ['filterCategory'])}
          />
        </div>
      </div>
    );
  }
}

ProductionRecords.contextTypes = {
  router: PropTypes.object.isRequired,
  relay: PropTypes.object,
};

export default withForm({}, withRouter(ProductionRecords));
