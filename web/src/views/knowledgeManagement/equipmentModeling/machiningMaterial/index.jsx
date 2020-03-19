import React, { Component } from 'react';
import { getQuery } from 'src/routes/getRouteParams';
import { setLocation } from 'utils/url';
import { getMachiningMaterial } from 'src/services/knowledgeBase/equipment';
import withForm from 'components/form';
import MachiningMaterialFilter from './filter';
import MachiningMaterialList from './list';

type Props = {
  match: {},
  form: any,
  router: any,
};

class MachiningMaterial extends Component {
  props: Props;
  state = {
    data: null,
    loading: false,
  };

  componentDidMount() {
    const { form, match } = this.props;
    const queryMatch = getQuery(match);
    this.fetchData(queryMatch);
    form.setFieldsValue(queryMatch);
  }

  fetchData = value => {
    const params = this.formatParams(value);
    this.setState({ loading: true });
    getMachiningMaterial(params)
      .then(res => {
        this.setState({ data: res.data });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  formatParams = value => {
    const params = {};
    Object.keys(value).forEach(prop => {
      if (value[prop]) {
        switch (prop) {
          case 'searchType':
          case 'searchStatus':
            params[prop] = value[prop].key;
            break;
          default:
            params[prop] = value[prop];
        }
      }
    });
    return params;
  }

  onSearch = () => {
    const { form } = this.props;
    const { validateFieldsAndScroll } = form;
    validateFieldsAndScroll((err, value) => {
      if (err) return null;
      setLocation(this.props, () => ({ ...value, page: 1 }));
      this.fetchData({ ...value, page: 1 });
    });
  }

  onReset = () => {
    const { form } = this.props;
    const { resetFields } = form;
    resetFields();
    this.fetchData({ page: 1 });
  }

  render() {
    const { form } = this.props;
    const { loading, data } = this.state;

    return (
      <div>
        <MachiningMaterialFilter form={form} onSearch={this.onSearch} onReset={this.onReset} />
        <MachiningMaterialList fetchData={this.fetchData} data={data} loading={loading} />
      </div>
    );
  }
}

export default withForm({}, MachiningMaterial);
