import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
// import { Container } from "react-smooth-dnd";

import cx from "lib/classnames";
import { useMoveNoteMutation } from "lib/gql/mutations/note";
// import { useUpdateNoteTypeMutation } from "lib/gql/mutations/noteType";
import { sizes } from "lib/styles";

import CreateNoteTypeButton from "./CreateNoteTypeButton";
import ProjectNoteType from "./ProjectNoteType";
import toast from "components/Notification/toastMessage";

export function NoteTypeListColumn({ children, className, ...rest }) {
  return (
    <div
      className={cx(
        "note-type-list-item",
        "flex flex-col",
        "max-h-full",
        "self-start",
        "bg-gray-100",
        "rounded",
        "mr-2",
        className
      )}
      style={{
        minWidth: `${sizes.noteTypeColumnWidth / 4}rem`,
        maxWidth: `${sizes.noteTypeColumnWidth / 4}rem`,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export default function ProjectNoteTypes({ project }) {
  const [sortedNoteTypes, setSortedNoteTypes] = useState([]);
  const { projectId } = useParams();
  const [moveNote, { loading: movingNote }] = useMoveNoteMutation();
  // const [updateNoteType, { loading: movingNoteType }] =
  //   useUpdateNoteTypeMutation();

  useEffect(() => {
    function init() {
      const { note_types } = project || {};
      const newNoteTypes = [...(note_types || [])]
        .sort((a, b) => a.sort_position - b.sort_position)
        .map((nt, idx) => ({
          ...nt,
          notes:
            nt.notes && nt.notes.length > 0
              ? [...nt.notes].filter((n) => !n.archived)
              : [],
        }));

      setSortedNoteTypes(newNoteTypes);
    }

    init();
  }, [project]);

  useEffect(() => {
    const cleanClasses = () => {
      document.body.className = "";
    };

    document.addEventListener("touchend", cleanClasses, false);

    return () => {
      document.removeEventListener("touchend", cleanClasses, false);
    };
  }, []);

  const handleNoteDrop = (noteTypeId) => (event) => {
    const { addedIndex, removedIndex } = event;

    if (
      (addedIndex !== null || removedIndex !== null) &&
      addedIndex !== removedIndex
    ) {
      const newNoteTypes = [...sortedNoteTypes];
      const noteTypeIndex = newNoteTypes.findIndex(
        (nt) => nt.id === noteTypeId
      );

      if (removedIndex !== null) {
        // update state for immediate feedback
        newNoteTypes[noteTypeIndex].notes.splice(removedIndex, 1);
      }

      if (addedIndex !== null) {
        // get new sort position and call move note mutation
        const sameNoteType = event.payload.note_type_id === noteTypeId;
        const itemAtPosition =
          newNoteTypes[noteTypeIndex].notes[
            addedIndex - (sameNoteType && addedIndex > removedIndex ? 1 : 0)
          ];
        let submitSortPosition;

        if (itemAtPosition) {
          submitSortPosition = itemAtPosition.sort_position;
        } else {
          let nextSortPosition = 1; // default to 1 in case moving to an empty list
          if (newNoteTypes[noteTypeIndex].notes.length) {
            // list is not empty
            nextSortPosition =
              newNoteTypes[noteTypeIndex].notes[
                newNoteTypes[noteTypeIndex].notes.length - 1
              ].sort_position + (sameNoteType ? 0 : 1);
          }

          submitSortPosition = nextSortPosition;
        }
        const params = {
          variables: {
            id: event.payload.id,
            input: {
              note_type_id: noteTypeId,
              sort_position: submitSortPosition,
            },
          },
          update(cache) {
            cache.modify({
              id: cache.identify({
                __ref: `NoteType:${noteTypeId}`,
              }),
              fields: {
                notes: (e, { DELETE }) => DELETE,
              },
            });
          },
        };

        moveNote(params).catch(handleNetworkError);

        // update state for immediate feedback
        newNoteTypes[noteTypeIndex].notes.splice(addedIndex, 0, event.payload);
      }

      setSortedNoteTypes(newNoteTypes);
    }
  };

  // const handleNoteTypeDrop = (event) => {
  //   const { addedIndex, removedIndex } = event;

  //   if (
  //     (addedIndex !== null || removedIndex !== null) &&
  //     addedIndex !== removedIndex
  //   ) {
  //     const newNoteTypes = [...sortedNoteTypes];

  //     if (removedIndex !== null) {
  //       // update state for immediate feedback
  //       newNoteTypes.splice(removedIndex, 1);
  //     }

  //     if (addedIndex !== null) {
  //       const itemAtPosition = newNoteTypes[addedIndex];
  //       let submitSortPosition;

  //       if (itemAtPosition) {
  //         submitSortPosition = itemAtPosition.sort_position;
  //       } else {
  //         const nextSortPosition =
  //           newNoteTypes[newNoteTypes.length - 1].sort_position;
  //         submitSortPosition = nextSortPosition;
  //       }

  //       const params = {
  //         variables: {
  //           id: event.payload.id,
  //           input: {
  //             project_id: projectId,
  //             sort_position: submitSortPosition,
  //           },
  //         },
  //         update(cache) {
  //           cache.modify({
  //             id: cache.identify({ __ref: `Project:${projectId}` }),
  //             fields: {
  //               note_types: (e, { DELETE }) => DELETE,
  //             },
  //           });
  //         },
  //       };

  //       updateNoteType(params).catch(handleNetworkError);

  //       // update state for immediate feedback
  //       newNoteTypes.splice(addedIndex, 0, event.payload);
  //     }

  //     setSortedNoteTypes(newNoteTypes);
  //   }
  // };

  const handleNetworkError = (error) => {
    toast.error(error.toString(), { autoClose: false });
  };

  const movingSomething = movingNote; // || movingNoteType;

  return (
    <div className={cx("note-type-list", "flex flex-1", "p-2")}>
      {/* <Container
        orientation="horizontal"
        onDrop={handleNoteTypeDrop}
        getChildPayload={(index) => sortedNoteTypes[index]}
      > */}
      {sortedNoteTypes.map((nt) => (
        <ProjectNoteType
          key={nt.id}
          item={nt}
          projectId={projectId}
          onNoteDrop={handleNoteDrop}
          moving={movingSomething}
        />
      ))}
      {/* </Container> */}
      <NoteTypeListColumn>
        <CreateNoteTypeButton projectId={projectId} />
      </NoteTypeListColumn>
    </div>
  );
}
