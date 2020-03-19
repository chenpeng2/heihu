import React, { Component } from 'react';
import { replaceSign } from 'src/constants';
import { Row, Col, Link } from 'components';
import _ from 'lodash';
import auth from 'utils/auth';
import { changeChineseToLocaleWithoutIntl } from 'src/utils/locale/utils';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import authorityWrapper from 'src/components/authorityWrapper';
import { queryQcItemDetail } from 'src/services/knowledgeBase/qcItems';
import { toCopyQcItem, toEditQcItem, toQcItemOperationLog } from '../../navigation';
import styles from './styles.scss';

type Props = {
  match: {
    params: {},
  },
};

const LinkWithAuth = authorityWrapper(Link);

class QcItemDetail extends Component {
  props: Props;
  state = {
    data: {},
  };

  componentDidMount() {
    const {
      props: {
        match: {
          params: { id },
        },
      },
    } = this;
    this.fetchData(id);
  }

  fetchData = async code => {
    return queryQcItemDetail(code)
      .then(({ data: { data } }) => {
        this.setState({
          data,
        });
      })
      .catch(e => console.log(e));
  };

  render() {
    const { data } = this.state;
    return (
      <div id="qc_item_detail">
        <div className={styles.headerLine}>
          <div className={styles.detailHeaders}>{changeChineseToLocaleWithoutIntl('质检项详情')}</div>
          <div className={styles.operations}>
            <LinkWithAuth
              icon="file-add"
              auth={auth.WEB_CREATE_QUALITY_TESTING_POINT}
              style={{ marginRight: 40 }}
              onClick={() => {
                const {
                  props: {
                    match: {
                      params: { id },
                    },
                  },
                } = this;
                this.context.router.history.push(toCopyQcItem(id));
              }}
            >
              复制
            </LinkWithAuth>
            <LinkWithAuth
              auth={auth.WEB_EDIT_QUALITY_TESTING_CONCERN}
              icon="form"
              style={{ marginRight: 40 }}
              onClick={() => {
                const {
                  props: {
                    match: {
                      params: { id },
                    },
                  },
                } = this;
                this.context.router.history.push(toEditQcItem(id));
              }}
            >
              编辑
            </LinkWithAuth>
            <Link
              icon="bars"
              onClick={() => {
                const {
                  props: {
                    match: {
                      params: { id },
                    },
                  },
                } = this;
                this.context.router.history.push(toQcItemOperationLog(id));
              }}
            >
              查看操作记录
            </Link>
          </div>
        </div>
        <Row>
          <Col type="title">编号</Col>
          <Col type="content" style={{ width: 600 }}>
            {_.get(data, 'code', replaceSign)}
          </Col>
        </Row>
        <Row>
          <Col type="title">名称</Col>
          <Col type="content" style={{ width: 600 }}>
            {_.get(data, 'name', replaceSign)}
          </Col>
        </Row>
        <Row>
          <Col type="title">分类</Col>
          <Col type="content" style={{ width: 600 }}>
            {_.get(data, 'group.name', replaceSign)}
          </Col>
        </Row>
        <Row>
          <Col type="title">备注</Col>
          <Col type="content" style={{ width: 600 }}>
            {data && data.desc ? data.desc : replaceSign}
          </Col>
        </Row>
      </div>
    );
  }
}

QcItemDetail.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(QcItemDetail);
