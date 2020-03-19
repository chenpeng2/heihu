import React from 'react';
import { withRouter } from 'react-router-dom';
import { Button } from 'components';
import PropTypes from 'prop-types';

import styles from '../styles.scss';
import { toQcPlanList } from '../../navigation';

type Props = {
  submit: () => {},
};

const QcPlanButtonFooter = (props: Props, context) => {
  const { submit } = props;
  const { changeChineseToLocale } = context;

  const returnToQcPlanList = () => {
    props.history.push(toQcPlanList());
  };

  return (
    <div className={styles.qcPlan_footer_wrapper}>
      <Button onClick={returnToQcPlanList} type="ghost" className={styles.qcPlan_footer_button}>
        {changeChineseToLocale('取消')}
      </Button>
      <Button onClick={submit} type="primary" className={styles.qcPlan_footer_button}>
        {changeChineseToLocale('保存')}
      </Button>
    </div>
  );
};

QcPlanButtonFooter.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export default withRouter(QcPlanButtonFooter);
