import * as React from 'react';
import classNames from 'classnames';
import styles from './index.scss';

type propsType = {
  children: Array<React.Node>,
  className: string,
};

export default function LinkGroup(props: propsType): React.Node {
  const { children, className, ...rest } = props;
  return (
    <div className={classNames(styles.linkGroup, className)} {...rest}>
      {children}
    </div>
  );
}
