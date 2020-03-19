import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link, Icon } from 'src/components';
import { goToCustomCodeEditPage } from '../utils';

class LinkToEdit extends Component {
  state = {};

  render() {
    const { router } = this.context;
    const { withIcon, id } = this.props;

    return (
      <Link
        style={{ marginRight: 20 }}
        onClick={() => {
          goToCustomCodeEditPage(router.history, id);
        }}
      >
        {withIcon ? <Icon type={'edit'} /> : null}
        <span style={{ marginLeft: 5 }}>编辑</span>
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
