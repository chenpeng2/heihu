import React, { Component } from 'react';
import { Modal } from 'antd';
import { Button, RestPagingTable, Link } from 'components';
import { replaceSign } from 'src/constants';
import { getQuery } from 'src/routes/getRouteParams';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { withRouter } from 'react-router-dom';
import { formatUnix } from 'utils/time';
import { setLocation } from 'utils/url';
import { queryReportTemplateList, deleteReportTemplate } from 'src/services/knowledgeBase/equipment';
import styles from './styles.scss';

const reportTemplateItem = {
  value: 'reportTemplate',
  display: '报告模板',
};

type Props = {
  params: {},
  intl: any,
  match: {},
};

class ReportTemplateList extends Component {
  props: Props;
  state = {
    loading: false,
    dataSource: [],
    total: 0,
  };

  componentDidMount = () => {
    const { match } = this.props;
    const queryMatch = getQuery(match);
    this.fetchData(queryMatch);
  };

  fetchData = async params => {
    this.setState({ loading: true });
    setLocation(this.props, p => ({ ...p, ...params }));
    const {
      data: { data, total },
    } = await queryReportTemplateList({ ...params });
    this.setState({ dataSource: data, total, loading: false });
  };

  showDeleteConfirm = (id, name) => {
    const { intl } = this.props;
    const { changeChineseTemplateToLocale } = this.context;
    Modal.confirm({
      iconType: 'exclamation-circle',
      className: `${styles.deleteModal}`,
      title: changeChineseToLocale('删除报告模板', intl),
      content: changeChineseTemplateToLocale('确认删除设备类型{name}吗？此操作无法恢复！', {
        name,
      }),
      okText: changeChineseToLocale('删除', intl),
      cancelText: changeChineseToLocale('放弃', intl),
      onOk: () => {
        deleteReportTemplate(id)
          .then(res => {
            if (res.data.statusCode === 200) {
              const { match } = this.props;
              const queryMatch = getQuery(match);
              this.fetchData(queryMatch);
            }
          })
          .catch(console.log);
      },
    });
  };

  getColumns = () => {
    const columns = [
      {
        title: '报告模板',
        dataIndex: 'name',
        key: 'name',
        render: name => {
          return name || replaceSign;
        },
      },
      {
        title: '创建人',
        dataIndex: 'creator.name',
        key: 'creator.name',
        render: name => name || replaceSign,
      },
      {
        title: '上次更新',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: updatedAt => formatUnix(updatedAt) || replaceSign,
      },
      {
        title: '操作',
        dataIndex: 'id',
        render: (id, record) => {
          return (
            <div key={`action-${record.id}`}>
              <Link
                style={{ marginRight: 10 }}
                onClick={() => {
                  this.context.router.history.push(`/knowledgeManagement/reportTemplate/${id}/edit`);
                }}
              >
                编辑
              </Link>
              <Link
                style={{ marginRight: 10 }}
                onClick={() => {
                  const name = record.name;
                  this.showDeleteConfirm(id, name);
                }}
              >
                删除
              </Link>
            </div>
          );
        },
      },
    ];
    return columns;
  };

  render() {
    const { dataSource, total, loading } = this.state;
    const columns = this.getColumns();
    return (
      <div>
        <div style={{ display: 'flex', margin: '20px 20px', justifyContent: 'space-between' }}>
          <Button
            icon="plus-circle-o"
            onClick={() => {
              this.context.router.history.push('/knowledgeManagement/reportTemplate/create');
            }}
          >
            {`创建${reportTemplateItem.display}`}
          </Button>
        </div>
        <RestPagingTable
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          total={total}
          rowKey={record => record.id}
          refetch={this.fetchData}
        />
      </div>
    );
  }
}

ReportTemplateList.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseTemplateToLocale: PropTypes.any,
};

export default withRouter(injectIntl(ReportTemplateList));
