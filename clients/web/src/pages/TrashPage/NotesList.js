import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@material-ui/core";

import cx from "lib/classnames";
import { useNotesQuery } from "lib/gql/queries/note";

import NotesListItem from "./NotesListItem";
import Checkbox from "components/Checkbox/Checkbox";
import ChevronDown from "components/Icons/ChevronDownIcon";
import Spinner from "components/Loader/Spinner";

export default function NotesList({ selected, setSelected }) {
  // const [selected, setSelected] = useState([]);
  const { data, error, loading } = useNotesQuery();

  if (loading) {
    return (
      <div className="flex items-center p-3 text-lg">
        <Spinner />
        Archived Notes
      </div>
    );
  }

  if (error) return `Error: ${error.toString()}`;

  // get notes from query response
  const { notes: dataNotes } = data || {};

  // create an array of notes to sort/filter
  const notes = dataNotes && dataNotes.length ? [...dataNotes] : [];

  // filter by archived notes only
  const archivedNotes = notes.filter((b) => b.archived);

  // sort by latest updated
  const sorted = archivedNotes.sort(
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
    <div className="notes-list">
      {sorted && sorted.length > 0 ? (
        <Accordion>
          <AccordionSummary expandIcon={<ChevronDown />}>
            <div className="flex items-center text-lg">
              <Checkbox
                checked={allSelected}
                onChange={handleSelectAllChange}
              />
              Archived Notes
            </div>
          </AccordionSummary>
          <AccordionDetails>
            <div className="w-full">
              {sorted.map((b, idx) => (
                <NotesListItem
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
          No archived notes
        </div>
      )}
    </div>
  );
}
