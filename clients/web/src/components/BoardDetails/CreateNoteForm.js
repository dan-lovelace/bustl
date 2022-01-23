import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";

import { NEW_NOTE_KEY } from "./lib/utils";
import cx from "lib/classnames";
import { useCreateBoardMarkerMutation } from "lib/gql/mutations/boardMarker";
import { useBoardDetailsCreateNoteMutation } from "lib/gql/mutations/note";
import { useCreateNoteQuery } from "lib/gql/queries/note";
import { titleValidator } from "lib/validations";

import Button from "components/Button/Button";
import SelectInput from "components/Form/SelectInput";
import TextInput from "components/Form/TextInput";
import TextAreaInput from "components/Form/TextAreaInput";
import toast from "components/Notification/toastMessage";
import CreateProjectModal from "components/CreateProjectModal/CreateProjectModal";
import CreateNoteTypeModal from "components/CreateNoteTypeModal/CreateNoteTypeModal";
import Spinner from "components/Loader/Spinner";
import { MenuItem } from "@material-ui/core";

const formSchema = yup.object().shape({
  projectId: yup
    .number()
    .typeError("Needs a project")
    .required("Needs a project"),
  noteTypeId: yup.number().typeError("Needs a list").required("Needs a list"),
  title: titleValidator,
});

const noteFormClassName = "create-note-form";
const newProjectOptionKey = `new-project-${uuid()}`;
const newNoteTypeOptionKey = `new-note-type-${uuid()}`;

export default function CreateNoteForm({
  cancelNewNote,
  markers,
  onNoteCreated,
}) {
  const [creatingProject, setCreatingProject] = useState(false);
  const [creatingNoteType, setCreatingNoteType] = useState(false);
  const { boardId } = useParams();
  const [createNote, { loading: creatingNote }] =
    useBoardDetailsCreateNoteMutation();
  const [createBoardMarker, { loading: creatingBoardMarker }] =
    useCreateBoardMarkerMutation();
  const { data, error, loading } = useCreateNoteQuery();

  if (loading) return <Spinner />;
  if (error) return `Error: ${error.toString()}`;

  const { projects: dataProjects } = data;
  const projects = dataProjects || [];
  const { id: firstProjectId, note_types: firstProjectNoteTypes } =
    projects && projects.length > 0 ? projects[0] : {};
  const initialFormValues = {
    projectId: firstProjectId || null,
    noteTypeId:
      firstProjectNoteTypes && firstProjectNoteTypes.length > 0
        ? firstProjectNoteTypes[0].id
        : null,
    title: "",
    body: "",
  };

  const handleCancelClick = () => {
    cancelNewNote();
  };

  const handleFormSubmit = async (values) => {
    const noteParams = {
      variables: {
        input: {
          note_type_id: values.noteTypeId,
          title: values.title,
          body: values.body,
        },
      },
    };

    const noteResult = await createNote(noteParams).catch(handleCreateError);
    if (noteResult && noteResult.data && noteResult.data.createNote) {
      const {
        data: {
          createNote: { id: noteId },
        },
      } = noteResult;
      const newNoteMarker = markers.find((m) => m.note_key === NEW_NOTE_KEY);
      const boardMarkerParams = {
        variables: {
          input: {
            board_id: boardId,
            x_position: Math.round(newNoteMarker.x_position),
            y_position: Math.round(newNoteMarker.y_position),
            marker_type: newNoteMarker.marker_type,
            hidden: newNoteMarker.hidden,

            note_id: noteId,
          },
        },
      };

      createBoardMarker(boardMarkerParams).catch(handleCreateError);

      // reset ui states
      onNoteCreated();
    }
  };

  const handleCreateError = (error) => {
    toast.error(error.toString());
  };

  const handleNoteTypeChange = (changeFn) => (event) => {
    const {
      target: { value },
    } = event;

    if (value === newNoteTypeOptionKey) {
      setCreatingNoteType(true);
    } else {
      changeFn(event);
    }
  };

  const handleProjectChange = (changeFn) => (event) => {
    const {
      target: { value },
    } = event;

    if (value === newProjectOptionKey) {
      setCreatingProject(true);
    } else {
      const project = projects.find((p) => p.id === value);
      const { note_types } = project;
      const firstNoteType =
        note_types && note_types.length > 0 && note_types[0];
      const newNoteTypeId = firstNoteType ? firstNoteType.id : null;

      changeFn({
        target: {
          name: "noteTypeId",
          value: newNoteTypeId,
        },
      });
      changeFn(event);
    }
  };

  const getNoteTypeOptions = (projectId) => {
    const project = projects.find((p) => p.id === projectId);

    if (!project) {
      return [];
    }

    const noteTypes = project.note_types || [];

    return [
      ...noteTypes.map((nt) => (
        <MenuItem key={nt.id} value={nt.id}>
          {nt.name}
        </MenuItem>
      )),
      <MenuItem key={newNoteTypeOptionKey} value={newNoteTypeOptionKey}>
        + Create New List
      </MenuItem>,
    ];
  };

  const projectOptions = [
    ...projects.map((p) => (
      <MenuItem key={p.id} value={p.id}>
        {p.name}
      </MenuItem>
    )),
    <MenuItem key={newProjectOptionKey} value={newProjectOptionKey}>
      + Create New Project
    </MenuItem>,
  ];

  return (
    <div className={cx(noteFormClassName)}>
      {/* <div className="mb-2 font-bold">New note</div> */}
      <Formik
        initialValues={initialFormValues}
        validationSchema={formSchema}
        onSubmit={handleFormSubmit}
      >
        {({ errors, handleChange, touched, values }) => (
          <>
            <Form>
              <div className="font-bold mb-2">New Note</div>
              <div className="flex mb-2">
                <SelectInput
                  label="Project"
                  name="projectId"
                  value={values.projectId}
                  onChange={handleProjectChange(handleChange)}
                  options={projectOptions}
                  errors={errors}
                  touched={touched}
                  required
                />
                <SelectInput
                  containerClassName="ml-2"
                  label="List"
                  name="noteTypeId"
                  value={values.noteTypeId}
                  onChange={handleNoteTypeChange(handleChange)}
                  options={getNoteTypeOptions(values.projectId)}
                  errors={errors}
                  touched={touched}
                  required
                  disabled={!values.projectId}
                />
              </div>

              <TextInput
                autoFocus
                containerClassName="mb-2"
                errors={errors}
                name="title"
                label="Title"
                value={values.title}
                onChange={handleChange}
                required
                touched={touched}
              />
              <TextAreaInput
                containerClassName="mb-2"
                errors={errors}
                name="body"
                label="Description"
                value={values.body}
                onChange={handleChange}
                touched={touched}
              />
              <div className="flex">
                <Button
                  className="mr-2"
                  disabled={creatingNote || creatingBoardMarker}
                  primary
                  type="submit"
                >
                  Save Note
                </Button>
                <Button onClick={handleCancelClick}>Cancel</Button>
              </div>
            </Form>
            {creatingNoteType && (
              <CreateNoteTypeModal
                projectId={values.projectId}
                setCreating={setCreatingNoteType}
              />
            )}
            {creatingProject && (
              <CreateProjectModal setCreatingProject={setCreatingProject} />
            )}
          </>
        )}
      </Formik>
    </div>
  );
}
