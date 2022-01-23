import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@material-ui/core";

import cx from "lib/classnames";
import { useBoardsQuery } from "lib/gql/queries/board";

import BoardsListItem from "./BoardsListItem";
import Checkbox from "components/Checkbox/Checkbox";
import ChevronDown from "components/Icons/ChevronDownIcon";
import Spinner from "components/Loader/Spinner";

export default function BoardsList({ selected, setSelected }) {
  const { data, error, loading } = useBoardsQuery();

  if (loading) {
    return (
      <div className="flex items-center p-3 text-lg">
        <Spinner />
        Archived Boards
      </div>
    );
  }

  if (error) return `Error: ${error.toString()}`;

  // get boards from query response
  const { boards: dataBoards } = data || {};

  // create an array of boards to sort/filter
  const boards = dataBoards && dataBoards.length ? [...dataBoards] : [];

  // filter by archived boards only
  const archivedBoards = boards.filter((b) => b.archived);

  // sort by latest updated
  const sorted = archivedBoards.sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  const handleSelectAllChange = () => {
    if (selected.length >= sorted.length) {
      // deselect all
      setSelected([]);
    } else {
      // select all
      setSelected(sorted.map((i) => i.id));
    }
  };

  const handleSelectedChange = (id) => {
    if (selected.includes(id)) {
      // remove from selected
      setSelected(selected.filter((i) => i !== id));
    } else {
      // add to selected
      setSelected([...selected, id]);
    }
  };

  const allSelected =
    sorted.length > 0 && !!(selected.length === sorted.length);

  return (
    <div className="boards-list">
      {sorted && sorted.length > 0 ? (
        <Accordion>
          <AccordionSummary expandIcon={<ChevronDown />}>
            <div className="flex items-center text-lg">
              <Checkbox
                checked={allSelected}
                onChange={handleSelectAllChange}
              />
              Archived Boards
            </div>
          </AccordionSummary>
          <AccordionDetails>
            <div className="w-full">
              {sorted.map((b, idx) => (
                <BoardsListItem
                  key={b.id}
                  item={b}
                  onChange={handleSelectedChange}
                  selected={selected.includes(b.id)}
                  showDivider={!!(idx < sorted.length - 1)}
                />
              ))}
            </div>
          </AccordionDetails>
        </Accordion>
      ) : (
        <div
          className={cx(
            "p-4",
            "border border-blue-900",
            "bg-blue-100 text-blue-900",
            "rounded"
          )}
        >
          No archived boards
        </div>
      )}
    </div>
  );
}
