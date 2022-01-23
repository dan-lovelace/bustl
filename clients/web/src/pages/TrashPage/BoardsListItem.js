import React from "react";
import { generatePath, Link } from "react-router-dom";

import { useUnarchiveBoardMutation } from "lib/gql/mutations/board";
import { TRASH_BOARD_DETAILS_PAGE } from "lib/routes";
import { dateToString } from "lib/time";

import Button from "components/Button/Button";
import Checkbox from "components/Checkbox/Checkbox";
import ArchiveIcon from "components/Icons/ArchiveIcon";
import Image from "components/Image/Image";

export default function BoardsListItem({
  item,
  onChange,
  selected,
  showDivider,
}) {
  const [
    unarchiveBoard,
    { loading: unarchivingBoard },
  ] = useUnarchiveBoardMutation();

  const handleSelectedChange = () => {
    onChange(item.id);
  };

  const handleRestoreClick = () => {
    unarchiveBoard({
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
              to={generatePath(TRASH_BOARD_DETAILS_PAGE, { boardId: item.id })}
            >
              <Image src={item.image.thumbnail} />
            </Link>
          </div>
          <div className="text-xs text-gray-600">
            Last updated: {dateToString(item.updated_at)}
          </div>
        </div>
        <div>
          <Button
            className="w-full mb-1 bg-gray-100 hover:bg-gray-200"
            disabled={unarchivingBoard}
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
