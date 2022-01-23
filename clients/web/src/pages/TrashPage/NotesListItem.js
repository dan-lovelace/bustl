import React from "react";
import { generatePath, Link } from "react-router-dom";

import { useUnarchiveNoteMutation } from "lib/gql/mutations/note";
import { TRASH_NOTE_DETAILS_PAGE } from "lib/routes";
import { dateToString } from "lib/time";

import Button from "components/Button/Button";
import Checkbox from "components/Checkbox/Checkbox";
import ArchiveIcon from "components/Icons/ArchiveIcon";

export default function NotesListItem({
  item,
  onChange,
  selected,
  showDivider,
}) {
  const [
    unarchiveNote,
    { loading: unarchivingNote },
  ] = useUnarchiveNoteMutation();

  const handleSelectedChange = () => {
    onChange(item.id);
  };

  const handleRestoreClick = () => {
    unarchiveNote({
      variables: {
        id: item.id,
      },
    });
  };

  return (
    <>
      <div className="flex text-sm">
        <div>
          <Checkbox checked={selected} onChange={handleSelectedChange} />
        </div>
        <div className="flex-auto">
          <div className="w-36 md:w-36">
            <Link
              to={generatePath(TRASH_NOTE_DETAILS_PAGE, { noteId: item.id })}
            >
              {item.title}
            </Link>
          </div>
          <div className="text-xs text-gray-600">
            Last updated: {dateToString(item.updated_at)}
          </div>
        </div>
        <div>
          <Button
            className="w-full mb-1 bg-gray-100 hover:bg-gray-200"
            disabled={unarchivingNote}
            justify="start"
            onClick={handleRestoreClick}
            short
          >
            <ArchiveIcon className="mr-3" /> Restore
          </Button>
        </div>
      </div>
      {showDivider && <hr className="my-2" />}
    </>
  );
}
