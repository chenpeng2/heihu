import React from 'react';
import { Checkbox, Tooltip } from 'components';
import { replaceSign } from 'src/constants';

const checkboxStyle = { marginRight: 10 };
const inlineDivStyle = { display: 'flex', alignItems: 'center', justifyContent: 'flex-start' };

type CheckBoxWithMaterialProps = {
  checked: Boolean,
  materialCode: String,
  materialName: String,
  maxLength: Number,
};

/**
 * checkBox复选框与material物料的显示组件
 * @param {Boolean} checked 是否选中
 * @param {String} materialCode 物料编号
 * @param {String} materialName 物料名称
 * @param {Number} maxLength 超过多少显示点点点
 */
export default function CheckBoxWithMaterial(props: CheckBoxWithMaterialProps): void {
  const { materialCode, materialName, checked, maxLength, ...restProps } = props || {};
  const text = `${materialCode || replaceSign}/${materialName || replaceSign}`;

  return (
    <div style={inlineDivStyle}>
      <Checkbox checked={checked} style={checkboxStyle} {...restProps} />
      {<Tooltip text={text} length={maxLength || 30} />}
    </div>
  );
}
