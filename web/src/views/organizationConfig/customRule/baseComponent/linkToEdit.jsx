import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link, Icon } from 'src/components';

class LinkToEdit extends Component {
  state = {};

  render() {
    const { router } = this.context;
    const { withIcon, id } = this.props;

    return (
      <Link
        style={{ marginRight: 20 }}
        onClick={() => {
          router.history.push(`/customRule/${encodeURIComponent(id)}/edit`);
        }}
      >
        {withIcon ? <Icon type={'edit'} style={{ marginRight: 5 }} /> : null}
        <span>编辑</span>
      </Link>
    );
  }
}

LinkToEdit.propTypes = {
  style: PropTypes.object,
};

LinkToEdit.contextTypes = {
  router: PropTypes.any,
};

export default LinkToEdit;
