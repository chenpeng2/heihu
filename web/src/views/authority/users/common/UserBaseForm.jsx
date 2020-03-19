import * as React from 'react';
import _ from 'lodash';
import { usernameValidator, nameValidator, requiredRule, checkStringLength, telValidator } from 'src/components/form';
import { Input, Button, FormItem, Popover, Radio, Attachment, FormattedMessage, Select } from 'components';
import SearchSelect from 'components/select/searchSelect';
import { getUser, orgInfo } from 'src/services/auth/user';
import { getWorkDepartmentList } from 'services/auth/workDepartment';
import { fontSub } from 'styles/color';
import { LANGUAGE_LIST, findLanguage, findLanguageByHeaderValue } from 'src/utils/locale/utils';

import NoAvailableUser from './noAvailableUser';
import LimitLoginDeviceTable from '../LimitLoginDeviceTable';
import styles from '../index.scss';

const width = 380;
const { Option, OptGroup } = Select;
const RadioGroup = Radio.Group;

type PropsType = {
  form: any,
  router: any,
};

class UserBaseForm extends React.Component<PropsType> {
  state = {
    saveVisible: false,
    popoverContent: null,
    treeData: [],
    quota: null,
    used: null,
    deviceIds: [],
  };

  componentDidMount() {
    orgInfo().then(({ data: { data: { quota, used } } }) => {
      this.setState({ quota, used });
    });
    this.fetchWorkDepartment();
  }

  fetchWorkDepartment = async params => {
    const { type } = this.props;
    const {
      data: { data },
    } = await getWorkDepartmentList(params);
    const groups = _.groupBy(data, 'type');
    let warehouses = _.compact(groups[0]).map(x => ({
      status: _.get(x.warehouse, 'status'),
      value: _.toString(_.get(x, 'id')),
      key: `warehouse-${_.get(x, 'id')}`,
      label: _.get(x.warehouse, 'name'),
    }));
    warehouses = _.filter(warehouses, o => o.status === 1);
    let workshops = _.compact(groups[1]).map(x => ({
      status: _.get(x.workshop, 'status'),
      value: _.toString(_.get(x, 'id')),
      key: `workshop-${_.get(x, 'id')}`,
      label: _.get(x.workshop, 'name'),
    }));
    workshops = _.filter(workshops, o => o.status === 1);
    const treeData = [
      {
        value: 'workshop',
        label: '车间',
        key: 'workshop',
        disabled: true,
        children: workshops,
      },
      {
        value: 'warehouse',
        label: '仓库',
        key: 'warehouse',
        disabled: true,
        children: warehouses,
      },
    ];
    if (type === 'edit') {
      this.setState({ treeData }, () => {
        this.getUserDetail();
      });
    }
    this.setState({
      treeData,
    });
  };

  getUserDetail = async () => {
    const {
      match: { params },
      form,
    } = this.props;
    const {
      data: { data },
    } = await getUser(params.id);
    const { workDepartments, xlanguage } = data;

    // 国际化语言
    const { value } = findLanguageByHeaderValue(xlanguage);

    const groups = _.groupBy(workDepartments, 'type');
    const warehousesName = _.compact(groups[0]).map(x => ({
      label: _.get(x.warehouse, 'name'),
      key: _.toString(_.get(x, 'id')),
    }));
    const workshopsName = _.compact(groups[1]).map(x => ({
      label: _.get(x.workshop, 'name'),
      key: _.toString(_.get(x, 'id')),
    }));
    this.setState({ deviceIds: data.deviceIds });
    form.setFieldsValue({
      ...data,
      xlanguage: value,
      roleIds: data.roles.map(({ name, id }) => ({ key: id, label: name })),
      workgroupIds: data.workgroups.map(({ name, id }) => ({ key: id, label: name })),
      workDepartmentIds: warehousesName.concat(workshopsName),
      attachments: data.attachmentFiles,
    });
  };

