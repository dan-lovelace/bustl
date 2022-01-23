import { gql } from "@apollo/client";

const CREATE_BOARD = gql`
  mutation CreateBoard($input: CreateBoardInput!) {
    createBoard(input: $input) {
      id
    }
  }
`;

const DELETE_BOARDS = gql`
  mutation DeleteBoards($ids: [ID]!, $archive: Boolean) {
    deleteBoards(ids: $ids, archive: $archive) {
      id
    }
  }
`;

const LIST_BOARDS = gql`
  query {
    boards {
      id
      created_at
      image {
        thumbnail
        created_at
      }
    }
  }
`;

const LIST_ARCHIVED_BOARDS = gql`
  query {
    boards(filter: { archived: true }) {
      id
      created_at
      archived
      image {
        thumbnail
        created_at
      }
    }
  }
`;

export default async function boardData(client, operation, params) {
  switch (operation) {
    case "CREATE": {
      let boardId;

      try {
        const createBoardMutation = await client.mutate({
          mutation: CREATE_BOARD,
          variables: {
            ...params,
          },
        });
        const {
          data: {
            createBoard: { id },
          },
        } = createBoardMutation;

        boardId = id;
      } catch (e) {
        throw new Error(e);
      }

      return boardId;
    }

    case "DELETE": {
      try {
        const createBoardMutation = await client.mutate({
          mutation: DELETE_BOARDS,
          variables: {
            ...params,
          },
        });

        return createBoardMutation;
      } catch (e) {
        throw new Error(e);
      }
    }

    case "LIST": {
      try {
        const listQuery = await client.query({
          fetchPolicy: "network-only",
          query: LIST_BOARDS,
        });

        return listQuery;
      } catch (e) {
        throw new Error(e);
      }
    }

    case "LIST_ARCHIVED": {
      try {
        const listQuery = await client.query({
          fetchPolicy: "network-only",
          query: LIST_ARCHIVED_BOARDS,
        });

        return listQuery;
      } catch (e) {
        throw new Error(e);
      }
    }

    default:
      throw new Error("Invalid data operation on [Board]");
  }
}
