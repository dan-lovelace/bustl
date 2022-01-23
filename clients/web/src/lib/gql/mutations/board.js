import { gql, useMutation } from "@apollo/client";

import { boardFragment } from "../fragments";

export const CREATE_BOARD = gql`
  mutation CreateBoard($input: CreateBoardInput!) {
    createBoard(input: $input) {
      ...Board
    }
  }
  ${boardFragment}
`;

export function useArchiveBoardMutation() {
  const mutation = gql`
    mutation ArchiveBoard($id: ID!) {
      updateBoard(id: $id, input: { archived: true }) {
        ...Board
      }
    }
    ${boardFragment}
  `;

  return useMutation(mutation);
}

export function useArchiveBoardsMutation() {
  const mutation = gql`
    mutation ArchiveBoards($ids: [ID]!) {
      archiveBoards(ids: $ids) {
        ...Board
      }
    }
    ${boardFragment}
  `;

  return useMutation(mutation);
}

export function useCreateBoardMutation() {
  return useMutation(CREATE_BOARD, {
    update(cache, { data: { createBoard: newBoard } }) {
      cache.modify({
        fields: {
          boards(existing = []) {
            const previousBoards = [
              ...(existing && existing.length > 0 ? existing : []),
            ];
            const newRef = cache.writeFragment({
              data: newBoard,
              fragment: boardFragment,
            });

            return [...previousBoards, newRef];
          },
        },
      });
    },
  });
}

export function useDeleteBoardsMutation() {
  const mutation = gql`
    mutation DeleteBoards($ids: [ID]!) {
      deleteBoards(ids: $ids)
    }
  `;

  return useMutation(mutation, {
    update(cache, { data: { deleteBoards } }) {
      for (const id of deleteBoards) {
        cache.evict({
          id: cache.identify({ __ref: `Board:${id}` }),
        });
      }

      cache.gc();
    },
  });
}

export function useUnarchiveBoardMutation() {
  const mutation = gql`
    mutation UnarchiveBoard($id: ID!) {
      updateBoard(id: $id, input: { archived: false }) {
        ...Board
      }
    }
    ${boardFragment}
  `;

  return useMutation(mutation);
}
