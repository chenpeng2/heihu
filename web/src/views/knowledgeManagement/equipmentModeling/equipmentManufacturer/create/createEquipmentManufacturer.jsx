import * as React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withForm, Form, FormItem, Button } from 'components';
import { queryEquipmentManufacturerList, addEquipmentManufacturer } from 'src/services/knowledgeBase/equipment';
import { EquipmentManufacturerBase } from '../index';

type propsType = {
  router: any,
  form: any,
  params: {},
};

class CreateEquipmentManufacturer extends React.Component<propsType> {
  state = {
    reportTemplates: [],
  };

  componentDidMount = () => {
    this.fetchEquipmentManufacturer();
  };

  fetchEquipmentManufacturer = async () => {
    const {
      data: { total },
    } = await queryEquipmentManufacturerList({ page: 1, size: 10 });
    const {
      data: { data },
    } = await queryEquipmentManufacturerList({ page: 1, size: total });
    this.setState({
      reportTemplates: data,
    });
  };

  submit = () => {
    const { form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        addEquipmentManufacturer(values)
          .then(res => {
            if (res.data.statusCode === 200) {
              const {
                data: { id },
              } = res.data;
              this.context.router.history.push(`/knowledgeManagement/equipmentManufacturer/${id}/detail`);
            }
          })
          .catch(console.log);
        return;
      }
      return null;
    });
  };

  render() {
    const { form } = this.props;

    return (
      <div style={{ padding: '20px 20px' }}>
        <Form>
          <EquipmentManufacturerBase form={form} title="创建制造商信息" />
          <FormItem>
            <Button style={{ width: 114, height: 32, marginLeft: 120 }} type="primary" onClick={this.submit}>
              保存
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

CreateEquipmentManufacturer.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(withForm({}, CreateEquipmentManufacturer));
