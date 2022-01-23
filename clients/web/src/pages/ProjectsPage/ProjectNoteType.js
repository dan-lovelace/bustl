import React, { useState } from "react";
import MenuList from "@material-ui/core/MenuList";
import MenuItem from "@material-ui/core/MenuItem";
import Popover from "@material-ui/core/Popover";
import { Container } from "react-smooth-dnd";

import cx from "lib/classnames";
import { useDeleteNoteTypesMutation } from "lib/gql/mutations/noteType";

import CreateNoteButton from "./CreateNoteButton";
import { NoteTypeListColumn } from "./ProjectNoteTypes";
import ProjectNoteTypeNote from "./ProjectNoteTypeNote";
import UpdateNoteTypeModal from "./UpdateNoteTypeModal";
import IconButton from "components/Button/IconButton";
import DeleteNoteTypeModal from "components/DeleteNoteTypeModal/DeleteNoteTypeModal";
import DotsVerticalIcon from "components/Icons/DotsVerticalIcon";
import CreditCardIcon from "components/Icons/CreditCardIcon";
import NoteIcon from "components/Icons/NoteIcon";
import TrashIcon from "components/Icons/TrashIcon";

const popoverId = "note-type-list-popover";

export default function ProjectNoteType({
  item,
  moving,
  onNoteDrop,
  projectId,
}) {
  const [anchorEl, setAnchorEl] = useState(false);
  const [creatingNote, setCreatingNote] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editingNoteType, setEditingNoteType] = useState(false);
  const [deleteNoteTypes, { error, loading: deleting }] =
    useDeleteNoteTypesMutation();

  if (error) return `Error ${error}`;

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const handleAddNoteClick = () => {
    closeMenu();
    setCreatingNote(true);
  };

  const handleEditNoteTypeClick = () => {
    closeMenu();
    setEditingNoteType(true);
  };

  const handleDeleteNoteTypeClick = () => {
    closeMenu();

    if (item.notes && item.notes.length) {
      setConfirmingDelete(true);
    } else {
      handleDeleteConfirmation();
    }
  };

  const handleDeleteConfirmation = () => {
    const params = {
      variables: { ids: [item.id] },
    };

    deleteNoteTypes(params);
    setConfirmingDelete(false);
  };

  const handleDragChange = (operation) => {
    const containers = document.querySelectorAll(".smooth-dnd-container");

    if (!containers || !containers.length) return;

    containers.forEach((ele) => {
      ele.classList[operation]("dragging");
    });
  };

  const handleDragEnd = (event) => {
    if (!event.willAcceptDrop) return;

    handleDragChange("remove");
  };

  const handleDragStart = (event) => {
    if (!event.willAcceptDrop) return;

    handleDragChange("add");
  };

  const openMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const renderedNotes =
    item && item.notes && item.notes.length > 0 ? item.notes : [];

  // return (
  //   <Draggable
  //     key={item.id}
  //     className={cx(moving && "pointer-events-none")}
  //   >

  //   </Draggable>
  // );

  return (
    <NoteTypeListColumn className="project-note-type">
      <div className={cx("flex items-center", "p-2", "text-sm font-bold")}>
        <div className="flex-1">{item.name}</div>
        <div>
          <IconButton
            className="hover:bg-gray-200"
            aria-describedby={popoverId}
            disabled={deleting}
            noPadding
            onClick={openMenu}
            size="xs"
          >
            <DotsVerticalIcon size="xs" />
          </IconButton>
        </div>
      </div>
      <div className={cx("flex-1", "px-2")}>
        <Container
          groupName="note_type"
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={onNoteDrop(item.id)}
          getChildPayload={(index) => ({
            ...renderedNotes[index],
            note_type_id: item.id,
          })}
          dragClass="card-ghost"
          dropClass="card-ghost-drop"
          // onDragEnter={() => {
          //   console.log("drag enter:", item.id);
          // }}
          // onDragLeave={() => {
          //   console.log("drag leave:", item.id);
          // }}
          // onDropReady={(p) => console.log("Drop ready: ", p)}
          dropPlaceholder={{
            animationDuration: 150,
            showOnTop: true,
            className: "drop-preview",
          }}
          // render={(rootRef) => (
          //   <div ref={rootRef} className="note-container">
          //     {renderedNotes.map((n) => (
          //       <ProjectNoteTypeNote
          //         key={n.id}
          //         item={n}
          //         moving={moving}
          //         projectId={projectId}
          //       />
          //     ))}
          //   </div>
          // )}
        >
          {renderedNotes.map((n) => (
            <ProjectNoteTypeNote
              key={n.id}
              item={n}
              moving={moving}
              projectId={projectId}
            />
          ))}
        </Container>
      </div>
      <CreateNoteButton
        creating={creatingNote}
        noteTypeId={item.id}
        setCreating={setCreatingNote}
      />

      <Popover
        id={popoverId}
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={closeMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuList>
          <MenuItem onClick={handleEditNoteTypeClick}>
            <CreditCardIcon className="mr-4" /> Edit list...
          </MenuItem>
          <MenuItem onClick={handleAddNoteClick}>
            <NoteIcon className="mr-4" /> Add note
          </MenuItem>
          <hr className="my-2" />
          <MenuItem onClick={handleDeleteNoteTypeClick}>
            <TrashIcon className="mr-4" /> Delete this list
          </MenuItem>
        </MenuList>
      </Popover>

      {confirmingDelete && (
        <DeleteNoteTypeModal
          item={item}
          onConfirm={handleDeleteConfirmation}
          setConfirming={setConfirmingDelete}
        />
      )}

      {editingNoteType && (
        <UpdateNoteTypeModal
          item={item}
          projectId={projectId}
          setEditing={setEditingNoteType}
        />
      )}
    </NoteTypeListColumn>
  );
}
