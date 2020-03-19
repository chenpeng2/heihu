import React, { Component } from 'react';
import _ from 'lodash';

import { withForm, Button } from 'components';
import { queryWeighingTaskDetail, editWeighingTask } from 'services/weighing/weighingTask';

import WeighingTaskBaseForm from './base/baseForm';
import { formatValues } from './utils';

const ButtonStyle = { width: 112, height: 32, marginRight: 40 };

type Props = {
  form: any,
  history: any,
  match: any,
  data: {},
};

class EditWeighingTask extends Component {
  props: Props;
  state = {
    data: {},
  };

  componentDidMount = () => {
    this.fetchData();
  }

  fetchData = async params => {
    const id = _.get(this.props, 'match.params.id');

    await queryWeighingTaskDetail({ id, ...params })
      .then(res => {
        const data = _.get(res, 'data.data');
        this.setState({ data, id });
      })
      .catch(err => console.log(err));
  };

  submit = async () => {
    const values = this.props.form.getFieldsValue();
    const id = _.get(this.props, 'match.params.id');
    this.props.form.validateFieldsAndScroll(async (err, vals) => {
      if (!err) {
        const values = formatValues(vals);
        console.log({ values });

        await editWeighingTask(id, values)
        .then(res => {
          const statusCode = _.get(res, 'data.statusCode');
          if (statusCode === 200) {
            this.props.history.push(`/weighingManagement/weighingTask/detail/${id}`);
          }
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
        <p style={{ fontSize: 16, padding: 20 }}>编辑称量任务</p>
        <WeighingTaskBaseForm form={form} initialData={data} edit />
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
          <Button
            style={ButtonStyle}
            onClick={this.submit}
          >保存</Button>
        </div>
      </div>
    );
  }
}

export default withForm({}, EditWeighingTask);
