import React, { Component } from 'react';
import { RestPagingTable, Link, Spin, buttonAuthorityWrapper, openModal } from 'src/components';
import { replaceSign } from 'src/constants';
import auth from 'utils/auth';
import { getCustomLanguage } from 'src/services/organization';
import CustomLanguageModal from './customLanguageModal';

type Props = {};
const LinkWithAuth = buttonAuthorityWrapper(Link);

class CustomLanguageList extends Component {
  props: Props;
  state = {
    data: [{}],
  };

  componentDidMount() {
    this.setState({ loading: true });
    getCustomLanguage()
      .then(res => {
        const { data } = res.data;
        this.setState({ data, loading: false });
      });
  }

  getColumns = () => {
    const columns = [
      {
        title: '业务功能',
        dataIndex: 'moduleTypeDisplay',
        key: 'moduleTypeDisplay',
        render: moduleTypeDisplay => {
          return moduleTypeDisplay || replaceSign;
        },
      },
      {
        title: '显示话术',
        dataIndex: 'moduleName',
        key: 'moduleName',
        render: moduleName => {
          return moduleName || replaceSign;
        },
      },
      {
        title: '操作',
        render: (_, record) => {
          return (
            <div key={`action-${record.id}`}>
              <LinkWithAuth
                auth={auth.WEB_EDIT_CUSTOM_LANGUAGE}
                style={{ marginRight: 10 }}
                onClick={() => {
                  openModal({
                    title: '编辑',
                    footer: null,
                    children: <CustomLanguageModal data={record} onUpdate={() => { this.setState({ update: true }); }} />,
                  });
                }}
              >
                编辑
              </LinkWithAuth>
            </div>
          );
        },
      },
    ];
    return columns;
  };

  render = () => {
    const { data, loading } = this.state;
    const columns = this.getColumns();

    return (
      <Spin spinning={loading}>
        <div style={{ marginTop: 20 }}>
          <RestPagingTable
            loading={loading}
            dataSource={data}
            columns={columns}
            pagination={false}
            refetch={this.fetchData}
          />
        </div>
      </Spin>
    );
  }
}

export default CustomLanguageList;
