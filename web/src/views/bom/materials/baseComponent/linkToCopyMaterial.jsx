import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Link, Icon } from 'src/components';
import auth from 'src/utils/auth';

class LinkToCopyMaterial extends Component {
  state = {};

  static goToCopyMaterialPage = (history, code) => {
    if (!history || !code) return;
    history.push(`/bom/materials/${encodeURIComponent(code)}/copy`);
  };

  render() {
    const { materialCode, withIcon } = this.props;
    if (!materialCode) return null;

    return (
      <Link
        auth={auth.WEB_CREATE_MATERIAL_DEF}
        style={{ marginRight: 20 }}
        onClick={() => {
          LinkToCopyMaterial.goToCopyMaterialPage(_.get(this.context, 'router.history'), materialCode);
        }}
        icon={withIcon ? 'copy' : null}
      >
        复制
      </Link>
    );
  }
}

LinkToCopyMaterial.propTypes = {
  style: PropTypes.object,
  materialCode: PropTypes.any,
  withIcon: PropTypes.bool,
};

LinkToCopyMaterial.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default LinkToCopyMaterial;
