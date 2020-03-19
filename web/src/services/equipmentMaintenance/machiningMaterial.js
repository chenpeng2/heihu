import request from 'src/utils/request';

const baseUrl = 'equipment/v1';

// han TODO：把其他的machiningMaterial相关接口挪进来

export function enableStrategy(code, params) {
  return request.post(`${baseUrl}/machining_material/task/strategy/_enable?code=${code}`, params);
}

export function disableStrategy(code, params) {
  return request.post(`${baseUrl}/machining_material/task/strategy/_disable?code=${code}`, params);
}
