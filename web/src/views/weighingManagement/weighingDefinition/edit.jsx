import React, { Component } from 'react';
import _ from 'lodash';

import { withForm, Button, message, Spin } from 'components';
import { editWeighingDefinition, queryWeighingDefinitionDetail } from 'services/weighing/weighingDefinition';
import { getEbomList } from 'src/services/bom/ebom';
import { arrayIsEmpty } from 'utils/array';

import WeighingDefinitionBaseForm from './base/baseForm';
import { formatValues, getUniqueEbomMaterialCode } from './utils';
import { toWeighingDefinitionList } from '../navigation';

const ButtonStyle = { width: 112, height: 32, marginRight: 40 };

type Props = {
  form: any,
  history: any,
  match: any,
};

class EditWeighingDefinition extends Component {
  props: Props;
  state = {
    formData: {},
    id: null,
    initialData: {},
    loading: false,
  };

  componentDidMount() {
    const {
      match: { params },
    } = this.props;
    const { id } = params || {};
    this.fetchData(id);
  }

  fetchData = async id => {
    this.setState({ loading: true });
    await queryWeighingDefinitionDetail(id)
      .then(({ data: { data } }) => {
        const format = this.formatInitialData(data);
        this.setState({ formData: format, id, loading: false }, () => {
          this.setInitialData(format);
        });
      })
      .catch(err => console.log(err));
  };

  formatInitialData = data => {
    if (!data) return null;
    const { productMaterial, workstations, weighingObjects: _weighingObjects, ...rest } = data;

    const productCode = {
      key: _.get(productMaterial, 'code'),
      label: `${_.get(productMaterial, 'code')}/${_.get(productMaterial, 'name')}`,
    };
    const workstationIds = arrayIsEmpty(workstations) ? undefined : workstations.map(({ id }) => id);
    const ebomVersion = data && data.ebomVersion ? data.ebomVersion : undefined;
    const weighingObjects = arrayIsEmpty(_weighingObjects)
      ? []
      : _weighingObjects.map(x => {
          const { material, ...rest } = x;
          const code = material.code;
          const seq = _.get(rest, 'ebomMaterialSeq', null);
          const materialCode = seq ? getUniqueEbomMaterialCode(code, seq) : code;
          const unitName = material.unitName;
          return { ...rest, unitName, materialCode };
        });

    return { ...rest, weighingObjects, productCode, workstationIds, ebomVersion };
  };

  setInitialData = async data => {
    const { weighingObjects, ...rest } = data || {};
    const { productCode, ebomVersion } = rest;
    const { data: ebomData } = await getEbomList({
      productMaterialCode: _.get(productCode, 'key'),
      version: ebomVersion,
      status: 1,
    });
    const ebom = _.get(ebomData.data, '[0]');
    const rawMaterialList = _.get(ebom, 'rawMaterialList', []);
    const ebomId = _.get(ebom, 'id');
    this.setState({
      initialData: {
        ebomId,
        rawMaterialList,
      },
    });
  };

  submit = () => {
    this.props.form.validateFieldsAndScroll((err, vals) => {
      if (!err) {
        if (vals && !vals.weighingObjects) {
          message.error('称量目标不可为空');
          return;
        }
        const values = formatValues(vals);
        const { id } = this.state;

        editWeighingDefinition(id, values)
          .then(({ data: { statusCode } }) => {
            if (statusCode === 200) {
              message.success('编辑成功！');
              this.props.history.push(toWeighingDefinitionList());
            }
          })
          .catch(err => console.log(err));
      }
    });
  };

  render() {
    const { form } = this.props;
    const { formData, initialData, loading } = this.state;

    return (
      <Spin spinning={loading}>
        <p style={{ fontSize: 16, padding: 20 }}>编辑称量定义</p>
        <WeighingDefinitionBaseForm inEdit form={form} initialData={{ ...formData, ...initialData }} />
        <div style={{ paddingLeft: 120, marginTop: 35 }}>
          <Button
            type="default"
            style={ButtonStyle}
            onClick={() => {
              if (this.props.history) {
                this.props.history.goBack();
              }
            }}
          >
            取消
          </Button>
          <Button style={ButtonStyle} onClick={this.submit}>
            保存
          </Button>
        </div>
      </Spin>
    );
  }
}

export default withForm({}, EditWeighingDefinition);
