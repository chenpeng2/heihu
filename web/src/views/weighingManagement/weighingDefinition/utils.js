import _ from 'lodash';
import { arrayIsEmpty } from 'utils/array';

export const SEPARATOR = '@';
export const getUniqueEbomMaterialCode = (code, seq) => `${code}${SEPARATOR}${seq}`;
export const getMaterialCodeFromUniqueString = materialCode => {
  if (materialCode) {
    return materialCode.split(SEPARATOR)[0];
  }
  return null;
};

export const formatValues = values => {
  const { weighingObjects, productCode, ...rest } = values;

  values.productCode = _.get(productCode, 'key');

  if (!arrayIsEmpty(weighingObjects)) {
    const _weighingObjects = weighingObjects.filter(x => x);
    if (_weighingObjects && _weighingObjects.length > 0) {
      values.weighingObjects = _weighingObjects.map((x, index) => {
        const materialCode = _.get(x, 'materialCode', '');
        x.materialCode = getMaterialCodeFromUniqueString(materialCode);
        return x;
      });
    }
  }

  return values;
};

export default 'dummy';
