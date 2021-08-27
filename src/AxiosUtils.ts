import axios, { CancelTokenSource } from 'axios';

function axiosGetRequestWithAbortFactory() {
  // eslint-disable-next-line init-declarations
  let call: CancelTokenSource = null;
  return (url: string) => {
    if (call) {
      call.cancel();
    }
    call = axios.CancelToken.source();
    return axios.get(url, { cancelToken: call.token });
  };
}
