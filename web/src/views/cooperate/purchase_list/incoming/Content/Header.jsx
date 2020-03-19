import React from 'react';
import { Radio, Icon, PlainText } from 'components';
import styles from '../styles.scss';
import { viewTypeIconMap } from '../../constants';

const PAGE_TITLE = <PlainText text="入厂物料列表" />;

export function Title() {
  return <div className={styles['purchase-material-incoming-content-title']}>{PAGE_TITLE}</div>;
}

type ViewToggleProps = {
  handleViewToggleChange: () => void,
  viewType: Number,
  style: {},
};

export function ViewToggle(props: ViewToggleProps) {
  const { handleViewToggleChange, viewType, style = {} } = props;

  return (
    <div style={style} className={styles['purchase-material-incoming-content-header-view-toggle']}>
      <Radio.Group onChange={handleViewToggleChange} defaultValue={viewType}>
        {Object.keys(viewTypeIconMap).map(type => (
          <Radio.Button value={Number(type)}>
            <Icon iconType="gc" type={viewTypeIconMap[type]} />
          </Radio.Button>
        ))}
      </Radio.Group>
    </div>
  );
}

type IncomingContentHeaderProps = {
  viewType: Number,
  handleViewToggleChange: () => void,
};

export default function IncomingContentHeader(props: IncomingContentHeaderProps) {
  const { viewType, handleViewToggleChange } = props;
  return (
    <div className={styles['purchase-material-incoming-content-header']}>
      <Title />
      <ViewToggle viewType={viewType} handleViewToggleChange={handleViewToggleChange} />
    </div>
  );
}
