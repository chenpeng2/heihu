import React from 'react';
import PropTypes from 'prop-types';
import PageScrollLayout from 'layouts/pageScrollLayout';
import styles from './styles.scss';

const bodyStyle = {
  background: '#fafafa',
};
const bodyLayout = ({ header, children, containerStyle, style }) => (
  <PageScrollLayout className={styles.layoutMain} style={{ ...bodyStyle, ...style }}>
    <div className={styles.layoutHeader} style={{ paddingLeft: 20, display: 'block' }}>
      {header}
    </div>
    <div scroll className={styles.layoutContainer} style={containerStyle}>
      {children}
    </div>
  </PageScrollLayout>
);

bodyLayout.propTypes = {
  header: PropTypes.shape({
    leftComponent: PropTypes.node,
    messageContent: PropTypes.node,
    count: PropTypes.number,
  }),
  accountInfo: PropTypes.node,
  containerStyle: PropTypes.shape({
    padding: PropTypes.string,
  }),
  children: PropTypes.node.isRequired,
  style: PropTypes.shape({
    marginLeft: PropTypes.number,
  }),
  footer: PropTypes.node,
};

export default bodyLayout;
