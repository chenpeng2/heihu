/**
 * @description: 普通打印机模版选择model
 *
 * @date: 2019/7/4 上午10:32
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'antd';

import { Select, Button, print, FormattedMessage } from 'src/components';
import { greyWhite, primary } from 'src/styles/color';
import { addLabelPrintCount } from 'src/services/barCodeLabel';
import { arrayIsEmpty } from 'src/utils/array';

import { PRINT_TEMPLATE_TYPE, findPrintTemplate } from '../../constant';
import BarQrCode from './barQrCode';
import TagQrCode from './tagQrCode';

const Option = Select.Option;
const FAKE_VALUE = 'XXXXXXXXXXXXXXX';
const TagQrcodeInfo = {
  projectCode: FAKE_VALUE,
  productCode: FAKE_VALUE,
  productName: FAKE_VALUE,
  productAmount: FAKE_VALUE,
  productBatchSeq: FAKE_VALUE,
};
const buttonStyle = { width: 114, height: 32, marginLeft: 10 };

const PrintQrCodes = (props: { labels: [], qrCodeType: any, oneCodeOnePage: boolean }) => {
  const { labels, qrCodeType, oneCodeOnePage } = props;

  return (
    <div>
      {Array.isArray(labels) && labels.length
        ? labels.map(i => {
            const { labelSeq, projectCode, productAmount, productBatchSeq, productInfo } = i || {};
            const { code: productCode, name: productName } = productInfo || {};

            if (!labelSeq) return null;

            return (
              <div
                style={{
                  pageBreakAfter: oneCodeOnePage ? 'always' : 'auto',
                  display: oneCodeOnePage ? 'block' : 'inline-block',
                }}
              >
                {qrCodeType === PRINT_TEMPLATE_TYPE.tag.value ? (
                  <TagQrCode
                    value={labelSeq}
                    info={{ productCode, projectCode, productAmount, productBatchSeq, productName }}
                  />
                ) : null}
                {qrCodeType === PRINT_TEMPLATE_TYPE.bar.value ? <BarQrCode value={labelSeq} /> : null}
              </div>
            );
          })
        : null}
    </div>
  );
};

const NormalPrintModel = (props: { printAmount: number, onClose: () => {}, labels: [], cbForPrint: () => {} }, context) => {
  const { printAmount, onClose, cbForPrint, labels } = props;
  const [labelType, setLabelType] = useState(PRINT_TEMPLATE_TYPE.tag.value);
  const [isOneCodeOnePage, setIsOneCodeOnePage] = useState(false);

  const labelIds = arrayIsEmpty(labels) ? [] : labels.map(i => i.labelId);
  const _cbForPrint = () => {
    addLabelPrintCount({ barcodeLabelIds: labelIds, printTemplateType: labelType }).then(() => {
      if (typeof cbForPrint === 'function') cbForPrint();
      if (typeof onClose === 'function') onClose();
    });
  };

  const { changeChineseToLocale } = context;

  return (
    <div style={{ margin: 20 }}>
      <div style={{ background: greyWhite, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <FormattedMessage defaultMessage={'选择标签模版'} />
          <Select
            value={labelType}
            style={{ width: 160, marginLeft: 10 }}
            onChange={v => {
              const { alias: name, value } = findPrintTemplate(v) || {};
              setLabelType(v);
            }}
          >
            {Object.values(PRINT_TEMPLATE_TYPE).map(i => {
              const { value, name } = i || {};

              return (
                <Option key={value} value={value}>
                  {changeChineseToLocale(name)}
                </Option>
              );
            })}
          </Select>
        </div>

        <div style={{ margin: 20 }}>
          <div style={{ display: 'inline-block' }}>
            <FormattedMessage style={{ marginRight: 10 }} defaultMessage={'每页打印一个二维码'} />
            <Switch
              value={isOneCodeOnePage}
              onChange={v => {
                setIsOneCodeOnePage(v);
              }}
            />
          </div>
          <div style={{ float: 'right', display: 'inline-block' }}>{`${changeChineseToLocale('单位')} ：mm`}</div>
        </div>
        <div>
          {labelType === PRINT_TEMPLATE_TYPE.bar.value ? <BarQrCode value={FAKE_VALUE} /> : null}
          {labelType === PRINT_TEMPLATE_TYPE.tag.value ? <TagQrCode length={500} value={FAKE_VALUE} info={TagQrcodeInfo} /> : null}
        </div>
      </div>
      <FormattedMessage defaultMessage={'本次打印数量：{amount}个'} values={{ amount: <span style={{ color: primary }}>{printAmount}</span> }} />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Button
          type="default"
          style={buttonStyle}
          onClick={() => {
            if (typeof onClose === 'function') onClose();
          }}
        >
          取消
        </Button>
        <Button
          type="primary"
          style={buttonStyle}
          onClick={() => {
            print({
              component: <PrintQrCodes labels={labels} oneCodeOnePage={isOneCodeOnePage} qrCodeType={labelType} />,
              cbForPrint: _cbForPrint,
            });
          }}
        >
          打印
        </Button>
      </div>
    </div>
  );
};

NormalPrintModel.propTypes = {
  style: PropTypes.any,
};

NormalPrintModel.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default NormalPrintModel;
