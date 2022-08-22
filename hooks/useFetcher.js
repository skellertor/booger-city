import axios from 'axios';
import { useCallback } from 'react';
import { isEmpty } from 'lodash';

export function useFetcher({ user }) {
  const fetcher = useCallback(
    ({ method = 'GET', url, data = {} }) => {
      const { accessToken } = user;

      return axios({
        method,
        url,
        ...(!isEmpty(data) && { data }),
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      })
        .then(({ data }) => data)
        .catch(asyncErrorHandler);
    },
    [user]
  );

  return fetcher;
}

function asyncErrorHandler(error) {
  // still need error schema from backent to transform it to human readable error
  throw { message: 'generic error', ...error };
}
