import React from 'react';
import { Divider } from 'components';
import PurchaseMaterialIncomingFilter from './Filter';
import styles from '../styles.scss';

type HeaderProps = {
  filterFn: () => void,
  form: any,
};

export default function Header(props: HeaderProps) {
  const { filterFn, form } = props || {};

  return (
    <div className={styles['purchase-material-incoming-header']}>
      <PurchaseMaterialIncomingFilter form={form} fetchData={filterFn} />
      <Divider lineType="solid" />
    </div>
  );
}
