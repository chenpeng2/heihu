import React, { Component } from 'react';
import _ from 'lodash';

import { getProject } from 'src/services/cooperate/project';

import CreateProjectForm from './createSonProjectForm';
import ProjectDetailCard from './projectDetailCard';

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
    const projectCode = _.get(match, 'params.projectCode');

    getProject({ code: decodeURIComponent(projectCode) }).then(res => {
      const data = _.get(res, 'data.data');
      this.setState({ fatherProjectDetail: data });
    });
  }

  renderFatherProjectDetail = () => {
    const { fatherProjectDetail } = this.state;

    return <ProjectDetailCard fatherProjectDetail={fatherProjectDetail} />;
  };

  renderCreateProjectForm = () => {
    const { match } = this.props;
    const { fatherProjectDetail } = this.state;
    const projectCode = _.get(match, 'params.projectCode');

    return <CreateProjectForm fatherProjectDetail={fatherProjectDetail} fatherProjectCode={projectCode} />;
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

export default CreateSonProject;
