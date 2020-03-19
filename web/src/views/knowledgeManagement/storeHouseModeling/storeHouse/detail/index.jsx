/**
 * @description: 仓库详情
 *
 * @date: 2019/5/5 下午3:45
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { black } from 'src/styles/color';
import { Row, Col, Spin, Attachment, FormattedMessage } from 'src/components';
import { getStoreHouse } from 'src/services/knowledgeBase/storeHouse';
import log from 'src/utils/log';
import { replaceSign } from 'src/constants';
import { findQualityStatus } from 'src/views/qualityManagement/constants';
import { arrayIsEmpty } from 'src/utils/array';
import { STORAGE_CAPACITY } from 'src/containers/storeHouse/storageCapacity/utils';
import { getStorageCapacity } from 'src/containers/storeHouse/utils';

import LinkToEditPage from '../commonComponent/linkToEditPage';
import LinkToOperationHistory from '../commonComponent/linkToOperationHistory';
import UpdateStatusConfirmModal from '../../storage/updateStatusConfirmModal';
import MaterialList from './materialList';

const AttachmentFile = Attachment.AttachmentFile;

// 将详情接口的limitControl等数据转为types
const getTypes = detailData => {
  const { secureControl, maxControl, minControl } = detailData || {};

  const types = [];
  if (secureControl) types.push(STORAGE_CAPACITY.safe.value);
  if (maxControl) types.push(STORAGE_CAPACITY.max.value);
  if (minControl) types.push(STORAGE_CAPACITY.min.value);

  return types;
};

class Detail extends Component {
  state = {
    data: {},
    loading: false,
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const { match } = this.props;
    const code = _.get(match, 'params.code');

    this.setState({ loading: true });
    try {
      const res = await getStoreHouse(code);
      const data = _.get(res, 'data.data');
      this.setState({ data });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { data, loading } = this.state;
    const {
      limitControl,
      inventoryLimits,
      remark,
      code,
      qrCode,
      name,
      category,
      status,
      qualityControlSwitch,
      qualityControlItems,
      attachmentFiles,
      maxControl,
      minControl,
      secureControl,
    } = data || {};
    const { changeChineseToLocale } = this.context;

    const _storageCapacity = getStorageCapacity(maxControl, minControl, secureControl);

    return (
      <Spin spinning={loading}>
        <div style={{ margin: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormattedMessage style={{ color: black, fontSize: 16 }} defaultMessage={'仓库详情'} />
            <div>
              <LinkToEditPage withIcon code={code} />
              <LinkToOperationHistory withIcon style={{ marginLeft: 10 }} code={code} />
            </div>
          </div>
          <Row>
            <Col type={'title'}>区域</Col>
            <Col type={'content'}>{category === 1 ? '仓库' : '车间库'}</Col>
          </Row>
          <Row>
            <Col type={'title'}>仓库编码</Col>
            <Col type={'content'}>{code}</Col>
          </Row>
          <Row>
            <Col type={'title'}>仓库名称</Col>
            <Col type={'content'}>{name || replaceSign}</Col>
          </Row>
          <Row>
            <Col type={'title'}>二维码</Col>
            <Col type={'content'}>{qrCode || replaceSign}</Col>
          </Row>
          <Row>
            <Col type={'title'}>当前状态</Col>
            <Col type={'content'}>
              <div>
                {changeChineseToLocale(status === 1 ? '启用中' : '停用中')}
                <UpdateStatusConfirmModal
                  record={data}
                  query={{}}
                  updateStart={() => {
                    this.setState({ loading: true });
                  }}
                  setStatus={() => {
                    this.setState({ loading: false });
                  }}
                />
              </div>
            </Col>
          </Row>
          <Row>
            <Col type={'title'}>仓库质量管理</Col>
            <Col type={'content'}>{qualityControlSwitch ? '启用' : '不启用'}</Col>
          </Row>
          {qualityControlSwitch ? (
            <Row>
              <Col type={'title'}>质量状态</Col>
              <Col type={'content'}>
                {arrayIsEmpty(qualityControlItems)
                  ? replaceSign
                  : qualityControlItems
                      .map(i => {
                        const { name } = findQualityStatus(i) || {};
                        return name;
                      })
                      .filter(i => i)
                      .map(i => changeChineseToLocale(i))
                      .join(',')}
              </Col>
            </Row>
          ) : null}
          <Row>
            <Col type={'title'}>仓库库容管理</Col>
            <Col type={'content'}>{limitControl ? '启用' : '停用'}</Col>
          </Row>
          {limitControl ? (
            <React.Fragment>
              <Row>
                <Col type={'title'}>库容检查项</Col>
                <Col type={'content'}>
                  {arrayIsEmpty(_storageCapacity)
                    ? replaceSign
                    : _storageCapacity
                        .map(i => i && i.name)
                        .filter(i => i)
                        .join(',')}
                </Col>
              </Row>
              <Row>
                <Col type={'title'}>物料列表</Col>
                <Col type={'content'}>
                  <MaterialList types={getTypes(data)} tableData={inventoryLimits} />
                </Col>
              </Row>
            </React.Fragment>
          ) : null}
          <Row>
            <Col type={'title'}>备注</Col>
            <Col type={'content'}>{remark || replaceSign}</Col>
          </Row>
          <Row>
            <Col type={'title'}>附件</Col>
            <Col type={'content'} style={{ display: 'flex', flex: 1, marginTop: 10 }}>
              {!arrayIsEmpty(attachmentFiles) ? AttachmentFile(attachmentFiles) : replaceSign}
            </Col>
          </Row>
        </div>
      </Spin>
    );
  }
}

Detail.propTypes = {
  style: PropTypes.object,
};

Detail.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default Detail;
