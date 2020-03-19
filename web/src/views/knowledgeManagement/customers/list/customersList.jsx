import React, { Component } from 'react';
import { Button, OpenModal, withForm, FormattedMessage } from 'components';
import { setLocation } from 'utils/url';
import { getAttachments } from 'src/services/attachment';
import { getQuery, getLocation } from 'src/routes/getRouteParams';
import { getCustomers } from 'src/services/knowledgeBase/customer';
import { CustomerBaseForm } from 'src/containers/customers';
import Filter from './filter';
import Table from './table';

const knowledgeItem = {
  value: 'customer',
  display: '客户',
};

type Props = {
  match: any,
  form: any,
};

class CustomersList extends Component {
  props: Props;
  state = {
    loading: false,
    dataSource: [],
    paginition: {},
  };

  componentDidMount = () => {
    this.fetchData();
  };

  fetchData = async params => {
    this.setState({ loading: true });
    const { match } = this.props;
    const lastQuery = getQuery(match);
    const _params = { size: 10, ...lastQuery, ...params };
    if (_params.status === 'all') {
      _params.status = undefined;
    }
    const {
      data: { data, total },
    } = await getCustomers(_params);

    const location = getLocation(match) || {};
    location.query = { ...location.query, ...params, _filter: { ...params } };
    setLocation(this.props, () => location.query);
    this.setState({
      dataSource: data,
      loading: false,
      pagination: {
        current: _params && _params.page,
        total,
        pageSize: (_params && _params.size) || 10,
      },
    });
  };

  fetchAttachmentsData = async ids => {
    const {
      data: { data },
    } = await getAttachments(ids);
    return data.map(x => {
      x.originalFileName = x.original_filename;
      x.originalExtension = x.original_extension;
      return x;
    });
  };

  render() {
    const { form } = this.props;
    const { dataSource, loading, pagination } = this.state;
    return (
      <div>
        <div style={{ padding: 20 }}>
          <Filter form={form} fetchData={this.fetchData} />
          <Button
            icon="plus"
            onClick={() => {
              OpenModal(
                {
                  children: <CustomerBaseForm onCompeleted={this.fetchData} />,
                  title: `创建${knowledgeItem.display}`,
                  footer: null,
                  width: 730,
                  innerContainerStyle: { height: 558 },
                },
                this.context,
              );
            }}
          >
            <FormattedMessage defaultMessage={`创建${knowledgeItem.display}`} />
          </Button>
        </div>
        <Table
          loading={loading}
          knowledgeItem={knowledgeItem}
          dataSource={dataSource}
          pagination={pagination}
          refetch={this.fetchData}
        />
      </div>
    );
  }
}

export default withForm({}, CustomersList);
