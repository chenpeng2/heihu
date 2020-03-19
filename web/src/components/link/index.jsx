import * as React from 'react';
import { Icon } from 'components';
import classNames from 'classnames';
import { Link as RRLink } from 'react-router-dom';
import { injectIntl } from 'react-intl';

import { FIELDS } from 'src/constants';
import LocalStorage from 'utils/localStorage';
import { changeChineseToLocale } from 'src/utils/locale/utils';

import LinkGroup from './linkGroup';
import styles from './index.scss';
import NewTagLink from './NewTagLink';

/**
 * @api {Link} Link.
 * @APIGroup Link.
 * @apiParam {any} children link的文字.
 * @apiParam {Boolean} inline 是否添加display: 'inline-block'的属性.
 * @apiParam {Obj} style 附加的样式,不传有默认.
 * @apiParam {Obj} hoverStyle 鼠标放上去的样式.
 * @apiExample {js} Example usage:
 * <Link
    onClick={() => {
      this.context.router.history.push(`/cooperate/plans/${record.id}/createTask`);
    }}
   >
    {text || errorMessageForItemNo}
   </Link>
 */

type Props = {
  children: ?string | ?React.Node,
  style: any,
  icon: string,
  iconStyle: {},
  className: string,
  type: 'error' | 'primary' | 'grey',
  to: string,
  disabled: boolean,
  auth: string,
  iconType: string,
};

function Link(props: Props): React.Node {
  const {
    intl,
    children,
    style,
    icon,
    iconStyle,
    className,
    type,
    disabled,
    to,
    auth,
    iconType,
    onClick,
    ...rest
  } = props;
  let _disabled = disabled;
  if (auth) {
    _disabled = LocalStorage.get(FIELDS.AUTH).includes(auth) ? disabled : true;
  }
  const disabledStyle = { cursor: 'not-allowed', opacity: 0.3 };
  const linkProps = {
    style: _disabled ? { ...style, ...disabledStyle } : { cursor: 'pointer', ...style },
    className: classNames(styles.link, styles[`link-${type || 'primary'}`], className),
    onClick: _disabled ? () => {} : onClick,
  };
  const iconChildren = icon ? (
    <Icon type={icon} style={{ ...iconStyle, marginRight: 4, padding: 0, fontSize: 14 }} iconType={iconType} />
  ) : null;
  return (
    <React.Fragment>
      {to && !_disabled ? (
        <RRLink {...linkProps} to={to} {...rest}>
          {iconChildren}
          {typeof children === 'string' ? changeChineseToLocale(children, intl) : children}
        </RRLink>
      ) : (
        <a {...linkProps} {...rest}>
          {iconChildren}
          {typeof children === 'string' ? changeChineseToLocale(children, intl) : children}
        </a>
      )}
    </React.Fragment>
  );
}

Link.Group = LinkGroup;
Link.NewTagLink = NewTagLink;

export default injectIntl(Link);
