import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import { queryPlannedTicketDetail } from 'src/services/cooperate/plannedTicket';

import CreatePlannedTicketForm from './createSonPlannedTicketForm';
import PlannedTicketDetailCard from './plannedTicketDetailCard';

type Props = {
  style: {},
  match: any,
};

class CreateSonProject extends Component {
  props: Props;
  state = {
    fatherProjectDetail: {},
  };

  componentDidMount() {
    const { match } = this.props;
    const plannedTicketCode = decodeURIComponent(_.get(match, 'params.id'));

    queryPlannedTicketDetail(plannedTicketCode).then(res => {
      const data = _.get(res, 'data.data');
      this.setState({ fatherProjectDetail: data });
    });
  }

  renderFatherProjectDetail = () => {
    return <PlannedTicketDetailCard fatherProjectDetail={this.state.fatherProjectDetail} />;
  };

  renderCreateProjectForm = () => {
    const { match } = this.props;
    const plannedTicketCode = decodeURIComponent(_.get(match, 'params.id'));

    return <CreatePlannedTicketForm fatherPlannedTicketDetail={this.state.fatherProjectDetail} fatherPlannedTicketCode={plannedTicketCode} />;
  };

  render() {
    return (
      <div>
        {this.renderFatherProjectDetail()}
        {this.renderCreateProjectForm()}
      </div>
    );
  }
}

export default withRouter(CreateSonProject);
