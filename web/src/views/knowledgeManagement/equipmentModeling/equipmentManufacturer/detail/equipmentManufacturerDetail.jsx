import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Row, Col, Link } from 'components';
import { queryEquipmentManufacturerDetail, deleteEquipmentManufacturer } from 'src/services/knowledgeBase/equipment';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { replaceSign } from 'src/constants';
import { error } from 'src/styles/color';
import { Modal } from 'antd';
import styles from './styles.scss';

type Props = {
  match: {
    params: {
      id: any,
    },
  },
  intl: any,
};

class EquipmentManufacturerDetail extends Component {
  props: Props;
  state = {
    data: {},
  };

  componentDidMount() {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    this.fetchData(id);
  }

  fetchData = async id => {
    const { data } = await queryEquipmentManufacturerDetail(id);
    this.setState({
      data: data.data,
    });
  };

  showDeleteConfirm = id => {
    Modal.confirm({
      iconType: 'exclamation-circle',
      className: `${styles.deleteModal}`,
      title: '删除设备制造商',
      content: '删除该设备制造商将不可用于设备信息的维护，请确认！',
      okText: '删除',
      cancelText: '放弃',
      onOk: () => {
        deleteEquipmentManufacturer(id)
          .then(res => {
            if (res.data.statusCode === 200) {
              this.context.router.history.push('/knowledgeManagement/equipmentManufacturer');
            }
          })
          .catch(console.log);
      },
    });
  };

  render() {
    const { intl } = this.props;
    const { data } = this.state;
    return (
      <div className={styles.equipmentManufacturerDetail}>
        <div className={styles.detailContent}>
          <div style={{ paddingBottom: 20 }}>
            <Row style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className={styles.detailHeaders}>{changeChineseToLocale('基本信息', intl)}</div>
              <Col>
                <Link
                  icon="form"
                  style={{ marginRight: 40 }}
                  onClick={() => {
                    const {
                      match: {
                        params: { id },
                      },
                    } = this.props;
                    this.context.router.history.push(`/knowledgeManagement/equipmentManufacturer/${id}/edit`);
                  }}
                >
                  编辑
                </Link>
                <Link
                  icon="delete"
                  style={{ color: error }}
                  onClick={() => {
                    const {
                      match: {
                        params: { id },
                      },
                    } = this.props;
                    this.showDeleteConfirm(id);
                  }}
                >
                  删除
                </Link>
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{'制造商名称'}</Col>
              <Col type={'content'} style={{ width: 900 }}>
                {data.name || replaceSign}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{'简称'}</Col>
              <Col type={'content'} style={{ width: 900 }}>
                {data.shortName || replaceSign}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{'地址'}</Col>
              <Col type={'content'} style={{ width: 900 }}>
                {data.address || replaceSign}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{'联系人'}</Col>
              <Col type={'content'} style={{ width: 900 }}>
                {data.contact || replaceSign}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{'联系人电话'}</Col>
              <Col type={'content'} style={{ width: 900 }}>
                {data.contactNumber || replaceSign}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{'传真'}</Col>
              <Col type={'content'} style={{ width: 900 }}>
                {data.fax || replaceSign}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{'电子邮件'}</Col>
              <Col type={'content'} style={{ width: 900 }}>
                {data.email || replaceSign}
              </Col>
            </Row>
            <Row>
              <Col type={'title'}>{'备注'}</Col>
              <Col type={'content'} style={{ width: 900 }}>
                {data.remark || replaceSign}
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }
}

EquipmentManufacturerDetail.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(injectIntl(EquipmentManufacturerDetail));
