import React, { Component } from 'react';
import { getSparePartsList } from 'src/services/equipmentMaintenance/spareParts';
import { getQuery } from 'src/routes/getRouteParams';
import { setLocation } from 'utils/url';
import SparePartsFilter from './filter';
import SparePartsList from './list';

type Props = {
  match: {},
  router: any,
};

class SpareParts extends Component {
  props: Props;
  state = {
    data: null,
    loading: false,
  };

  componentDidMount() {
    const { match } = this.props;
    const queryMatch = getQuery(match);
    if (queryMatch.enableStatus) {
      queryMatch.enableStatus = queryMatch.enableStatus.value;
      setLocation(this.props, () => queryMatch);
    }
    this.fetchData(queryMatch);
  }

  fetchData = (params) => {
    this.setState({ loading: true });
    getSparePartsList(params)
      .then(res => {
        this.setState({ data: res.data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  render() {
    const { match, router } = this.props;
    const { loading, data } = this.state;

    return (
      <div>
        <SparePartsFilter match={match} fetchData={this.fetchData} router={router} />
        <SparePartsList fetchData={this.fetchData} data={data} loading={loading} />
      </div>
    );
  }
}

export default SpareParts;
