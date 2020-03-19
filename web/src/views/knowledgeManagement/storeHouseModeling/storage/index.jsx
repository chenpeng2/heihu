import React, { Component } from 'react';
import _ from 'lodash';
import { getStoreHouseList } from 'src/services/knowledgeBase/storeHouse';
import { getStorageList } from 'src/services/knowledgeBase/storage';
import { getQuery } from 'src/routes/getRouteParams';
import { setLocation } from 'utils/url';
import StorageList from './list';
import FilterForStorage, { formatFilerValue, SEARCH_TYPE } from './filter';

type Props = {
  match: any,
};

class StorageDefinition extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.filterRef = React.createRef();
    this.state = {
      data: null,
      loading: false,
      isNull: false,
    };
  }

  componentDidMount() {
    const { match } = this.props;
    const Filter = this.filterRef.current;
    const queryMatch = getQuery(match);
    const { setFieldsValue, getFieldsValue } = Filter;
    const initialValue = { ...getFieldsValue(), ...queryMatch };
    const refetch = queryMatch.search ? this.searchStorage : this.fetchAndSetData;
    setFieldsValue(initialValue);
    refetch(initialValue);
  }

  searchStorage = value => {
    const params = formatFilerValue(_.cloneDeep(value), SEARCH_TYPE.storage);
    this.setState({ loading: true, isNull: false });
    getStorageList(params)
      .then(res => {
        const data = _.cloneDeep(_.get(res, 'data.data', {}));
        data.data.forEach(n => {
          n.level = 3;
          n.id = n.code;
          if (n.children && n.children.length) {
            this.setDataId(n);
          }
        });
        this.setState({ data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  fetchAndSetData = value => {
    const params = formatFilerValue(_.cloneDeep(value), SEARCH_TYPE.warehouse);
    this.setState({ loading: true });
    getStoreHouseList(params)
      .then(res => {
        const data = _.cloneDeep(res.data.data);
        data.data.forEach(n => {
          n.level = 3;
          n.children = n.hasChildren ? [] : null;
          n.id = n.code;
        });
        this.setState({ data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  setDataId = data => {
    data.children.forEach(n => {
      n.storageId = n.id;
      n.id = `${n.code}:${n.parentCode}`;
      if (n.children && n.children.length) {
        this.setDataId(n);
      }
    });
  };

  handleSearch = () => {
    const Filter = this.filterRef.current;
    const { getFieldsValue } = Filter;
    const value = getFieldsValue();
    // 有仓位模糊搜索的时候调用仓位接口
    const refetch = value.search ? this.searchStorage : this.fetchAndSetData;
    if (!value.search) {
      this.setState({ isNull: true });
    }
    setLocation(this.props, p => ({ ...p, ...value, size: 10, page: 1 }));
    refetch({ ...value, size: 10, page: 1 });
  };

  render() {
    const { match } = this.props;
    const { data, loading, isNull } = this.state;
    const queryMatch = getQuery(match);

    return (
      <div>
        <FilterForStorage ref={this.filterRef} handleSearch={this.handleSearch} />
        <StorageList
          data={data}
          loading={loading}
          refetch={queryMatch.search ? this.searchStorage : this.fetchAndSetData}
          isNull={isNull}
        />
      </div>
    );
  }
}

export default StorageDefinition;
