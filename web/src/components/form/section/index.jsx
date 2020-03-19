import React from 'react';
import { Icon } from 'antd';

/**
 * @api {section} section.
 * @APIGroup section.
 * @apiParam {Function} onDelete .
 * @apiParam {Boolean} deletable .
 * @apiParam {any} children -
 * @apiExample {js} Example usage:
 * <Section deletable={!hideDelete} onDelete={() => removeField(k)} key={`qcCheckItems-${k}`}>
 */

type Props = {
  deletable: boolean;
  onDelete: Function;
  children: any;
}

const styles = {
  section: {
    display: 'flex',
    justifyContent: 'center',
  },
  sectionSide: {
    flexBasis: '10%',
  },
  sectionSideLeft: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  sectionBody: {
    minWidth: '200px',
    flexBasis: '80%',
  },
};

const Section = (props: Props) => {
  const { children, deletable, onDelete } = props;
  const deleteIcon = (
    <Icon
      onClick={onDelete}
      style={{ fontSize: 20, color: '#F45531', marginTop: '15px' }}
      type="minus-circle"
    />
  );
  return (
    <div
      style={styles.section}
    >
      <div style={{ ...styles.sectionSide, ...styles.sectionSideLeft }}>
        {deletable && deleteIcon}
      </div>
      <div style={styles.sectionBody}>
        {children}
      </div>
      <div style={styles.sectionSide} />
    </div>
  );
};

Section.defaultProps = {
  deletable: false,
  onDelete: () => {},
};

export default Section;
