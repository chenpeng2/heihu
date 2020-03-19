import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import withForm from 'components/form';
import {
  queryEquipmentManufacturerDetail,
  updateEquipmentManufacturer }
from 'src/services/knowledgeBase/equipment';
import { Form, FormItem, Button } from 'components';
import { EquipmentManufacturerBase } from '../index';
import styles from './styles.scss';

type Props = {
  match: {
    params: {}
  },
  form: any,
};

class EditEquipmentManufacturer extends Component {
  props: Props;
  state = {
    data: {},
  };

  componentDidMount() {
    const { match: { params: { id } } } = this.props;
    console.log(this.props);
    console.log({ id });
    this.fetchData(id);
  }

  fetchData = async (id) => {
    const { data } = await queryEquipmentManufacturerDetail(id);
    this.setState({
      data: data.data,
    });
  }

  submit = async () => {
    const { form, match: { params: { id } } } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log({ values });
        console.log({ values });
        updateEquipmentManufacturer(id, values).then(res => {
          console.log({ res });
          if (res.data.statusCode === 200) {
            const { match: { params: { id } } } = this.props;
            console.log({ id });
            this.context.router.history.push(`/knowledgeManagement/equipmentManufacturer/${id}/detail`);
          }
        }).catch(console.log);
        return;
      }
      return null;
    });
  }

  render() {
    const { data } = this.state;
    const { form } = this.props;

    return (
      <div style={{ padding: '20px 20px' }}>
        <Form>
          <EquipmentManufacturerBase formData={data} submit={this.submit} form={form} title="编辑制造商信息" />
          <FormItem>
            <Button
              style={{ width: 114, height: 32, marginLeft: 120 }}
              type="primary"
              onClick={this.submit}
            >
            保存
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

EditEquipmentManufacturer.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(withForm({}, EditEquipmentManufacturer));
