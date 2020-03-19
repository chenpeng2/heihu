import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { getQuery } from 'src/routes/getRouteParams';
import { Button, Icon } from 'src/components';

class LinkToExport extends Component {
  props: {
    history: any,
    match: any,
    style: any,
  };
  state = {};

  render() {
    const { history, match, style } = this.props;
    const { changeChineseToLocale } = this.context;
    const queryMatch = getQuery(match);
    const { filter } = queryMatch || {};

    return (
      <Button
        style={style}
        onClick={() => {
          history.push(`/stock/stockCheckRecord/dataExport?time=${filter && filter.time ? JSON.stringify(filter.time) : []}`);
        }}
      >
        <Icon iconType={'gc'} type={'daoru-lv'} />
        <span>{changeChineseToLocale('导出')}</span>
      </Button>
    );
  }
}

LinkToExport.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withRouter(LinkToExport);
