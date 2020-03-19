import React, { Component } from 'react';
import _ from 'lodash';

import { withForm, Button, PlainText } from 'components';
import { createWeighingTask } from 'services/weighing/weighingTask';
import { getQuery } from 'src/routes/getRouteParams';

import WeighingTaskBaseForm from './base/baseForm';
import { formatValues } from './utils';

const ButtonStyle = { width: 112, height: 32, marginRight: 40 };

type Props = {
  form: any,
  history: any,
};

class CreateWeighingTask extends Component {
  props: Props;
  state = {
    data: {},
  };

  componentDidMount = () => {
    const params = getQuery(_.get(this.props, 'match'));
    this.setState({ data: params });
  };

  submit = async () => {
    this.props.form.validateFieldsAndScroll(async (err, vals) => {
      if (!err) {
        const values = formatValues(vals);
        await createWeighingTask(values)
          .then(res => {
            const id = _.get(res, 'data.data');
            this.props.history.push(`/weighingManagement/weighingTask/detail/${id}`);
          })
          .catch(err => console.log(err));
      }
    });
  };

  render() {
    const { form } = this.props;
    const { data } = this.state;

    return (
      <div>
        <PlainText text="创建称量任务" style={{ fontSize: 16, padding: 20 }} />
        <WeighingTaskBaseForm form={form} initialData={data} />
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

export default withForm({}, CreateWeighingTask);
