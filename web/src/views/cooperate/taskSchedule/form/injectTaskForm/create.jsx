import React from 'react';
import { openModal, withForm } from 'components';
import BaseForm from './baseForm';

const CreateForm = withForm({}, BaseForm);

function CreateInjectTask({ projectCode, processSeq, ...rest }, callback, option) {
  const { onSuccess } = callback || {};
  openModal({
    children: <CreateForm projectCode={projectCode} processSeq={processSeq} {...rest} onSuccess={onSuccess} />,
    title: '创建排程',
    footer: null,
    innerContainerStyle: { marginBottom: 80 },
    ...option,
  });
}

export default CreateInjectTask;
