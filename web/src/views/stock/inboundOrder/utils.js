import { STORAGE } from './constants';

export const getInboundOrderImportLogUrl = () => '/stock/inboundOrder/importLog';

export const getInboundOrderImportLogDetailUrl = id => `/stock/inboundOrder/importLog/detail?id=${id}`;

export const getFormatParams = (value, materialList) => {
  const {
    id,
    inboundOrderCode,
    remark,
    material,
    amountPlanned,
    unitName,
    inboundBatch,
    originPlaceTxt,
    specifications,
    storage,
    supplier,
    supplierBatch,
    validPeriod,
    productionDate,
  } = value;
  const _materialList = materialList
    .filter(n => !n.deleted)
    .map((m, index) => {
      const specificationsArr = specifications[m.seq] && specifications[m.seq].key.split('|');
      const _material = {
        amountPlanned: amountPlanned[m.seq],
        unitName: unitName[m.seq],
        batchNo: supplierBatch[m.seq],
        // city: producePlace[m.seq] && producePlace[m.seq][1],
        // province: producePlace[m.seq] && producePlace[m.seq][0],
        originPlaceTxt: originPlaceTxt[m.seq],
        inboundBatch: inboundBatch[m.seq],
        lineNo: index + 1,
        supplierCode: supplier[m.seq] && supplier[m.seq].key,
        validPeriod: validPeriod[m.seq] && Date.parse(validPeriod[m.seq]),
        productionDate: productionDate[m.seq] && Date.parse(productionDate[m.seq]),
        specification: specificationsArr &&
          specificationsArr.length && {
            denominator: specificationsArr[0],
            numerator: specificationsArr[1],
            unitName: specificationsArr[2],
          },
      };
      if (storage[m.seq]) {
        const value = storage[m.seq][0].split(',')[0];
        const level = storage[m.seq][0].split(',')[2];
        _material[`${STORAGE[level]}Id`] = value;
      }
      if (m.isCreated) {
        _material.id = id[m.seq];
        _material.materialCode = m.material.code;
      } else {
        _material.materialCode = material[m.seq] && material[m.seq].key.split('|')[0];
      }
      return _material;
    });
  return {
    inboundOrderCode,
    remark,
    materialList: _materialList,
  };
};

export default 'dummy';
