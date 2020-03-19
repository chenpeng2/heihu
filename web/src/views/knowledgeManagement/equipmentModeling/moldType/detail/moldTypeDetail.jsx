import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Modal } from 'antd';
import auth from 'utils/auth';
import { Row, Col, Link } from 'components';
import { error } from 'src/styles/color';
import {
  queryMoldCategoryDetail,
  deleteMoldCategory,
} from 'src/services/knowledgeBase/equipment';
import authorityWrapper from 'src/components/authorityWrapper';
import styles from './styles.scss';

const EditLink = authorityWrapper(Link);
const DeleteLink = authorityWrapper(Link);

type Props = {
  match: {
    params: {
      id: any,
    }
  },
}

class MoldTypeDetail extends Component {
  props: Props;
  state = {
    data: {},
  }

  componentDidMount() {
    const { match: { params: { id } } } = this.props;
    this.fetchData(id);
  }

  fetchData = async (id) => {
    const { data } = await queryMoldCategoryDetail(id);
    this.setState({
      data: data.data,
    });
  }

  showDeleteConfirm = () => {
    const { data } = this.state;
    Modal.confirm({
      iconType: 'exclamation-circle',
      className: `${styles.deleteModal}`,
      title: '删除模具类型',
      content: `确认删除模具类型${data.name}吗？此操作无法恢复！`,
      okText: '删除',
      cancelText: '放弃',
      onOk: () => {
        const { match: { params: { id } } } = this.props;
        deleteMoldCategory(id)
        .then(res => {
          if (res.status === 200) {
            this.context.router.history.push('/knowledgeManagement/moldType');
          }
        })
        .catch(console.log);
      },
    });
  }

  render() {
    const { data } = this.state;
    const { repairTaskConfig, maintainTaskConfig } = data && data;
    if (!data || !repairTaskConfig || !maintainTaskConfig) {
      return null;
    }
    return (
      <div className={styles.moldTypeDetail}>
        <div style={{ paddingBottom: 20 }}>
          <Row style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className={styles.detailHeaders}>基本信息</div>
            <Col>
              <EditLink
                auth={auth.WEB_EDIT_MOULD}
                icon="form"
                style={{ marginRight: 40 }}
                onClick={() => {
                  const { match: { params: { id } } } = this.props;
                  this.context.router.history.push(`/knowledgeManagement/moldType/${id}/edit`);
                }}
              >
                编辑
              </EditLink>
              <DeleteLink
                auth={auth.WEB_REMOVE_MOULD}
                icon="delete"
                style={{ color: error }}
                onClick={() => {
                  const { match: { params: { id } } } = this.props;
                  this.showDeleteConfirm();
                }}
              >
                删除
              </DeleteLink>
            </Col>
          </Row>
          <div className={styles.detailContent}>
            <Row>
              <Col type={'title'}>{'模具类型名称'}</Col>
              <Col type={'content'} style={{ width: 900 }}>
                {data.name}
              </Col>
            </Row>
          </div>
          <div style={{ paddingBottom: 20 }}>
            <div className={styles.detailHeaders}>维修任务配置</div>
            <Row>
              <Col type={'title'}>{'扫码确认'}</Col>
              <Col type={'content'} style={{ width: 900 }}>
                {repairTaskConfig.scan ? '开启' : '关闭'}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{'设备停机'}</Col>
              <Col type={'content'} style={{ width: 900 }}>
                {repairTaskConfig.stop ? '开启' : '关闭'}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{'报告模板'}</Col>
              <Col type={'content'} style={{ width: 900 }}>
                {repairTaskConfig.reportTemplate.name}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{'提醒设置'}</Col>
              <Col type={'content'} style={{ width: 900 }}>
                {repairTaskConfig.warnConfigDisplay}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{'完成验收'}</Col>
              <Col type={'content'} style={{ width: 900 }}>
                {repairTaskConfig.acceptanceCheck ? '是' : '否'}
              </Col>
            </Row>
          </div>
          <div style={{ paddingBottom: 20 }}>
            <div className={styles.detailHeaders}>保养任务配置</div>
            <Row>
              <Col type={'title'}>{'扫码确认'}</Col>
              <Col type={'content'} style={{ width: 900 }}>
                {maintainTaskConfig.scan ? '开启' : '关闭'}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{'设备停机'}</Col>
              <Col type={'content'} style={{ width: 900 }}>
                {maintainTaskConfig.stop ? '开启' : '关闭'}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{'报告模板'}</Col>
              <Col type={'content'} style={{ width: 900 }}>
                {maintainTaskConfig.reportTemplate.name}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{'提醒设置'}</Col>
              <Col type={'content'} style={{ width: 900 }}>
                {maintainTaskConfig.warnConfigDisplay}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{'完成验收'}</Col>
              <Col type={'content'} style={{ width: 900 }}>
                {maintainTaskConfig.acceptanceCheck ? '是' : '否'}
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }
}

MoldTypeDetail.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(MoldTypeDetail);