  render() {
    const { form, type } = this.props;
    const { saveVisible, popoverContent, quota, used, treeData, dataSource, deviceIds } = this.state;
    const { getFieldDecorator, getFieldValue } = form;
    const isFaker = getFieldValue('fake');
    return (
      <div className={styles.detail}>
        <div className={styles.header}>
          <span style={{ fontSize: 16, marginRight: 20 }}>
            <FormattedMessage defaultMessage={'账号使用'} />: <span className={styles.number}>{used}</span>/{quota}
          </span>
          <FormattedMessage
            defaultMessage={'购买更多帐号请联系，电话：400-921-0816；邮箱：contact@blacklake.cn'}
            style={{ color: fontSub }}
          />
        </div>
        <div>
          <FormItem label="账号">
            {getFieldDecorator('username', {
              rules: [requiredRule('账号'), checkStringLength(20), { validator: usernameValidator('账号') }],
            })(<Input style={{ width }} length={20} trim />)}
          </FormItem>
          <FormItem label="姓名">
            {getFieldDecorator('name', {
              rules: [requiredRule('姓名'), { validator: checkStringLength(20) }, { validator: nameValidator('姓名') }],
            })(<Input style={{ width }} length={20} trim />)}
          </FormItem>
          <FormItem label="手机号">
            {getFieldDecorator('phone', {
              rules: [{ validator: telValidator('手机') }],
            })(<Input style={{ width }} />)}
          </FormItem>
          <FormItem label="邮箱">{getFieldDecorator('email')(<Input style={{ width }} />)}</FormItem>
          {isFaker || (
            <FormItem label="角色">
              {getFieldDecorator('roleIds', {
                rules: [requiredRule('角色')],
              })(<SearchSelect type="role" style={{ width }} mode="multiple" />)}
            </FormItem>
          )}
          <FormItem label="工作部门">
            {getFieldDecorator('workDepartmentIds')(
              <Select
                mode="multiple"
                labelInValue
                optionFilterProp="children"
                style={{ width }}
                placeholder="请选择所属工作部门"
              >
                {treeData.map(({ key, label, value, children }) => {
                  return (
                    <OptGroup label={label} key={key}>
                      {children.map(({ key, label, value }) => {
                        return (
                          <Option value={value} key={key}>
                            {label}
                          </Option>
                        );
                      })}
                    </OptGroup>
                  );
                })}
              </Select>,
            )}
          </FormItem>
          <FormItem label="用户组">
            {getFieldDecorator('workgroupIds')(
              <SearchSelect type="workgroup" mode="multiple" style={{ width }} params={{ active: true }} />,
            )}
          </FormItem>
          <FormItem label="虚拟用户">
            {getFieldDecorator('fake', {
              initialValue: false,
            })(
              <Select
                disabled={type === 'edit'}
                style={{ width }}
                options={[{ label: '是', value: true }, { label: '否', value: false }]}
              />,
            )}
          </FormItem>
          {!isFaker && (
            <React.Fragment>
              <FormItem label="登录设备限制">
                {getFieldDecorator('limitLoginDevice', {
                  initialValue: false,
                  rules: [{ required: true, message: '登录设备限制必填' }],
                })(<RadioGroup options={[{ label: '是', value: true }, { label: '否', value: false }]} />)}
              </FormItem>
              {getFieldValue('limitLoginDevice') && <LimitLoginDeviceTable form={form} deviceIds={deviceIds} />}
              <FormItem label="附件">{getFieldDecorator('attachments')(<Attachment max={3} />)}</FormItem>
            </React.Fragment>
          )}
          {/* <FormItem label={'默认语言'}> */}
          {/* {getFieldDecorator('xlanguage', { */}
          {/* initialValue: LANGUAGE_LIST.chinese.value, */}
          {/* })( */}
          {/* <Select style={{ width }}> */}
          {/* {Object.values(LANGUAGE_LIST).map(i => { */}
          {/* const { value, label } = i; */}
          {/* return <Option value={value}>{label}</Option>; */}
          {/* })} */}
          {/* </Select>, */}
          {/* )} */}
          {/* </FormItem> */}
        </div>
        <FormItem label=" ">
          <div className={styles.footer} style={{ width }}>
            <Button type="default" onClick={() => this.props.history.push('/authority/users/')}>
              取消
            </Button>
            <Popover
              visible={saveVisible}
              trigger="click"
              onVisibleChange={value => {
                if (value === false) {
                  this.setState({ saveVisible: false });
                }
              }}
              content={popoverContent}
            >
              <Button
                onClick={() => {
                  this.props.onSubmit();
                }}
              >
                保存
              </Button>
            </Popover>
          </div>
        </FormItem>
      </div>
    );
  }
}

export default UserBaseForm;
