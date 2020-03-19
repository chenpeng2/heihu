import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Select, Searchselect, Icon, Button, Table } from 'components';
import { error, primary } from 'src/styles/color';
import { arrayIsEmpty } from 'src/utils/array';
import styles from './styles.scss';

const Option = Select.Option;

type Props = {
  form: any,
  checkEntityType: Number,
  value: any,
};

const MaterialSelect = (props: Props) => {
  const {
    form: { getFieldDecorator, getFieldValue, setFieldsValue },
    checkEntityType,
    value,
  } = props;
  const [materialList, setMaterialList] = useState([{ seq: 0 }]);
  const getColumns = () => {
    return [
      {
        title: '',
        key: 'delete',
        width: 25,
        render: (action, record) => {
          const { seq } = record;
          return (
            <div style={{ width: 8 }}>
              <Icon
                type="minus-circle"
                style={{ color: error, cursor: 'pointer' }}
                onClick={() => {
                  const _materialList = [...materialList];
                  _materialList[seq].deleted = true;
                  setMaterialList(_materialList);
                }}
              />
            </div>
          );
        },
      },
      {
        title: '物料名称/物料编码',
        key: 'materials',
        width: 300,
        render: (data, record) => {
          const { seq } = record;
          return (
            <div>
              {getFieldDecorator(`materials[${seq}]`)(
                <Searchselect
                  type={'materialBySearch'}
                  params={{ status: 1 }}
                  style={{ width: 300 }}
                  getKey={({ code, name, unitName, unitId, unitConversions }) => {
                    return `${code}|${name}|${unitId}|${unitName}|${JSON.stringify(unitConversions || [])}`;
                  }}
                  onSelect={value => {
                    const { key } = value;
                    const unit = { key: Number(key.split('|')[2]), label: key.split('|')[3] };
                    const unitConversions = JSON.parse(key.split('|')[4]);
                    let materialUnit = [unit];
                    if (unitConversions && unitConversions.length) {
                      materialUnit = materialUnit.concat(
                        unitConversions.map(n => ({ key: n.slaveUnitId, label: n.slaveUnitName })),
                      );
                    }
                    record.materialUnit = materialUnit;
                    if (checkEntityType === 1) {
                      const qcUnit = getFieldValue('qcUnit') || [];
                      qcUnit[seq] = unit;
                      setFieldsValue({ qcUnit });
                    }
                  }}
                />,
              )}
            </div>
          );
        },
      },
      // 『单体单位』值为『使用物料单位』时显示选择单位
      checkEntityType === 1
        ? {
            title: '单位',
            key: 'qcUnit',
            width: 180,
            render: (data, record) => {
              const { seq, materialUnit = [] } = record;
              return (
                <div label="">
                  {getFieldDecorator(`qcUnit[${seq}]`)(
                    <Select
                      style={{ width: 180, marginLeft: 10 }}
                      disabled={!materialUnit.length}
                      labelInValue
                      placeholder={'请选择'}
                    >
                      {materialUnit.map(n => (
                        <Option value={n.key}>{n.label}</Option>
                      ))}
                    </Select>,
                  )}
                </div>
              );
            },
          }
        : null,
    ];
  };

  const renderAddMaterial = materialList => {
    return (
      <Button
        icon={'plus-circle-o'}
        onClick={async () => {
          const _materialList = materialList.concat([{ seq: materialList.length }]);
          setMaterialList(_materialList);
          const items = document.getElementsByClassName('ant-table-body')[0];
          setTimeout(() => {
            items.scrollTop = items.scrollHeight - parseInt(items.style.maxHeight, 10);
          }, 100);
        }}
        type={'default'}
        style={{ border: 'none', color: primary, padding: 0, height: 18 }}
      >
        添加一行
      </Button>
    );
  };

  useEffect(() => {
    if (value) {
      const { qcConfigMaterials, checkEntityType } = value;
      if (qcConfigMaterials && Array.isArray(qcConfigMaterials) && qcConfigMaterials.length) {
        const materials = qcConfigMaterials.map((n, index) => {
          const { materialCode, materialName, unitName, unitId, unitConversions } = n;
          const materialUnit = [{ label: unitName, key: Number(unitId) }];
          if (unitConversions && Array.isArray(unitConversions) && unitConversions.length) {
            unitConversions.forEach(n => {
              materialUnit.push({ label: n.slaveUnitName, key: Number(n.slaveUnitId) });
            });
          }
          materialList[index] = {
            seq: index,
            materialUnit,
          };
          return {
            label: `${materialCode}/${materialName}`,
            key: `${materialCode}|${materialName}|${unitId}|${unitName}|${JSON.stringify(unitConversions || [])}`,
          };
        });
        materialList.forEach((n, index) => {
          getFieldDecorator(`materials[${index}]`);
        });
        setMaterialList(materialList);
        setFieldsValue({ materials });
        if (checkEntityType === 1) {
          const qcUnit = qcConfigMaterials.map((n, index) => {
            const { qcUnitId, qcUnitName } = n;
            getFieldDecorator(`qcUnit[${index}]`);
            return { label: qcUnitName, key: Number(qcUnitId) };
          });
          setFieldsValue({ qcUnit: _.cloneDeep(qcUnit) });
        }
      }
    }
  }, [value]);

  useEffect(() => {
    if (typeof checkEntityType === 'number') {
      if (!arrayIsEmpty(materialList) && checkEntityType !== 1) {
        const materialUnits = materialList.map((n, index) => {
          getFieldDecorator(`qcUnit[${index}]`);
          return n.materialUnit && n.materialUnit[0];
        });
        setFieldsValue({ qcUnit: materialUnits });
      }
    }
  }, [checkEntityType]);

  const columns = _.compact(getColumns());

  return (
    <div className={styles.materialList}>
      <Table
        dataSource={materialList.filter(n => !n.deleted)}
        pagination={false}
        scroll={{ y: 260 }}
        columns={columns}
        footer={() => renderAddMaterial(materialList)}
      />
    </div>
  );
};

export default MaterialSelect;
