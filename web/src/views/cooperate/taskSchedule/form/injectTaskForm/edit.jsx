import React, { Component } from 'react';
import { openModal, withForm, Spin } from 'components';
import { formatUnixMoment } from 'utils/time';
import { getInjectTaskDetail } from 'services/schedule';
import BaseForm from './baseForm';

class EditInjectTaskBase extends Component {
  state = {};
  async componentDidMount() {
    const { taskCode } = this.props;
    const {
      data: { data: task },
    } = await getInjectTaskDetail(taskCode);
    this.setState({ task });
  }

  render() {
    const { form, ...rest } = this.props;
    const { task } = this.state;
    if (!task) {
      return <Spin />;
    }
    return <BaseForm {...rest} task={task} edit workOrderCode={task && task.workOrderCode} form={form} />;
  }
}

const EditInjectTaskForm = withForm({}, EditInjectTaskBase);

function EditInjectTask({ projectCode, processSeq, ...rest }, callback, option) {
  const { onSuccess } = callback || {};
  openModal({
    children: <EditInjectTaskForm projectCode={projectCode} processSeq={processSeq} {...rest} onSuccess={onSuccess} />,
    title: '编辑排程',
    footer: null,
    innerContainerStyle: { marginBottom: 80 },
    ...option,
  });
}

export default EditInjectTask;
