import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import classNames from 'classnames';
import styles from './styles.scss';

type Props = {
  itemHeaderTitle: string,
  TopChildren: any,
  BottomChildren: any,
  action: any,
  itemHeader: any,
  children: React.ReactNode,
  content: React.ReactNode,
  contentStyle: any,
  wrapperStyle: any,
  intl: any,
};

class DetailPageItemContainer extends Component {
  props: Props;
  state = {};

  getHeader = itemHeaderTitle => {
    const { intl } = this.props;
    return <div className={styles.detailPageItemContainerHeader}>{changeChineseToLocale(itemHeaderTitle, intl)}</div>;
  };

  render() {
    const {
      itemHeaderTitle,
      TopChildren,
      BottomChildren,
      action,
      itemHeader,
      children,
      content,
      contentStyle,
      wrapperStyle,
      className,
    } = this.props;

    return (
      <div className={classNames([styles.detailPageItemContainerWrapper, className])} style={wrapperStyle}>
        <div className={styles.detailPageItemContainerHeaderWrapper}>
          {itemHeader || this.getHeader(itemHeaderTitle)}
          {action}
        </div>
        {content || (
          <div className={styles.detailPageItemContainerContent} style={contentStyle}>
            {TopChildren}
            {children}
            {BottomChildren}
          </div>
        )}
      </div>
    );
  }
}

export default injectIntl(DetailPageItemContainer);
