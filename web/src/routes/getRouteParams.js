import _ from 'lodash';
import { history } from 'src/routes';

const getPathname = match => {
  if (!match) {
    global.log.error('getPathname函数需要match参数');
  }
  const pathname = match && match.path;
  return pathname || null;
};

const getQuery = match => {
  if (!match) {
    global.log.error('getQuery函数需要match参数');
  }
  const query = match && match.location && match.location.query;
  const queryAfterJsonStringify = query && query.query ? JSON.parse(query.query) : null;
  return queryAfterJsonStringify || query || {};
};

const getState = match => {
  if (!match) {
    global.log.error('getState函数需要match参数');
  }
  return match && match.location && match.location.state;
};

const getLocation = match => {
  if (!match) {
    return null;
  }
  const state = getState(match) || {};
  const query = getQuery(match) || {};
  const pathname = getPathname(match) || '';

  return {
    state,
    query,
    pathname,
  };
};

export const QUERY = 'query';
export const FILTER = 'filter';

const getSearchInLocation = () => {
  const search = location.search.substr(1);
  const result = { [QUERY]: {}, [FILTER]: {} };
  if (search) {
    search.split('&').forEach(part => {
      const item = part.split('=');
      if (item[0] === QUERY) {
        try {
          result[QUERY] = JSON.parse(decodeURIComponent(item[1]));
        } catch (e) {
          result[QUERY] = {};
          console.error('不是标准的JSON对象');
        }
      }
      if (item[0] === FILTER) {
        try {
          result[FILTER] = JSON.parse(decodeURIComponent(item[1]));
        } catch (e) {
          result[FILTER] = {};
          console.error('不是标准的JSON对象');
        }
      }
    });
  }
  return result;
};

// 将query, filterParams放入search中。
// 不将filterParams放入state中是为了实现复制url。可以重现状态
const setSearchAndFilterParamsInUrl = (searchParams, filterParams) => {
  const { state, hash, pathname } = location;

  const lastSearch = getSearchInLocation();
  const query = lastSearch ? lastSearch[QUERY] : {};
  const filter = lastSearch ? lastSearch[FILTER] : {};
  const newSearch = `?${QUERY}=${encodeURIComponent(JSON.stringify({ ...query, ...searchParams }))}&${FILTER}=${encodeURIComponent(JSON.stringify({ ...filter, ...filterParams }))}`;

  history.push({
    pathname,
    hash,
    search: newSearch,
    state,
  });
};

export { getPathname, getQuery, getState, getLocation, getSearchInLocation, setSearchAndFilterParamsInUrl };
