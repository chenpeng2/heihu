import * as React from 'react';
import { Icon, Button } from 'components';
import styles from '../index.scss';

const NoAvailableUser = ({ onOk }: { onOk: () => {} }) => {
  return (
    <div className={styles.onSaveSamePop}>
      <div className={styles.top}>
        <Icon type="close-circle" className={styles.contactIcon} />
        <div>
          <p className={styles.contact}>没有更多可用帐号了，购买更多帐号请联系：</p>
          <p>电话：400-921-0816</p>
          <p>邮箱：contact@blacklake.cn</p>
        </div>
      </div>
      <div className={styles.footer}>
        <Button size="small" type="default" onClick={onOk}>
          知道了
        </Button>
      </div>
    </div>
  );
};

export default NoAvailableUser;
