/**
 *  @see https://vueuse.org/useAxios
 * usage:
 * 1、{ data } = useRequest(url,params)
 * 2、data = await excute(url,params)
 */

import axios, { AxiosError } from "axios";
import { ref, shallowRef, watch, unref } from "vue";
export function useRequest(...args) {
  const url = typeof args[0] === "string" ? args[0] : undefined;
  let instance = axios;
  let defaultConfig = {};
  let argsPlaceholder = typeof url === "string" ? 1 : 0;
  let options = { immediate: !!argsPlaceholder, shallow: true };
  const isAxiosInstance = val => !!val?.request;

  // 判断第二个或者第三个参数是否是instance
  if (args.length > 0 + argsPlaceholder) {
    if (isAxiosInstance(args[0 + argsPlaceholder])) {
      instance = args[0 + argsPlaceholder];
    } else {
      defaultConfig = args[0 + argsPlaceholder];
    }
  }
  if (args.length > 1 + argsPlaceholder) {
    if (isAxiosInstance(args[1 + argsPlaceholder]))
      instance = args[1 + argsPlaceholder];
  }

  // 最后一个实例不做参数
  if (
    (args.length === 2 + argsPlaceholder &&
      !isAxiosInstance(args[1 + argsPlaceholder])) ||
    args.length === 3 + argsPlaceholder
  ) {
    options = args[args.length - 1];
  }

  const response = shallowRef();
  const data = options.shallow ? shallowRef() : ref();
  const isFinished = ref(false);
  const isLoading = ref(false);
  const isAborted = ref(false);
  const error = shallowRef();

  // 参见https://www.axios-http.cn/docs/cancellation
  const cancelToken = axios.CancelToken.source();
  const abort = message => {
    if (isFinished.value || isLoading.value) {
      return;
    }
    cancelToken.cancel(message);
    isAborted.value = true;
    isLoading.value = true;
    isFinished.value = false;
  };

  const loading = loading => {
    isLoading.value = loading;
    isFinished.value = !loading;
  };

  const waitUtilFinished = () =>
    new Promise((resolve, reject) => {
      toMatch(isFinished)
        .then(() => resolve(result))
        .catch(reject);
    });

  const execute = (executeUrl = url, config = {}) => {
    error.value = undefined;
    const _url =
      typeof executeUrl === "string" ? executeUrl : url ?? config.url;

    if (_url === undefined) {
      error.value = new AxiosError(AxiosError.ERR_INVALID_URL);
      isFinished.value = true;
      return waitUtilFinished();
    }

    loading(true);
    instance(_url, {
      ...defaultConfig,
      ...(typeof executeUrl === "object" ? executeUrl : config),
      cancelToken: cancelToken.token
    })
      .then(res => {
        response.value = res;
        const result = res.data;
        data.value = result;
        options.onSuccess?.(result);
      })
      .catch(err => {
        error.value = err;
        options.onError?.(err);
      })
      .finally(() => loading(false));

    return waitUtilFinished();
  };

  if (options.immediate && url) execute();

  const result = {
    response,
    data,
    error,
    loading: isLoading,
    isFinished,
    isLoading,
    isAborted,
    abort,
    execute
  };

  return {
    ...result
  };
}

// return toMatch(v => v === value, options);
function toMatch(
  r,
  condition = v => v === true,
  { flush = "sync", deep = false, timeout, throwOnTimeout } = {},
  isNot = false
) {
  let stop = null;
  const watcher = new Promise(resolve => {
    stop = watch(
      r,
      v => {
        if (condition(v) !== isNot) {
          stop?.();
          resolve(v);
        }
      },
      {
        flush,
        deep,
        immediate: true
      }
    );
  });

  const promises = [watcher];
  if (timeout != null) {
    promises.push(
      promiseTimeout(timeout, throwOnTimeout)
        .then(() => unref(r))
        .finally(() => stop?.())
    );
  }

  return Promise.race(promises);
}
// ms: number
function promiseTimeout(ms, throwOnTimeout = false, reason = "Timeout") {
  return new Promise((resolve, reject) => {
    if (throwOnTimeout) setTimeout(() => reject(reason), ms);
    else setTimeout(resolve, ms);
  });
}
