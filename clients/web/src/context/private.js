import React, { createContext, useContext, useState } from "react";
import moment from "moment-timezone";

import boardData from "datastore/board";

const initialState = {
  boards: {
    data: null,
    error: null,
    fetched: false,
    loading: null,
  },
  selectedItems: {
    boards: [],
    notes: [],
    selectMode: false,
  },
};

const privateContext = createContext();

function constructBoardsData(data) {
  if (!data || !data.length) {
    return [];
  }

  // group by date
  const dateKey = (d) => moment(d.created_at).format("LL");
  const dateGroups = data.reduce((acc, val) => {
    const currentKey = dateKey(val);

    return {
      ...acc,
      [currentKey]: [...(acc[currentKey] || []), { ...val }],
    };
  }, {});

  const ret = Object.keys(dateGroups).map((key, idx) => ({
    id: `date_group_${idx}`,
    date: key,
    boards: [...dateGroups[key]],
  }));

  return ret;
}

function getSelectMode(selectedItems) {
  const { boards, notes } = selectedItems;

  return boards.length + notes.length > 0;
}

function getUnique(inputArr) {
  return new Map(inputArr.map((b) => [b.id, b]));
}

function selectionsFromMap(inputMap) {
  const arr = Array.from(inputMap);
  return arr.map((b) => b[1]);
}

function useProvidePrivate() {
  const [state, setState] = useState(initialState);

  const addToSelectedBoards = (board) => {
    const uniqueBoards = getUnique(state.selectedItems.boards);
    uniqueBoards.set(board.id, board);

    const newSelected = {
      ...state.selectedItems,
      boards: selectionsFromMap(uniqueBoards),
    };
    const selectMode = getSelectMode(newSelected);

    setState({
      ...state,
      selectedItems: {
        ...newSelected,
        selectMode,
      },
    });
  };

  const removeFromSelectedBoards = (boardId) => {
    const newBoards = state.selectedItems.boards.filter(
      (b) => b.id !== boardId
    );
    const newSelected = {
      ...state.selectedItems,
      boards: newBoards,
    };
    const selectMode = getSelectMode(newSelected);

    setState({
      ...state,
      selectedItems: {
        ...newSelected,
        selectMode,
      },
    });
  };

  const resetAllSelectedItems = () => {
    setState({
      ...state,
      selectedItems: initialState.selectedItems,
    });
  };

  const resetSelectedBoards = () => {
    const newSelected = {
      ...state.selectedItems,
      boards: [],
    };
    const selectMode = getSelectMode(newSelected);

    setState({
      ...state,
      selectedItems: {
        ...newSelected,
        selectMode,
      },
    });
  };

  const setSelectedBoards = (boards) => {
    const uniqueBoards = getUnique(boards);
    const newSelected = {
      ...state.selectedItems,
      boards: selectionsFromMap(uniqueBoards),
    };
    const selectMode = getSelectMode(newSelected);

    setState({
      ...state,
      selectedItems: {
        ...newSelected,
        selectMode,
      },
    });
  };

  const archiveBoards = async (client, variables) => {
    try {
      const { ids } = variables;
      await boardData(client, "DELETE", {
        ids,
        archive: true,
      });

      listBoards(client);
    } catch (e) {
      throw new Error(e);
    }
  };

  const deleteBoards = async (client, variables) => {
    try {
      const deleteResult = await boardData(client, "DELETE", {
        ...variables,
        archive: false,
      });
      console.log("deleteResult", deleteResult);
    } catch (e) {}
  };

  const listBoards = async (client, options = {}) => {
    setState({
      ...state,
      boards: {
        ...state.boards,
        loading: true,
      },
    });

    try {
      const queryData = await boardData(client, "LIST");
      setState({
        ...state,
        boards: {
          ...initialState.boards,
          data: constructBoardsData(queryData.data.boards),
          fetched: new Date(),
          loading: false,
        },
        selectedItems: initialState.selectedItems,
      });
    } catch (error) {
      setState({
        ...state,
        boards: {
          ...initialState.boards,
          error,
          fetched: new Date(),
          loading: false,
        },
      });
    }

    // client
    //   .query({ query: GET_BOARDS, ...options })
    //   .then((res) => {
    //     setState({
    //       ...state,
    //       boards: {
    //         ...initialState.boards,
    //         data: constructBoardsData(res.data.boards),
    //         fetched: new Date(),
    //         loading: false,
    //       },
    //     });
    //   })
    //   .catch((err) => {
    //     setState({
    //       ...state,
    //       boards: {
    //         ...initialState.boards,
    //         error: err,
    //         fetched: new Date(),
    //         loading: false,
    //       },
    //     });
    //   });
  };

  const finishUploading = (event) => {
    console.log("finishUploading event", event);
  };

  return {
    state,

    // functions
    addToSelectedBoards,
    archiveBoards,
    deleteBoards,
    finishUploading,
    listBoards,
    removeFromSelectedBoards,
    resetAllSelectedItems,
    resetSelectedBoards,
    setSelectedBoards,
  };
}

export function ProvidePrivate({ children }) {
  const providerValue = useProvidePrivate();

  return (
    <privateContext.Provider value={providerValue}>
      {children}
    </privateContext.Provider>
  );
}

export function usePrivateContext() {
  return useContext(privateContext);
}
