import * as React from 'react';
import _ from 'lodash';
import { amountValidator } from 'src/components/form';
import { closeModal } from 'components/modal';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import {
  Select,
  Input,
  withForm,
  Table,
  Link,
  Button,
  Icon,
  Searchselect,
  FormItem,
  message,
  Tooltip,
} from 'components';
import { arrayIsEmpty } from 'src/utils/array';
import { primary, error } from 'src/styles/color';
import { replaceSign } from 'src/constants';

type propsType = {
  form: any,
  intl: any,
  status: any,
  outputMaterials: any,
  onChange: () => {},
  onSubmitModuleOut: () => {},
};
const buttonStyle = { width: 114, height: 32, marginRight: 40 };

class ModuleOutConfig extends React.Component<propsType> {
  props: propsType;

  state = {
    config: [
      {
        materialGroup: [{}],
        isSaved: false,
      },
    ],
    deleteIndex: [],
  };

  componentWillMount() {
    const { outputMaterials } = this.props;
    if (outputMaterials) {
      this.setState({ config: outputMaterials });
    }
  }

  getColumns = () => {
    const { form, intl } = this.props;
    const { deleteIndex } = this.state;
    const { getFieldDecorator, setFieldsValue, validateFields, getFieldValue } = form;
    return [
      {
        title: '产出物料组编号/名称',
        width: 170,
        dataIndex: 'materialGroup',
        render: (materialGroup, record, i) => {
          const { isSaved } = record;
          const { config } = this.state;
          return (
            <div>
              {!isSaved ? (
                <div>
                  {materialGroup.map((n, index) => {
                    const { outputMaterialCode, outputMaterialName, unitName } = materialGroup[index] || {};
                    return (
                      <div className={`material${i}_${index}`} style={{ display: 'flex' }}>
                        {index !== 0 ? (
                          <Icon
                            type={'minus-circle'}
                            style={{ color: error, cursor: 'pointer', lineHeight: '40px' }}
                            onClick={() => {
                              const rows = document.getElementsByClassName(`material${i}_${index}`);
                              for (let i = 0; i < rows.length; i++) {
                                rows[i].style.display = 'none';
                              }
                              if (deleteIndex[i]) {
                                deleteIndex[i].push(index);
                              } else {
                                deleteIndex[i] = [index];
                              }
                              let fields = [];
                              materialGroup.forEach((_, index) => {
                                if (!deleteIndex[i] || !deleteIndex[i].includes(index)) {
                                  fields = fields.concat([`outputMaterial_${i}[${index}]`]);
                                }
                              });
                              validateFields(fields, { force: true });
                              this.setState({ deleteIndex });
                            }}
                          />
                        ) : null}
                        <FormItem style={{ width: 160, marginLeft: index === 0 && materialGroup.length > 1 ? 35 : 23 }}>
                          {getFieldDecorator(`outputMaterial_${i}[${index}]`, {
                            initialValue: outputMaterialCode
                              ? {
                                  key: `${unitName}/${outputMaterialCode}`,
                                  label: `${outputMaterialCode}/${outputMaterialName}`,
                                }
                              : [],
                            rules: [
                              { required: true, message: changeChineseToLocale('请选择产出物料', intl) },
                              {
                                validator: (rule, value, callback) => {
                                  const materials = getFieldValue(`outputMaterial_${i}`);
                                  const { deleteIndex } = this.state;
                                  if (value) {
                                    const materialsLable = [];
                                    materials.forEach((n, index) => {
                                      if (!(deleteIndex[i] && deleteIndex[i].includes(index))) {
                                        materialsLable.push((n && n.label) || '');
                                      }
                                    });
                                    if (materialsLable.filter(n => n === value.label).length > 1) {
                                      callback(changeChineseToLocale('同一物料组内不能有相同物料', intl));
                                      return null;
                                    }
                                  }
                                  callback();
                                },
                              },
                            ],
                          })(
                            <Searchselect
                              getKey={value => `${value.unitName}/${value.code}`}
                              onSelect={value => {
                                const unitName = value.key.split('/')[0];
                                setFieldsValue({ [`unitName_${i}-${index}`]: unitName });
                              }}
                              type={'materialBySearch'}
                              allowClear={false}
                              placeholder={'请选择产出物料'}
                              style={{ width: 160, height: 32, marginRight: 10, marginTop: 4 }}
                            />,
                          )}
                        </FormItem>
                      </div>
                    );
                  })}
                  <Link
                    style={{ color: primary, cursor: 'pointer' }}
                    onClick={() => {
                      materialGroup.push({});
                      this.setState({ config });
                    }}
                    icon={'plus-circle-o'}
                  >
                    增加物料
                  </Link>
                </div>
              ) : (
                <div>
                  {materialGroup.map(n => (
                    <Tooltip
                      containerStyle={{ height: 18, display: 'block' }}
                      text={`${n.outputMaterialCode}/${n.outputMaterialName}`}
                      width={160}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        },
      },
      {
        title: '数量',
        width: 110,
        dataIndex: 'materialGroup',
        key: 'amount',
        render: (materialGroup, record, i) => {
          const { isSaved } = record;
          return (
            <div>
              {!isSaved ? (
                <div>
                  {materialGroup.map((n, index) => {
                    const { outputAmount } = materialGroup[index] || {};
                    return (
                      <div className={`material${i}_${index}`}>
                        <FormItem style={{ width: 100, marginLeft: 10 }}>
                          {getFieldDecorator(`outputAmount_${i}[${index}]`, {
                            initialValue: outputAmount,
                            rules: [
                              { required: true, message: changeChineseToLocale('请输入产出数量', intl) },
                              {
                                validator: amountValidator(null, {
                                  value: '0',
                                  equal: false,
                                  message: '数字必须大于0',
                                }),
                              },
                            ],
                          })(<Input placeholder={'产出数量'} style={{ width: 100, height: 32, marginRight: 10 }} />)}
                        </FormItem>
                      </div>
                    );
                  })}
                  <div style={{ height: 18 }} />
                </div>
              ) : (
                <div>
                  {materialGroup.map(n => (
                    <Tooltip containerStyle={{ display: 'block' }} text={n.outputAmount} width={100} />
                  ))}
                </div>
              )}
            </div>
          );
        },
      },
      {
        title: '单位',
        width: 110,
        dataIndex: 'materialGroup',
        key: 'unit',
        render: (materialGroup, record, i) => {
          const { isSaved } = record;
          return (
            <div>
              {!isSaved ? (
                <div>
                  {materialGroup.map((n, index) => {
                    const { unitName } = materialGroup[index] || {};
                    return (
                      <div className={`material${i}_${index}`}>
                        <FormItem style={{ width: 100, marginLeft: 5 }}>
                          {getFieldDecorator(`unitName_${i}-${index}`, { initialValue: unitName || replaceSign })(
                            <Input disabled style={{ width: 100, height: 32 }} />,
                          )}
                        </FormItem>
                      </div>
                    );
                  })}
                  <div style={{ height: 18 }} />
                </div>
              ) : (
                <div>
                  {materialGroup.map(n => (
                    <Tooltip containerStyle={{ display: 'block' }} text={n.unitName} width={100} />
                  ))}
                </div>
              )}
            </div>
          );
        },
      },
      {
        title: '操作',
        width: 120,
        dataIndex: 'isSaved',
        render: (isSaved, record, index) => {
          const { config } = this.state;
          return (
            <div style={{ height: !isSaved ? 50 : 'unset' }}>
              {!isSaved ? (
                <Link
                  onClick={() => {
                    let fields = [];
                    config[index].materialGroup.forEach((_, i) => {
                      if (!deleteIndex[index] || !deleteIndex[index].includes(i)) {
                        fields = fields.concat([`outputMaterial_${index}[${i}]`, `outputAmount_${index}[${i}]`]);
                      }
                    });
                    validateFields(fields, (error, value) => {
                      if (error) {
                        return null;
                      }
                      const outputAmount = value[`outputAmount_${index}`];
                      const outputMaterial = value[`outputMaterial_${index}`];
                      const formatValue = outputMaterial.map((n, index) => ({
                        outputMaterialCode: n.label.split('/')[0],
                        outputMaterialName: n.label.split('/')[1],
                        unitName: n.key.split('/')[0],
                        outputAmount: Number(outputAmount[index]),
                      }));
                      deleteIndex[index] = [];
                      config[index].materialGroup = formatValue;
                      config[index].isSaved = true;
                      this.setState({ config, deleteIndex });
                    });
                  }}
                >
                  保存
                </Link>
              ) : (
                <Link
                  disabled={config[index].isInitialMaterial}
                  onClick={() => {
                    config[index].isSaved = false;
                    this.setState({ config });
                  }}
                >
                  编辑
                </Link>
              )}
              {!arrayIsEmpty(config) && config.length > 1 ? (
                <Link
                  style={{ marginLeft: 10 }}
                  disabled={config[index].isInitialMaterial}
                  onClick={() => {
                    config.splice(index, 1);
                    this.setState({ config });
                  }}
                >
                  删除
                </Link>
              ) : null}
            </div>
          );
        },
      },
    ];
  };

  renderButton = () => {
    const { onSubmitModuleOut, form } = this.props;
    const { validateFieldsAndScroll } = form;
    const { config } = this.state;
    return (
      <div style={{ margin: '30px 0 10px 30%' }}>
        <Button
          type="default"
          style={buttonStyle}
          onClick={() => {
            closeModal();
          }}
        >
          取消
        </Button>
        <Button
          type="primary"
          style={buttonStyle}
          onClick={() => {
            validateFieldsAndScroll(err => {
              if (err) {
                return null;
              }
              if (config.filter(n => !n.isSaved).length) {
                message.error('有未保存的物料组');
              } else {
                message.success('保存成功');
                onSubmitModuleOut(_.compact(config));
                closeModal();
              }
            });
          }}
        >
          保存
        </Button>
      </div>
    );
  };

  renderDotLineButton = () => {
    return (
      <Button
        icon={'plus-circle-o'}
        style={{ color: primary, width: '640px', margin: '10px 20px 0', padding: '5px 0' }}
        type="dashed"
        onClick={() => {
          const { config } = this.state;
          config.push({ materialGroup: [{}], isSaved: false });
          this.setState({ config });
        }}
      >
        增加产出物料组
      </Button>
    );
  };

  render() {
    const { config } = this.state;
    const columns = this.getColumns();
    return (
      <div>
        <Table columns={columns} dataSource={Array.isArray(config) ? config : []} pagination={false} />
        {this.renderDotLineButton()}
        {this.renderButton()}
      </div>
    );
  }
}

export default withForm({}, injectIntl(ModuleOutConfig));
