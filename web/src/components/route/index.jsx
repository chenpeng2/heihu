import React from 'react';
import _ from 'lodash';
import queryString from 'query-string';
import { Route as RRoute } from 'react-router-dom';
import { closeModal } from 'src/components/modal';
import { closeNotificationDropDown } from 'src/views/app/notification/notificationDropdown/notificationDropdown';

type propsType = {
  location: any,
  breadcrumbName: string,
  computedMatch: any,
  params: any,
};

class Route extends React.Component<propsType> {
  state = {};

  componentWillReceiveProps() {
    // when location change to close open modal
    closeModal();
    closeNotificationDropDown();
  }

  render() {
    const { location, computedMatch, breadcrumbName } = this.props;
    if (location) {
      location.query = queryString.parse(location.search);
      location.breadcrumbName = breadcrumbName;
    }
    if (computedMatch) {
      computedMatch.location = location;
    }

    return (
      <RRoute exact {...this.props} />
    );
  }
}

export default Route;
