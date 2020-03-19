import React from 'react';
import { Form, FormItem, Icon, Link, Select, SimpleTable } from 'components';
import classNames from 'classnames';
import SearchSelect from 'components/select/searchSelect';
import _ from 'lodash';
import { StationDefine } from '../workstation/workstationBaseForm';
import styles from '../workstation/index.scss';

const { Option } = Select;

class RelationWorkerFormItem extends React.PureComponent {
  state = {
    dataSource: [],
  };

  render() {
    const { form: { getFieldValue, getFieldDecorator, resetFields, setFieldsValue } } = this.props;
    getFieldDecorator('workerKeys', {
      initialValue: [],
    });
    const workerKeys = getFieldValue('workerKeys');
    const columns = [
      {
        title: '编号',
        width: 80,
        key: 'number',
        render: (text, record, index) => (
          <Form.Item>
            <Icon
              type="minus-circle"
              style={{ cursor: 'pointer', marginRight: 5 }}
              onClick={() => {
                setFieldsValue({
                  workerKeys: workerKeys.filter(({ key }) => key !== record.key),
                });
              }}
            />
            {index + 1}
          </Form.Item>
        ),
      },
      {
        title: '岗位',
        width: 200,
        render: (text, { key }) => (
          <Form.Item>
            {getFieldDecorator(`workers[${key}].job`, {
              rules: [{ required: true, message: '岗位必填' }],
            })(
              <Select
                style={{ width: 150 }}
                onChange={() => {
                  resetFields([`workers[${key}].id`]);
                }}
              >
                {Object.keys(StationDefine).map(key => (
                  <Option value={key} key={key}>
                    {StationDefine[key]}
                  </Option>
                ))}
              </Select>,
            )}
          </Form.Item>
        ),
      },
      {
        title: '员工姓名',
        key: 'name',
        width: 200,
        render: (name, { key }) => {
          const job = getFieldValue(`workers[${key}].job`);
          return (
            <Form.Item>
              {getFieldDecorator(`workers[${key}].id`, {
                rules: [{ required: true, message: '员工姓名必填' }],
              })(
                <SearchSelect
                  key={job}
                  params={job === 'QC' ? { roleId: 11 } : {}}
                  disabled={!job}
                  style={{ width: 150 }}
                  type="account"
                  loadOnFocus
                  handleData={data =>
                    data.map(node => {
                      return getFieldValue('workers')
                        .map(({ id }) => id)
                        .includes(node.key)
                        ? { ...node, disabled: true }
                        : node;
                    })
                  }
                />,
              )}
            </Form.Item>
          );
        },
      },
    ];
    return (
      <SimpleTable
        scroll={{ y: 390 }}
        className={classNames(styles.relevancePerson, workerKeys.length <= 0 && styles['hidden-table'])}
        dataSource={workerKeys}
        pagination={false}
        columns={columns}
        tableStyle={{ minWidth: 300 }}
        style={{ margin: 0 }}
        locale={{ emptyText: null }}
        footer={() => (
          <Link
            icon="plus-circle-o"
            onClick={() => {
              setFieldsValue({
                workerKeys:
                  workerKeys.length > 0
                    ? workerKeys.concat({
                        key: _.get(workerKeys[workerKeys.length - 1], 'key', 0) + 1,
                      })
                    : [{ key: 0 }],
              });
              setTimeout(() => {
                const table = document.querySelector(`.${styles.relevancePerson} .ant-table-body`);
                table.scrollTop = table.scrollHeight;
              });
            }}
          >
            添加关联人员
          </Link>
        )}
      />
    );
  }
}

export default RelationWorkerFormItem;
