import React from 'react';
import { Icon } from 'components';
import styles from './index.scss';

export function RemoveIconPalceholder() {
  return <div className={styles.removeIconPlaceholder} />;
}

type Props = {
  onClick: () => void,
};

export default function RemoveButton(props: Props) {
  const { onClick } = props;
  return (
    <div className={styles.removeButton} onClick={onClick}>
      <Icon className={styles.removeIcon} iconType="gc" type="shanchu" />
    </div>
  );
}
