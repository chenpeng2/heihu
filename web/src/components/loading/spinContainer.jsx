import React from 'react';
import { Spin } from 'antd';
import { connect } from 'react-redux';
import _ from 'lodash';
import styles from './index.scss';

type Props = {
  spinning: Boolean,
  children: any,
};

const SpinContainer = (props: Props) => {
  const { spinning, children } = props;

  return (
    <Spin spinning={spinning} wrapperClassName={styles.wrapper}>
      {children}
    </Spin>
  );
};

const mapStateToProps = state => {
  const spinning = _.get(state, 'app.spinning', false);
  return { spinning };
};

const ConnectedComponent = connect(mapStateToProps)(SpinContainer);

export default ConnectedComponent;
