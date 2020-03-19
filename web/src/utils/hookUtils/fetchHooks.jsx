/**
 * @description: 公用拉取数据hooks。
 *
 * @date: 2019/6/6 下午5:23
 */
import React, { useState, useEffect } from 'react';
import log from 'src/utils/log';

/**
 * @description: 拉取数据的公用hooks
 *
 * @params: fetchFn 拉取数据的函数。需要是async函数或者promoise
 * @params: initialParams 初始参数
 *
 * 具体使用例子可以参照次品分类中的代码
 *
 * 并不是所有的地方都适合用useFetch。根据具体的情况来判断是否使用useFetch。
 * 比如需要对相同参数多次拉取数据的情况就不合适使用useFetch。如果想绕过这个限制，只需要将params改为object。react
 * 根据Object.is来判断是否相等
 *
 * @date: 2019/6/11 下午3:33
 */
export const useFetch = (
  fetchFn,
  option = {
    initialParams: {}, // 初始参数
  },
) => {
  const { initialParams } = option || {};

  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [params, setParams] = useState(initialParams);

  useEffect(() => {
    // 当前组件是否mounted。
    let mounted = true;

    const fetchData = async () => {
      setIsLoading(true);

      try {
        const res = await fetchFn(params);
        // 如果组件unMount那么设置数据
        if (mounted) {
          setData(res);
        }
      } catch (e) {
        log.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const cleanUp = () => {
      mounted = false;
    };

    return cleanUp;
  }, [params]);

  return [{ data, isLoading }, setParams];
};

export default useFetch;
