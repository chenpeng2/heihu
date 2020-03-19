import React, { Component } from 'react';
import withForm from 'components/form';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getQcConfigList } from 'src/services/qcConfig';
import { getQuery } from 'src/routes/getRouteParams';
import { QCCONFIG_VALID } from 'src/views/qualityManagement/constants';
import Table from './table';
import Filter from './filter';

type Props = {
  style: {},
  match: {},
  form: {},
};

class QcConfigList extends Component {
  props: Props;
  state = {
    data: [],
    total: 0,
    visible: false,
    loading: false,
  };

  componentDidMount() {
    const { form, match } = this.props;
    const { setFieldsValue } = form;
    const query = getQuery(match);
    if (typeof query.state !== 'number') {
      query.state = QCCONFIG_VALID;
    }
    setFieldsValue(query);
    this.getAndSetData(query);
  }

  getAndSetData = params => {
    const _params = { ...params, size: 10 };

    this.setState({
      loading: true,
    });

    getQcConfigList(_params)
      .then(res => {
        const { data } = res || {};
        const { data: realData, total } = data || {};
        this.setState({
          data: realData,
          total,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  toggleVisible = visible => this.setState({ visible });

  render() {
    const { data, total, loading } = this.state;
    const { form } = this.props;

    if (!data) {
      return null;
    }

    return (
      <React.Fragment>
        <Filter
          onFilter={(params, extra) => {
            this.getAndSetData({ ...params, page: 1 }, extra);
          }}
          form={form}
        />
        <Table data={data} loading={loading} refreshData={params => this.getAndSetData(params)} total={total} />
      </React.Fragment>
    );
  }
}

QcConfigList.contextTypes = {
  router: PropTypes.object,
  account: PropTypes.object,
};

export default withForm({}, withRouter(QcConfigList));
