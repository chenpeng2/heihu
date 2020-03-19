import React from 'react';
import { openModal, Link } from 'src/components';
import FormContent from './formContent';
import styles from '../styles.scss';

type Props = {
  title: string,
  showAql: Boolean,
  showSampling: Boolean,
  onSubmit: () => {},
};

const bulkActionModal = (props: Props, context) => {
  const { title, onSubmit, showAql, showSampling } = props;

  return (
    <div>
      <span>{title}</span>
      <Link
        style={{ marginLeft: 10 }}
        onClick={() => {
          openModal(
            {
              title: '批量输入',
              footer: null,
              children: <FormContent onSubmit={onSubmit} title={title} showAql={showAql} showSampling={showSampling} />,
              getContainer: () => document.getElementsByClassName(styles.tableContainer)[0],
            },
            context,
          );
        }}
      >
        批量
      </Link>
    </div>
  );
};

export default bulkActionModal;
