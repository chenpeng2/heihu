import React, { Fragment, Component } from 'react';
import _ from 'lodash';
import { withForm, FormItem, Checkbox, Select } from 'src/components';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { QCLOGIC_TYPE, LOGIC, TOLERANCE } from 'src/views/qualityManagement/constants';
import CheckItemStandardFormItem from '../baseFormItem/checkItemStandardFormItem';
import DefectReasonFormItem from '../baseFormItem/defectReasonFormItem';
import AqlFormItem from '../baseFormItem/aqlFormItem';
import SamplingFormItem from '../baseFormItem/samplingFormItem';
import styles from './styles.scss';

const Option = Select.Option;
const checkBoxStyle = { marginRight: 10 };

type Props = {
  form: any,
  title: String,
  showAql: Boolean,
  showSampling: Boolean,
  onSubmit: () => {},
};

class FormContent extends Component {
  props: Props;

  state = {
    standardBulk: false,
    qcAqlBulk: false,
    samplingBulk: false,
  };

  componentDidMount = () => {
    const { title } = this.props;
    this.setState({
      standardBulk: title === '标准',
      qcAqlBulk: title === '检验水平与接收质量限',
      samplingBulk: title === '抽检类型与数值',
    });
  };

  submit = async value => {
    const { onSubmit } = this.props;
    onSubmit(value);
  };

  forceValidateAllNames = itemName => {
    const { form } = this.props;
    let fields;
    switch (itemName) {
      case 'standard':
        fields = [
          'qcCheckItemConfigs.logic',
          'qcCheckItemConfigs.base',
          'qcCheckItemConfigs.deltaPlus',
          'qcCheckItemConfigs.deltaMinus',
          'qcCheckItemConfigs.unitId',
          'qcCheckItemConfigs.min',
          'qcCheckItemConfigs.max',
        ];
        break;
      case 'sampling':
        fields = [
          'qcCheckItemConfigs.checkCountType',
          'qcCheckItemConfigs.checkNums',
          'qcCheckItemConfigs.qcAqlInspectionLevelId',
          'qcCheckItemConfigs.qcAqlId',
        ];
        break;
      case 'aql':
        fields = ['qcCheckItemConfigs.qcAqlInspectionLevelId', 'qcCheckItemConfigs.qcAqlId'];
        break;
      default:
        fields = [];
    }
    form.validateFields(fields, { force: true });
  };

  renderAqlFormItem = ({ showLabel, showCheckBox }) => {
    const { form, title } = this.props;
    const { qcAqlBulk } = this.state;
    const { getFieldDecorator } = form;
    return (
      <Fragment>
        <div className={styles.formItemWrapper}>
          {showCheckBox
            ? getFieldDecorator('qcAqlBulk', {
                valuePropName: 'checked',
                initialValue: title === '检验水平与接收质量限',
              })(
                <Checkbox
                  style={checkBoxStyle}
                  onChange={e => {
                    const checked = e.target.checked;
                    this.setState({ qcAqlBulk: checked }, () => {
                      this.forceValidateAllNames('aql');
                    });
                  }}
                />,
              )
            : null}
          <AqlFormItem form={form} field={''} showLabel={showLabel} qcAqlBulk={qcAqlBulk} />
        </div>
      </Fragment>
    );
  };

  render() {
    const { form, title, showAql, showSampling } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    const checkCountType = getFieldValue('qcCheckItemConfigs.checkCountType');
    const logic = getFieldValue('qcCheckItemConfigs.logic');
    const { samplingBulk, standardBulk } = this.state;

    return (
      <div className={styles.formWrapper}>
        {showSampling ? (
          <div className={styles.formItemWrapper}>
            {getFieldDecorator('samplingBulk', {
              valuePropName: 'checked',
              initialValue: title === '抽检类型与数值',
            })(
              <Checkbox
                style={checkBoxStyle}
                onChange={e => {
                  const checked = e.target.checked;
                  this.setState({ samplingBulk: checked }, () => {
                    this.forceValidateAllNames('sampling');
                  });
                }}
              />,
            )}
            <SamplingFormItem
              form={form}
              field={''}
              showLabel
              samplingBulk={samplingBulk}
              checkCountType={checkCountType}
              aqlColumns={this.renderAqlFormItem({ showLabel: false, showCheckBox: false })}
            />
          </div>
        ) : null}
        {showAql ? this.renderAqlFormItem({ showLabel: true, showCheckBox: true }) : null}
        <div className={styles.formItemWrapper}>
          {getFieldDecorator('standardBulk', {
            valuePropName: 'checked',
            initialValue: title === '标准',
          })(
            <Checkbox
              onChange={e => {
                const checked = e.target.checked;
                this.setState({ standardBulk: checked }, () => {
                  this.forceValidateAllNames('standard');
                });
              }}
              style={checkBoxStyle}
            />,
          )}
          <div style={{ display: logic === TOLERANCE ? 'block' : 'flex' }}>
            <FormItem label="标准" style={logic === TOLERANCE ? { marginLeft: -251 } : {}}>
              {getFieldDecorator('qcCheckItemConfigs.logic', {
                rules: [{ required: standardBulk, message: changeChineseToLocaleWithoutIntl('逻辑判断必填') }],
                onChange: value => {
                  // 改变逻辑判断时 重置之前填过的所有逻辑判断数据
                  let qcCheckItemConfigs = getFieldValue('qcCheckItemConfigs');
                  qcCheckItemConfigs = {
                    base: undefined,
                    deltaPlus: undefined,
                    deltaMinus: undefined,
                    unitId: undefined,
                    min: undefined,
                    max: undefined,
                  };
                  setFieldsValue({ qcCheckItemConfigs });
                  if (value === LOGIC.MANUAL) {
                    const qcCheckItemConfigs = getFieldValue('qcCheckItemConfigs');
                    qcCheckItemConfigs.qcDefectConfigs = undefined;
                    setFieldsValue({ qcCheckItemConfigs, defectReasonBulk: false });
                  }
                },
              })(
                <Select style={{ width: 140, marginRight: 20 }}>
                  {_.map(QCLOGIC_TYPE, ({ display }, value) => (
                    <Option key={value} value={Number(value)}>
                      {changeChineseToLocaleWithoutIntl(display)}
                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem>
            <FormItem label={logic === TOLERANCE ? ' ' : ''}>
              <CheckItemStandardFormItem form={form} field={''} standardBulk={standardBulk} logic={logic} />
            </FormItem>
          </div>
        </div>
        <div className={styles.formItemWrapper}>
          {getFieldDecorator('defectReasonBulk', {
            valuePropName: 'checked',
            initialValue: title === '不良原因细分',
          })(<Checkbox disabled={getFieldValue('qcCheckItemConfigs').logic === LOGIC.MANUAL} style={checkBoxStyle} />)}
          <DefectReasonFormItem form={form} field={''} logic={logic} showLabel />
        </div>
      </div>
    );
  }
}

export default withForm({ showFooter: true }, FormContent);
