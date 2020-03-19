import React from 'react';
import PropTypes from 'prop-types';

import { Link, haveAuthority } from 'src/components';
import auth from 'src/utils/auth';

import { getEditStoragePageUrl } from '../utils';

const LinkToEditPage = (props: { withIcon: boolean, code: any, style: any }, context) => {
  const { code, style, withIcon } = props;
  const haveEditStorehouseAuthority = haveAuthority(auth.WEB_WAREHOUSE_UPDATE);

  return (
    <Link
      icon={withIcon ? 'edit' : null}
      style={style}
      disabled={!haveEditStorehouseAuthority}
      onClick={() => {
        context.router.history.push(getEditStoragePageUrl(code));
      }}
    >
      编辑
    </Link>
  );
};

LinkToEditPage.contextTypes = {
  router: PropTypes.any,
};

export default LinkToEditPage;
