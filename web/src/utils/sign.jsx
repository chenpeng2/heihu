import React from 'react';
import { openModal } from 'components';
import ESignForm from 'components/authorityWrapper/eSignForm';
import LocalStorage from 'utils/localStorage';
import { FIELDS } from 'constants';
import _ from 'lodash';

const networkError = {
  signNeeded: 'DIGITAL_SIGNATURE_NEEDED',
};

export const signNeeded = error => {
  const code = _.get(error, 'response.data.code', null);
  return code === networkError.signNeeded;
};

export const getOrgId = () => {
  let orgId = '';
  const user = LocalStorage.get(FIELDS.USER);
  orgId = _.get(user, 'orgId', '');
  return orgId;
};

const onSubmit = (value, resolve) => {
  resolve(value);
};

const onCancel = reject => {
  reject('canceled');
};

export const sign = () => {
  return new Promise((resolve, reject) => {
    openModal({
      title: '电子签名',
      footer: null,
      children: <ESignForm onConfirm={value => onSubmit(value, resolve)} onCancel={() => onCancel(reject)} />,
      width: 500,
    });
  });
};
