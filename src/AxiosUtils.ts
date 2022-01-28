import axios, { AxiosResponse, CancelTokenSource } from 'axios';

export class AxiosUtils {
  public static axiosGetRequestWithAbortFactory<T = never>(): (
    url: string
  ) => Promise<AxiosResponse<T>> {
    // eslint-disable-next-line init-declarations
    let call: CancelTokenSource = null;
    return (url: string): Promise<AxiosResponse<T>> => {
      if (call) {
        call.cancel();
      }
      call = axios.CancelToken.source();
      return axios.get<T>(url, { cancelToken: call.token });
    };
  }
}
