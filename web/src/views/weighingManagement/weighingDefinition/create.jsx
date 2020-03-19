import React, { Component } from 'react';
import _ from 'lodash';

import { withForm, Button, message, PlainText } from 'components';
import { createWeighingDefinition } from 'services/weighing/weighingDefinition';

import WeighingDefinitionBaseForm from './base/baseForm';
import { formatValues } from './utils';
import { toWeighingDefinitionList } from '../navigation';

const ButtonStyle = { width: 112, height: 32, marginRight: 40 };

type Props = {
  form: any,
  history: any,
};

class CreateWeighingDefinition extends Component {
  props: Props;
  state = {};

  submit = async () => {
    this.props.form.validateFieldsAndScroll((err, vals) => {
      if (!err) {
        const values = formatValues(vals);
        if (!_.get(values, 'weighingObjects')) {
          message.error('称量目标不能为空');
          return;
        }
        createWeighingDefinition(values)
          .then(res => {
            const data = _.get(res, 'data.data');
            const statusCode = _.get(res, 'data.statusCode');
            if (statusCode === 200) {
              message.success('创建成功！');
              this.props.history.push(toWeighingDefinitionList());
            }
          })
          .catch(err => console.log(err));
      }
    });
  };

  render() {
    const { form } = this.props;

    return (
      <div>
        <PlainText text="创建称量定义" style={{ fontSize: 16, padding: 20 }} />
        <WeighingDefinitionBaseForm form={form} />
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
      </div>
    );
  }
}

export default withForm({}, CreateWeighingDefinition);
