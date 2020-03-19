import _ from 'lodash';
import { convertVariableType, getVariableType } from 'utils/variableType';
import LocalStorage from 'utils/localStorage';
import * as constants from 'constants';
import { getQuery } from 'src/routes/getRouteParams';

export const isConnectionEmpty = connection => !(connection && connection.edges && connection.edges.length);

export const isConnectionLegal = connection => {
  return connection && connection.edges;
};

export const getNodesFromConnection = connection => {
  if (isConnectionLegal(connection)) {
    return _.cloneDeep(connection).edges.map(({ node }) => node);
  }
  global.log.error('getNodesFromConnection的参数不是relay connection');
  return [];
};

export const genAuthHeaders = () => {
  const token = LocalStorage.get(constants.FIELDS.TOKEN_NAME);
  if ((token && token !== 'expired') || document.location.pathname === '/login') {
    return {
      'X-AUTH': LocalStorage.get(constants.FIELDS.TOKEN_NAME),
      'X-SERVICE': 'gc-graphql',
      'X-CLIENT-VERSION': constants.VERSION,
      'X-CLIENT': 'web',
    };
  }
  console.log('No token found');
  return null;
};

// TODO:bai getDefaultPrepareParams迁移
// getDefaultPrepareParams迁移到routes中
export const getDefaultPrepareParams = variableNeedToConvert => {
  return (params, { match }) => {
    const query = getQuery(match);
    const defaultVariableNeedToConvert = {
      first: 'number',
      from: 'number',
    };
    const _variableNeedToConvert = Object.assign({}, defaultVariableNeedToConvert, variableNeedToConvert);
    // 把url原有全部为字符串的类型转换成相应的类型
    Object.entries(_variableNeedToConvert).forEach(([variable, targetType]) => {
      // if (query[variable]) {}
      // 不做这个判断是因为在url中如果没有这个参数relay会获得null而不会使用默认值, 如果需要默认值不为null需要在getDefaulPrepareParams中改写
      // 当targetType是function的时候，需要在里面处理默认值的情况
      if (getVariableType(targetType) === 'function') {
        query[variable] = targetType(query[variable]);
      }
      if (query[variable] && getVariableType(targetType) !== 'function') {
        query[variable] = convertVariableType(query[variable], targetType);
      }
    });
    const endParams = Object.assign({}, params, query);
    if (!endParams.first) {
      endParams.first = 10;
    }
    if (!endParams.from) {
      endParams.from = 0;
    }
    return endParams;
  };
};

export default 'dummy';
