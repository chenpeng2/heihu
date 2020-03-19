import React from 'react';
import PropTypes from 'prop-types';

import { border, white, primary } from 'src/styles/color/index';
import { Icon, FormattedMessage, openModal } from 'src/components/index';

import CreateModal from './CreateModal';
import Styles from '../styles.scss';

const AddConfigCard = props => {
  const { style, refetch } = props;
  return (
    <div
      className={Styles.addCard}
      style={{
        cursor: 'pointer',
        ...style,
      }}
      onClick={() => {
        openModal({
          title: '创建监控条件',
          children: <CreateModal />,
          onOk: () => {
            if (typeof refetch === 'function') refetch();
          },
          footer: null,
        });
      }}
    >
      <Icon iconType={'gc'} type={'tianjia'} style={{ color: primary }} />
      <FormattedMessage defaultMessage={'添加新的监控条件'} />
    </div>
  );
};

AddConfigCard.propTypes = {
  style: PropTypes.any,
  refetch: PropTypes.any,
};

export default AddConfigCard;
