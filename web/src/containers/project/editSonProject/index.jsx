import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import { getProject } from 'src/services/cooperate/project';

import EditProjectForm from './editSonProjectForm';
import ProjectDetailCard from '../createSonProject/projectDetailCard';

type Props = {
  style: {},
  match: any,
};

class CreateSonProject extends Component {
  props: Props;
  state = {
    fatherProjectDetail: {},
    projectData: {},
    fatherProjectCode: null,
  };

  componentDidMount() {
    this.setProjectData();
  }

  setProjectData = async () => {
    const { match } = this.props;
    const projectCode = _.get(match, 'params.projectCode');

    const projectDataRes = await getProject({ code: decodeURIComponent(projectCode) });
    const projectData = _.get(projectDataRes, 'data.data');
    const parentCode = _.get(projectData, 'parentCode');

    const fatherProjectDataRes = await getProject({ code: decodeURIComponent(parentCode) });
    const fatherProjectData = _.get(fatherProjectDataRes, 'data.data');

    this.setState({ fatherProjectDetail: fatherProjectData, projectData, fatherProjectCode: parentCode });
  };

  renderFatherProjectDetail = () => {
    const { fatherProjectDetail } = this.state;

    return <ProjectDetailCard fatherProjectDetail={fatherProjectDetail} />;
  };

  renderCreateProjectForm = () => {
    const { projectData, fatherProjectCode, fatherProjectDetail } = this.state;

    return <EditProjectForm fatherProjectDetail={fatherProjectDetail} initialData={projectData} fatherProjectCode={fatherProjectCode} />;
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
