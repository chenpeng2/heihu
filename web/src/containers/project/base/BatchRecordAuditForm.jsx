import React from 'react';
import PropTypes from 'prop-types';
import { FormItem, AlterableTable, Button, Select } from 'components';
import auth from 'src/utils/auth';
import { getUsers } from 'src/services/auth/user';
import { arrayIsEmpty } from 'utils/array';
import UserOrUserGroupSelect from './UserOrUserGroupSelect';
import styles from './styles.scss';

const Option = Select.Option;

class BatchRecordAuditForm extends React.Component {
  state = {
    batchRecordAuditors: [],
  };

  getAuditorColumn = ({ fieldName, disabled }) => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const tip = <span style={{ color: 'rgba(0, 0, 0, 0.4)' }}> (最多添加5个)</span>;
    return [
      {
        title: <div>审批人{tip}</div>,
        key: 'id',
        dataIndex: 'id',
        render: (data, record) => {
          return (
            <FormItem style={{ display: 'flex', width: 760, justifyContent: 'flex-start', margin: 0, height: 50 }}>
              {getFieldDecorator(`${fieldName}[${record.key}]`)(
                <UserOrUserGroupSelect
                  selectParams={{
                    authorities: auth.WEB_AUDIT_BATCH_RECORD,
                  }}
                  onChange={v => {
                    this.props.form.setFieldsValue({ [`${fieldName}[${record.key}]`]: v });
                  }}
                  style={{ width: 760 }}
                />,
              )}
            </FormItem>
          );
        },
      },
    ];
  };

  setAuditors = dataSource => {
    this.setState({ batchRecordAuditors: dataSource });
  };

  render() {
    const { batchRecordAuditors } = this.state;
    const { onCancel, onSuccess } = this.props;
    return (
      <div>
        <div className={styles.batch_record_audit_form_wrapper}>
          <FormItem label="审批人" required>
            <AlterableTable
              itemName="后续审批人"
              fieldName="approvers"
              dataSource={batchRecordAuditors}
              atLeastNum={1}
              maxNum={5}
              setDataSource={this.setAuditors}
              columns={this.getAuditorColumn({
                fieldName: 'approvers',
                // disabled: disabledList && disabledList.approverIds,
              })}
            />
          </FormItem>
        </div>
        <div className={styles.batch_record_audit_form_button_wrapper}>
          <Button type="default" onClick={onCancel}>
            取消
          </Button>
          <Button onClick={onSuccess}>确定</Button>
        </div>
      </div>
    );
    // return <FormItem label="审批人">{getFieldDecorator('approverIds')(<Searchselect type="account" />)}</FormItem>;
  }
}

BatchRecordAuditForm.propTypes = {
  form: PropTypes.any,
  batchRecordAuditors: PropTypes.array,
  onCancel: PropTypes.func,
  onSuccess: PropTypes.func,
};

export default BatchRecordAuditForm;
