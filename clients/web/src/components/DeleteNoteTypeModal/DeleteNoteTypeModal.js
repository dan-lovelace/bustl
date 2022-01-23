import React from "react";

import Button from "components/Button/Button";
import Modal from "components/Modal/Modal";

export default function DeleteNoteTypeModal({
  item,
  onConfirm,
  setConfirming,
}) {
  const handleCancelClick = () => {
    setConfirming(false);
  };

  const handleConfirmClick = () => {
    onConfirm();
  };

  return (
    <Modal
      centerVertical
      hideClose
      onClose={handleCancelClick}
      size="xs"
      type="dialog"
    >
      <div className="mb-4">Are you sure you want to delete "{item.name}"?</div>
      <div className="text-sm mb-4">
        This will permanently delete the list and all its notes.{" "}
        <span className="text-red-600 font-bold underline">
          You will not be able to get them back.
        </span>
      </div>
      <div className="text-sm mb-4">
        If you want to keep or archive the notes, move them to another list
        before deleting this one.
      </div>
      <hr className="my-4" />
      <div className="flex justify-between">
        <Button className="hover:bg-gray-200" onClick={handleCancelClick}>
          Cancel
        </Button>
        <Button className="" primary onClick={handleConfirmClick}>
          Yes, delete forever
        </Button>
      </div>
    </Modal>
  );
}
