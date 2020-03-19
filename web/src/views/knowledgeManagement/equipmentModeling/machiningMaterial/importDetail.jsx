import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, RestPagingTable, Tooltip } from 'components';
import { getMachiningMaterialImportDetail } from 'src/services/knowledgeBase/equipment';
import { formatUnix } from 'utils/time';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { getQuery } from 'src/routes/getRouteParams';
import { getCustomLanguage } from 'src/utils/customLanguage';
import { replaceSign } from 'src/constants';
import styles from './styles.scss';

type Props = {
  match: any,
  intl: any,
  params: {
    id: string,
  },
};

const customLanguage = getCustomLanguage();

class ImportDetail extends Component {
  props: Props;
  state = {
    loading: false,
    data: null,
    detailList: null,
    importId: '',
    pagination: {},
  };

  componentDidMount() {
    const { match } = this.props;
    const { id } = match.params;
    this.setState(
      {
        importId: id,
        pagination: {
          current: 1,
        },
      },
      () => {
        const { match } = this.props;
        const query = getQuery(match);
        const variables = { ...query };
        this.fetchData({ ...variables });
      },
    );
  }

  fetchData = async params => {
    const { importId } = this.state;
    this.setState({ loading: true });
    const res = await getMachiningMaterialImportDetail(importId);
    const { data } = res.data;
    const { items } = data;
    this.setState({
      data: {
        createdAt: formatUnix(data.createdAt),
        amountSuccess: data.amountSuccess,
        amountFailed: data.amountFailed,
        operatorName: data.operatorName,
        status: (() => {
          const status = data.status;
          if (status === 0) {
            return '导入失败';
          } else if (status === 1) {
            return '导入成功';
          }
          return '部分导入成功';
        })(),
      },
      detailList: items,
      loading: false,
      pagination: {
        total: res.data.count,
        current: res.data.page,
      },
    });
  };

  getColumns = () => {
    const columns = [
      {
        title: '失败原因',
        dataIndex: 'errorDetail',
        render: errorDetail => <Tooltip text={errorDetail || replaceSign} length={18} />,
      },
      {
        title: '类型',
        dataIndex: 'content',
        key: 'typeDisplay',
        render: content => <Tooltip text={content.typeDisplay || replaceSign} length={30} />,
      },
      {
        title: '编号',
        dataIndex: 'content',
        key: 'code',
        render: content => <Tooltip text={content.code || replaceSign} length={20} />,
      },
      {
        title: '名称',
        dataIndex: 'content',
        key: 'name',
        render: content => <Tooltip text={content.name || replaceSign} length={30} />,
      },
      {
        title: '单位',
        dataIndex: 'content',
        key: 'unitName',
        render: content => <Tooltip text={content.unitName || replaceSign} length={12} />,
      },
      {
        title: '参考单价',
        dataIndex: 'content',
        key: 'unitPrice',
        render: content => <Tooltip text={content.unitPrice || replaceSign} length={12} />,
      },
      {
        title: '规格描述',
        dataIndex: 'content',
        key: 'specification',
        type: 'importDetailType',
        render: content => <Tooltip text={content.specification || replaceSign} length={20} />,
      },
      // {
      //   title: '工装类型',
      //   dataIndex: 'content',
      //   key: 'toolingTypeDisplay',
      //   type: 'importDetailType',
      //   render: content => <Tooltip text={content.toolingTypeDisplay || replaceSign} length={20} />,
      // },
    ];
    return columns;
  };

  render() {
    const { intl } = this.props;
    const { changeChineseTemplateToLocale } = this.context;
    const { data, detailList, loading } = this.state;
    if (!data || !detailList) return null;
    const columns = this.getColumns();
    const total = this.state.count || 1;

    return (
      <div id="materialImport_detail">
        <p className={styles.detailLogHeader}>{changeChineseToLocale('导入日志详情', intl)}</p>
        <div style={{ marginBottom: 30 }}>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              {'导入时间'}
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              {data.createdAt}
            </Col>
          </Row>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              {'导入用户'}
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              {data.operatorName}
            </Col>
          </Row>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              {'导入结果'}
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              {data.status}
            </Col>
          </Row>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              {'导入详情'}
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              {changeChineseTemplateToLocale(
                '导入完成，{name}导入成功数：{amountSuccess}，导入失败数：{amountFailed}',
                {
                  name: customLanguage.equipment_machining_material,
                  amountSuccess: data.amountSuccess,
                  amountFailed: data.amountFailed,
                },
              )}
            </Col>
          </Row>
        </div>
        <RestPagingTable
          dataSource={detailList}
          refetch={this.fetchData}
          total={total}
          rowKey={record => record.id}
          columns={columns}
          loading={loading}
          pagination={this.state.pagination}
          bordered
        />
      </div>
    );
  }
}

ImportDetail.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseTemplateToLocale: PropTypes.any,
};

export default injectIntl(ImportDetail);
