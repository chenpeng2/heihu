import * as React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';
import SearchSelect from 'src/components/select/searchSelect';
import { withForm, FormItem, Input, Select, Textarea, Link, OpenModal, AntTextarea } from 'components';
import { checkTwoSidesTrim, checkStringLength, QcItemsValidator, nullCharacterVerification } from 'components/form';
import { queryQcItemsGroupList } from 'src/services/knowledgeBase/qcItems';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { isQcItemCodingManually } from 'utils/organizationConfig';
import { fontSub } from 'src/styles/color';
import { QcItemsGroupForm } from '../../qcItemsGroup';
import styles from './styles.scss';

const Option = Select.Option;

type Props = {
  router: any,
  form: any,
  params: {},
  formData: {},
  submit: () => {},
  title: String,
};

class QcItemBase extends React.Component {
  props: Props;
  state = {
    groupList: [],
  };

  componentDidMount = () => {};

  fetchQcItemsGroup = async params => {
    await queryQcItemsGroupList(params)
      .then(({ data: { data } }) => {
        this.setState({
          groupList: data,
        });
      })
      .catch(e => console.log(e));
  };

  render() {
    const { form, formData, title } = this.props;
    const { getFieldDecorator, setFieldsValue } = form;
    const createQcItemsGroup = (
      <Option value="create" key="add" disabled>
        <Link
          icon="plus-circle-o"
          onClick={() => {
            this.setState({ createModal: true }, () => {
              OpenModal(
                {
                  title: '创建质检项分类',
                  footer: null,
                  children: (
                    <QcItemsGroupForm
                      onSuccess={data => {
                        if (data) {
                          setFieldsValue({
                            group: { key: data.id, label: data.name },
                          });
                        }
                      }}
                    />
                  ),
                },
                this.context,
              );
            });
          }}
          style={{ width: '100%' }}
        >
          添加新分类
        </Link>
      </Option>
    );

    return (
      <div className={styles.qcItemBase}>
        <div className={styles.baseHeaders}>{changeChineseToLocaleWithoutIntl(title)}</div>
        {isQcItemCodingManually() ? (
          <FormItem label="编号">
            {getFieldDecorator('code', {
              initialValue: formData && formData.code,
              rules: [
                { required: true, message: changeChineseToLocaleWithoutIntl('请输入质检项编号') },
                { validator: checkStringLength(10) },
                { validator: nullCharacterVerification(changeChineseToLocaleWithoutIntl('编号')) },
              ],
            })(
              <Input
                style={{ width: 300 }}
                disabled={window.location.href.indexOf('edit') !== -1 && !isQcItemCodingManually()}
              />,
            )}
          </FormItem>
        ) : null}
        <FormItem label="名称">
          {getFieldDecorator('name', {
            rules: [
              { required: true, message: changeChineseToLocaleWithoutIntl('请输入质检项名称') },
              { validator: checkStringLength(100) },
              { validator: checkTwoSidesTrim(changeChineseToLocaleWithoutIntl('质检项名称')) },
              { validator: QcItemsValidator(changeChineseToLocaleWithoutIntl('质检项名称')) },
            ],
            initialValue: formData && formData.name,
          })(
            <AntTextarea
              autosize={{ maxRows: 3 }}
              style={{ width: 360, height: 28, resize: 'none', marginBottom: 5 }}
              placeholder="请输入"
            />,
          )}
        </FormItem>
        <FormItem label="分类">
          {getFieldDecorator('group', {
            rules: [
              { required: true, message: changeChineseToLocaleWithoutIntl('请选择质检项分类') },
              { validator: checkStringLength(10) },
            ],
            initialValue: _.get(formData, 'group', undefined)
              ? { key: _.get(formData, 'group.id', undefined), label: _.get(formData, 'group.name', undefined) }
              : undefined,
          })(
            <SearchSelect
              createButton={createQcItemsGroup}
              type="qcItemsGroup"
              placeholder="请选择质检项分类"
              style={{ width: 360 }}
            />,
          )}
        </FormItem>
        <FormItem label={'备注'}>
          {getFieldDecorator('desc', {
            initialValue: formData && formData.desc,
          })(<Textarea style={{ width: 360, height: 100 }} placeholder="请输入备注" maxLength={500} />)}
          <p style={{ color: fontSub, lineHeight: '14px', paddingTop: 10, paddingBottom: 16 }}>
            {changeChineseToLocaleWithoutIntl('备注会显示在执行质检任务页面')}
          </p>
        </FormItem>
      </div>
    );
  }
}

QcItemBase.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(withForm({}, QcItemBase));
