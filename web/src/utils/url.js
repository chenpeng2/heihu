import _ from 'lodash';
import { history } from 'src/routes';

export function getParams() {
  const query = location.search.substr(1);
  const result = { queryObj: {} };
  if (query) {
    query.split('&').forEach(part => {
      const item = part.split('=');
      if (item[0] === 'query') {
        try {
          result.queryObj = JSON.parse(decodeURIComponent(item[1]));
        } catch (e) {
          result.queryObj = {};
          console.error('不是标准的JSON对象');
        }
      }
      result[item[0]] = decodeURIComponent(item[1]);
    });
  }
  return result;
}

export function setLocation(props, setParams, options = {}) {
  const { location, history } = props;
  const {
    pathname,
    search,
    query: { query, ...restQuery },
  } = location;
  const restQueryStr =
    restQuery &&
    Object.keys(restQuery)
      .map(key => `&${key}=${restQuery[key]}`)
      .reduce((a, b) => a + b, '');
  let params;
  if (typeof setParams === 'function') {
    const _query = query === undefined ? {} : JSON.parse(query);
    params = setParams(_query);
  } else {
    params = setParams;
  }
  const _params = {};
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== '') {
      _params[key] = params[key];
    } else if (params[key] === 0) {
      _params[key] = params[key];
    }
  });
  if (options && options.type === 'replace') {
    history.replace(`${pathname}?query=${encodeURIComponent(JSON.stringify(_params))}${restQueryStr}`);
  } else {
    history.push(`${pathname}?query=${encodeURIComponent(JSON.stringify(_params))}${restQueryStr}`);
  }

  return _.get(getParams(), 'queryObj');
}

export const QUERY = 'query';
export const FILTER = 'filter';

// 将query, filterParams放入search中。
// 不将filterParams放入state中是为了实现复制url。可以重现状态
const setSearchAndFilterParamsInUrl = (searchParams, filterParams) => {
  const { state, hash, pathname } = location;

  const { queryObj } = getParams();
  const query = queryObj ? queryObj[QUERY] : {};
  const filter = queryObj ? queryObj[FILTER] : {};
  const newSearch = `?${QUERY}=${encodeURIComponent(
    JSON.stringify({ ...query, ...searchParams }),
  )}&${FILTER}=${encodeURIComponent(JSON.stringify({ ...filter, ...filterParams }))}`;

  history.push({
    pathname,
    hash,
    search: newSearch,
    state,
  });
};

// url参数的特殊字符处理
export const formatUrlParams = (params: []) => {
  const _params = params.map(param => {
    return param
      .replace(/\%/g, '%25')
      .replace(/\#/g, '%23')
      .replace(/\+/g, '%2B')
      .replace(/\"/g, '%22')
      .replace(/\'/g, '%27')
      .replace(/\//g, '%2F')
      .replace(' ', '+')
      .replace(/\?/g, '%3F')
      .replace(/\&/g, '%26')
      .replace(/\=/g, '%3D');
  });
  return _params;
};

export default getParams;
