import React from "react";
import { Form, Formik } from "formik";
import MenuItem from "@material-ui/core/MenuItem";
import Popover from "@material-ui/core/Popover";
import * as yup from "yup";

import { useMoveNoteMutation } from "lib/gql/mutations/note";
import { useMoveNoteQuery } from "lib/gql/queries";

import Button from "components/Button/Button";
import SelectInput from "components/Form/SelectInput";
import toast from "components/Notification/toastMessage";

const popoverId = "note-details-move-popover";

const formSchema = yup.object().shape({
  // projectId?
  // noteTypeId?
  // relativeSortPosition: yup
  //   .number()
  //   .min(0)
  //   .required("This list needs a sort position"),
});

export default function MoveNote({
  anchorEl,
  item,
  moveRefetchQuery,
  setAnchorEl,
}) {
  const [moveNote, { loading: updating }] = useMoveNoteMutation();
  const {
    data: noteQueryData,
    // error: noteQueryError,
    // loading: noteQueryLoading,
  } = useMoveNoteQuery({
    skip: updating,
    variables: { id: item.id },
  });

  if (
    !noteQueryData ||
    !noteQueryData.projects ||
    !noteQueryData.projects.length
  ) {
    return false;
  }

  const { projects } = noteQueryData;
  const {
    note_type: { id: noteTypeId },
  } = item;

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const handleFormSubmit = (values) => {
    // noop if updating
    if (updating) return;

    const { noteTypeId: valuesNoteTypeId } = values;
    const selectedProjectNoteTypes = projects.find((p) =>
      p.note_types.find((nt) => nt.id === valuesNoteTypeId)
    ).note_types;
    const selectedNoteType = selectedProjectNoteTypes.find(
      (nt) => nt.id === valuesNoteTypeId
    );
    const { notes } = selectedNoteType;
    const filteredNotes = [...(notes || [])].filter((n) => !n.archived);
    const newRelativePosition = parseInt(values.relativeSortPosition, 10);
    const itemAtNewPosition =
      filteredNotes &&
      filteredNotes.find((i, idx) => idx + 1 === newRelativePosition);

    // calculate the absolute sort position value to use for the mutation
    let submitSortPosition;
    if (!itemAtNewPosition) {
      // no item at position, add to the end of the target list
      let toUse = 1; // default to first position

      if (filteredNotes && filteredNotes.length) {
        // existing note types exist, find the highest absolute sort position value
        const sorted = [...filteredNotes].sort(
          (a, b) => a.sort_position - b.sort_position
        );
        const highest = sorted[sorted.length - 1].sort_position;

        // add 1 to the highest to insert after
        toUse = highest + 1;
      }

      // submit using calculated value
      submitSortPosition = toUse;
    } else {
      // an item exists at the new position, use its sort position
      submitSortPosition = itemAtNewPosition.sort_position;
    }

    const params = {
      variables: {
        id: item.id,
        input: {
          note_type_id: valuesNoteTypeId,
          sort_position: submitSortPosition,
        },
      },
      update(cache) {
        if (selectedNoteType.id !== noteTypeId) {
          // note type changed, invalidate new list's notes
          cache.modify({
            id: cache.identify({ __ref: `NoteType:${selectedNoteType.id}` }),
            fields: {
              notes(existing = [], { DELETE }) {
                return DELETE;
              },
            },
          });
        }
      },
    };

    // refetch current project details if item was moved to easily handle resorting/removal
    if (
      (selectedNoteType.id !== noteTypeId ||
        submitSortPosition !== item.sort_position) &&
      moveRefetchQuery
    ) {
      params.refetchQueries = [moveRefetchQuery];
    }

    // execute mutation
    moveNote(params).catch(handleNetworkError);

    // reset ui states
    closeMenu();
  };

  const handleNetworkError = (error) => {
    toast.error(error.toString(), { autoClose: false });
  };

  const getSortPositionOptions = (ntId) => {
    const types = projects.find((p) =>
      p.note_types.find((nt) => nt.id === ntId)
    ).note_types;
    const noteType = types.find((nt) => nt.id === ntId) || {};
    const { notes: noteTypeNotes } = noteType;
    const filteredNotes = [...(noteTypeNotes || [])].filter((n) => !n.archived);

    if (!filteredNotes || !filteredNotes.length) {
      return <MenuItem value="1">1</MenuItem>;
    } else {
      const notesToSort = [...filteredNotes];
      const sorted = notesToSort.sort(
        (a, b) => a.sort_position - b.sort_position
      );
      const indexed = sorted.map((p, idx) => ({
        ...p,
        relativeSortPosition: idx + 1,
      }));

      if (ntId !== noteTypeId) {
        indexed.push({
          relativeSortPosition: filteredNotes.length + 1,
        });
      }

      return indexed.map((i, idx) => (
        <MenuItem key={idx} value={i.relativeSortPosition}>
          {i.relativeSortPosition}
        </MenuItem>
      ));
    }
  };

  const getInitialRelativeSortPosition = () => {
    const types =
      projects.find((p) =>
        p.note_types.find((nt) => nt.id === item.note_type.id)
      ).note_types || [];
    const notes = types.find((nt) => nt.id === item.note_type.id).notes || [];
    const filtered = notes.filter((n) => !n.archived);
    const sorted = [...filtered].sort(
      (a, b) => a.sort_position - b.sort_position
    );
    const rPos = sorted.findIndex((n) => n.id === item.id) + 1;

    return rPos;
  };

  const handleProjectChange = (event, setFieldValue) => {
    const {
      target: { value },
    } = event;
    const project = projects.find((p) => p.id === value);
    const noteTypes = project.note_types;

    let newNoteTypeId = "";

    if (noteTypes && noteTypes.length) {
      newNoteTypeId = noteTypes[0].id;
    }

    setFieldValue("projectId", project.id);
    setFieldValue("noteTypeId", newNoteTypeId);
    setFieldValue("relativeSortPosition", 1);
  };

  const noteTypeOptions = (projectId) => {
    const project = projects.find((p) => p.id === projectId);

    if (!project || !project.note_types || !project.note_types.length) {
      return [];
    }

    return project.note_types.map((nt) => (
      <MenuItem key={nt.id} value={nt.id}>
        {nt.name}
      </MenuItem>
    ));
  };

  const projectOptions = projects.map((p) => (
    <MenuItem key={p.id} value={p.id}>
      {p.name}
    </MenuItem>
  ));

  return (
    <div className="move-note">
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
        <div className="p-4 w-80">
          <div className="mb-4">Move Note</div>
          <Formik
            initialValues={{
              projectId: projects.find((p) =>
                p.note_types.find((nt) => nt.id === item.note_type.id)
              ).id,
              noteTypeId: item.note_type.id,
              relativeSortPosition: getInitialRelativeSortPosition(),
            }}
            onSubmit={handleFormSubmit}
            validationSchema={formSchema}
          >
            {({ errors, handleChange, setFieldValue, touched, values }) => (
              <Form>
                <SelectInput
                  containerClassName="mb-2"
                  errors={errors}
                  label="Project"
                  name="projectId"
                  options={projectOptions}
                  onChange={(e) => handleProjectChange(e, setFieldValue)}
                  touched={touched}
                  value={values.projectId}
                />
                <div className="flex">
                  <div className="flex-1">
                    <SelectInput
                      containerClassName="mb-2"
                      errors={errors}
                      label="List"
                      name="noteTypeId"
                      options={noteTypeOptions(values.projectId)}
                      onChange={handleChange}
                      touched={touched}
                      value={values.noteTypeId}
                    />
                  </div>
                  <div className="w-20 ml-2">
                    <SelectInput
                      containerClassName="mb-2"
                      errors={errors}
                      label="Position"
                      name="relativeSortPosition"
                      options={getSortPositionOptions(values.noteTypeId)}
                      onChange={handleChange}
                      touched={touched}
                      value={values.relativeSortPosition}
                    />
                  </div>
                </div>
                <div className="flex">
                  <Button
                    className="mr-2"
                    disabled={updating}
                    primary
                    type="submit"
                  >
                    Save Changes
                  </Button>
                  <Button className="hover:bg-gray-100" onClick={closeMenu}>
                    Cancel
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </Popover>
    </div>
  );
}
