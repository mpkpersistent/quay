import {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  fetchRobotAccountToken,
  regenerateRobotToken,
} from 'src/resources/RobotsResource';
import {useOrganizations} from 'src/hooks/UseOrganizations';

export function useRobotToken({orgName, robName, onSuccess, onError}) {
  const {usernames} = useOrganizations();
  const isUserOrganization = usernames.includes(orgName);
  const [namespace, setNamespace] = useState(orgName);
  const [robotName, setRobotName] = useState(robName);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const queryClient = useQueryClient();

  const {data: robotAccountToken, isLoading: loading} = useQuery(
    ['Namespace', namespace, 'robot', robotName, 'token'],
    ({signal}) => fetchRobotAccountToken(namespace, robotName, isUserOrganization, signal),
    {
      enabled: true,
      placeholderData: {},
      onSuccess: (result) => {
        onSuccess(result);
      },
      onError: (err) => {
        onError(err);
      },
    },
  );

  const regenerateRobotTokenMutator = useMutation(
    async ({namespace, robotName}: regenerateRobotTokenParams) => {
      return regenerateRobotToken(namespace, robotName, isUserOrganization);
    },
    {
      onSuccess: (result) => {
        queryClient.invalidateQueries([
          'Namespace',
          namespace,
          'robot',
          robotName,
          'token',
        ]);
        onSuccess(result);
      },
      onError: (err) => {
        onError(err);
      },
    },
  );

  return {
    robotAccountToken: robotAccountToken,
    loading: loading,

    regenerateRobotToken: async (regenerateRobotTokenParams) =>
      regenerateRobotTokenMutator.mutate(regenerateRobotTokenParams),
  };
}

interface regenerateRobotTokenParams {
  namespace: string;
  robotName: string;
}
