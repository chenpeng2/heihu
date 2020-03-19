import React, { Component } from 'react';
import _ from 'lodash';
import auth from 'utils/auth';
import { withRouter } from 'react-router-dom';
import { Modal } from 'antd';
import PropTypes from 'prop-types';
import { getQuery } from 'src/routes/getRouteParams';
import { setLocation } from 'utils/url';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { queryQcItemsGroupList, deleteQcItemsGroup } from 'src/services/knowledgeBase/qcItems';
import { Input, Button, RestPagingTable, Link, Tooltip, OpenModal, withForm, FormItem } from 'components';
import authorityWrapper from 'src/components/authorityWrapper';
import { replaceSign } from 'src/constants';
import QcItemsGroupForm from '../base/qcItemsGroupForm';
import styles from './styles.scss';
import { toQcItemsGroupList } from '../../navigation';

const ButtonWithAuth = authorityWrapper(Button);
const LinkWithAuth = authorityWrapper(Link);

const qcItemsGroupItem = {
  value: 'qcItemsGroupItem',
  display: '质检项分类',
};

type Props = {
  intl: any,
  match: {},
  form: {
    getFieldDecorator: () => {},
    resetFields: () => {},
  },
};

class QcItemsGroupList extends Component {
  props: Props;
  state = {
    loading: false,
    dataSource: [],
    total: 0,
  };

  componentDidMount() {
    const { match } = this.props;
    const queryMatch = getQuery(match);
    this.fetchData(queryMatch);
  }

  showDeleteConfirm = (id, record) => {
    const { intl } = this.props;
    const { changeChineseTemplateToLocale } = this.context;
    const qcItemsNum = _.get(record, 'qcCheckItems.length', undefined);
    const text = qcItemsNum
      ? changeChineseTemplateToLocale('删除该分类不会影响该分类下的{qcItemsNum}个质检项。', {
          qcItemsNum,
        })
      : '';
    Modal.confirm({
      iconType: 'exclamation-circle',
      className: `${styles.deleteModal}`,
      title: changeChineseToLocale('删除质检项分类', intl),
      content: changeChineseTemplateToLocale('确定删除质检项分类「{name}」吗？{text}', {
        name: record.name,
        text,
      }),
      okText: changeChineseToLocale('确定删除', intl),
      cancelText: changeChineseToLocale('暂不删除', intl),
      onOk: () => {
        deleteQcItemsGroup(id)
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

  onSearch = () => {
    const { form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        // const _format = this.formatData(values);
        this.fetchData({ ...values, page: 1, size: 10 });
      }
    });
  };

  fetchData = async (params = {}) => {
    this.setState({ loading: true });
    setLocation(this.props, p => ({ ...p, ...params }));
    const {
      data: { data, total },
    } = await queryQcItemsGroupList({ ...params, includeQcCheckItem: true });
    this.setState({ dataSource: data, total, loading: false });
  };

  getColumns = () => {
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        width: 230,
        render: name => <Tooltip text={name || replaceSign} width={220} />,
      },
      {
        title: '包含质检项',
        dataIndex: 'qcCheckItems',
        key: 'qcCheckItems',
        render: items => {
          const names = items.map(x => x.name);
          let text = '';
          names.forEach(x => {
            const comma = text === '' ? '' : '、';
            text = `${text}${comma}${x}`;
            return text;
          });
          return items.length ? <Tooltip text={text} length={75} /> : replaceSign;
        },
      },
      {
        title: '操作',
        dataIndex: 'id',
        width: 100,
        render: (id, record) => {
          return (
            <div key={`action-${record.id}`}>
              <LinkWithAuth
                auth={auth.WEB_EDIT_QUALITY_TESTING_CATEGORY}
                style={{ marginRight: 10 }}
                onClick={() => {
                  OpenModal(
                    {
                      title: '编辑质检项分类',
                      footer: null,
                      width: 660,
                      children: (
                        <QcItemsGroupForm
                          data={record}
                          onSuccess={() => {
                            this.context.router.history.push(toQcItemsGroupList());
                            const { match } = this.props;
                            const queryMatch = getQuery(match);
                            this.fetchData(queryMatch);
                          }}
                        />
                      ),
                    },
                    this.context,
                  );
                }}
              >
                编辑
              </LinkWithAuth>
              <LinkWithAuth
                auth={auth.WEB_DELETE_QUALITY_TESTING_CATEGORY}
                style={{ marginRight: 10 }}
                onClick={() => {
                  this.showDeleteConfirm(id, record);
                }}
              >
                删除
              </LinkWithAuth>
            </div>
          );
        },
      },
    ];
    return columns;
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { dataSource, total, loading } = this.state;
    const columns = this.getColumns();
    return (
      <div>
        <div style={{ display: 'flex', margin: '20px 20px', justifyContent: 'space-between', alignItems: 'center' }}>
          <ButtonWithAuth
            auth={auth.WEB_CREATE_QUALITY_TESTING_CATEGORY}
            icon="plus-circle-o"
            onClick={() => {
              OpenModal(
                {
                  title: '创建质检项分类',
                  footer: null,
                  width: 660,
                  children: (
                    <QcItemsGroupForm
                      onSuccess={() => {
                        this.context.router.history.push(toQcItemsGroupList());
                        const { match } = this.props;
                        const queryMatch = getQuery(match);
                        this.fetchData(queryMatch);
                      }}
                    />
                  ),
                },
                this.context,
              );
            }}
          >
            {`创建${qcItemsGroupItem.display}`}
          </ButtonWithAuth>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormItem label="名称" colon={false} style={{ marginBottom: 0, marginRight: 20 }}>
              {getFieldDecorator('nameSearch')(
                <Input onPressEnter={this.onSearch} placeholder="请输入名称" style={{ width: 200, marginLeft: -10 }} />,
              )}
            </FormItem>
            <FormItem style={{ marginBottom: 0 }}>
              <ButtonWithAuth
                auth={auth.WEB_VIEW_QUALITY_TESTING_CATEGORY}
                icon="search"
                onClick={this.onSearch}
                style={{ lineHeight: '28px' }}
              >
                查询
              </ButtonWithAuth>
            </FormItem>
            <Link
              style={{ lineHeight: '28px', height: '28px', color: '#8C8C8C', paddingLeft: 16 }}
              onClick={() => {
                this.props.form.resetFields();
                this.onSearch();
              }}
            >
              重置
            </Link>
          </div>
        </div>
        <RestPagingTable
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          total={total}
          refetch={this.fetchData}
        />
      </div>
    );
  }
}

QcItemsGroupList.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseTemplateToLocale: PropTypes.any,
};

export default withForm({}, withRouter(injectIntl(QcItemsGroupList)));
