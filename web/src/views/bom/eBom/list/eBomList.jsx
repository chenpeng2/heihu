import * as React from 'react';
import PropTypes from 'prop-types';
import { getTablePageSizeFromLocalStorage } from 'utils/localStorage';
import { getEbomList, getEbomListForUpdateMaterial } from 'src/services/bom/ebom';
import { setLocation, getParams } from 'src/utils/url';
import { Spin } from 'src/components';
import EbomTable from 'src/containers/eBom/list/table';
import EbomFilter, { formatFilterValue } from 'src/containers/eBom/list/filter';
import { DESCEND, COLUMN_KEYS } from '../utils';

type propsType = {
  viewer: any,
  relay: any,
  children: Element,
  form: any,
};

type stateType = {
  loading: boolean,
};

const tableUniqueKey = 'EbomDefinationTableConfig';

class EBomList extends React.Component<propsType, stateType> {
  state = {
    loading: false,
    dataSource: [],
    total: 0,
  };

  componentDidMount() {
    this.setDataSource();
  }

  setDataSource = (_params, isUpdateMaterial) => {
    const pageSize = getTablePageSizeFromLocalStorage(tableUniqueKey);
    const { filter, ...rest } = _params || {};
    const { queryObj } = getParams() || {};
    const { filter: lastFilter, ...lastRest } = queryObj || {};

    const nextFilter = { ...lastFilter, ...filter };
    const nextQuery = {
      isCreatedDesc: DESCEND,
      columnKey: COLUMN_KEYS.createdAt.value,
      page: 1,
      size: pageSize,
      ...lastRest,
      ...formatFilterValue(nextFilter),
      ...rest,
    };

    setLocation(this.props, {
      isCreatedDesc: DESCEND,
      columnKey: COLUMN_KEYS.createdAt.value,
      page: 1,
      size: pageSize,
      ...lastRest,
      filter: nextFilter,
      ...rest,
    });
    this.setState({ loading: true });

    if (isUpdateMaterial) {
      // 如果是拉取更新物料的ebom。用另一个接口
      return getEbomListForUpdateMaterial(nextQuery)
        .then(({ data: { data, count } }) => {
          const dataSource = data.map(value => ({
            ...value,
            key: value.id,
          }));
          this.setState({
            dataSource,
            pagination: {
              current: nextQuery && nextQuery.page,
              pageSize: nextQuery && nextQuery.size,
              total: count,
            },
            total: count,
          });
        })
        .finally(() => {
          this.setState({ loading: false });
        });
    }

    return getEbomList(nextQuery)
      .then(({ data: { data, count } }) => {
        const dataSource = data.map(value => ({
          ...value,
          key: value.id,
        }));
        this.setState({
          dataSource,
          pagination: {
            current: nextQuery && nextQuery.page,
            pageSize: nextQuery && nextQuery.size,
            total: count,
          },
          total: count,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  render(): React.Node {
    const { dataSource, pagination, total, loading } = this.state;

    return (
      <Spin spinning={loading}>
        <div>
          <EbomFilter fetchData={this.setDataSource} />
          <EbomTable
            tableUniqueKey={tableUniqueKey}
            data={dataSource}
            total={total}
            pagination={{
              pageSizeOptions: ['10', '20', '50', '100', '200', '500'],
              ...pagination,
            }}
            fetchData={this.setDataSource}
          />
        </div>
      </Spin>
    );
  }
}

EBomList.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default EBomList;
