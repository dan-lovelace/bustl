import React from "react";
import { Form, Formik } from "formik";
import MenuItem from "@material-ui/core/MenuItem";
import * as yup from "yup";

import { useUpdateNoteTypeMutation } from "lib/gql/mutations/noteType";
import { GET_PROJECT, useUpdateNoteTypeQuery } from "lib/gql/queries";

import Button from "components/Button/Button";
import SelectInput from "components/Form/SelectInput";
import TextInput from "components/Form/TextInput";
import Modal from "components/Modal/Modal";
import toast from "components/Notification/toastMessage";

const formSchema = yup.object().shape({
  name: yup.string().required("This list needs a name"),
  sort_position: yup
    .number()
    .min(0)
    .required("This list needs a sort position"),
});

export default function UpdateNoteTypeModal({ item, projectId, setEditing }) {
  const [updateNoteType, { loading: updating }] = useUpdateNoteTypeMutation();
  const {
    data: noteTypeQueryData,
    // error: noteTypeQueryError,
    // loading: noteTypeQueryLoading,
  } = useUpdateNoteTypeQuery({
    // fetchPolicy: "network-only",
    skip: updating,
    variables: { id: item.id },
  });

  if (
    !noteTypeQueryData ||
    !noteTypeQueryData.projects ||
    !noteTypeQueryData.note_type
  ) {
    return false;
  }
  const { projects } = noteTypeQueryData;
  const currentProject =
    projects && projects.length > 0 && projects.find((p) => p.id === projectId);
  const defaultRelativeSortPosition =
    currentProject &&
    currentProject.note_types &&
    currentProject.note_types.length > 0 &&
    currentProject.note_types.findIndex((i) => i.id === item.id);

  const handleCancelClick = () => {
    setEditing(false);
  };

  const handleFormSubmit = (values) => {
    // noop if updating
    if (updating) return;

    const { projectId: valuesProjectId } = values;
    const selectedProject = projects.find((p) => p.id === valuesProjectId);
    const { note_types } = selectedProject;
    const newRelativePosition = parseInt(values.relativeSortPosition, 10);
    const itemAtNewPosition =
      note_types &&
      note_types.find((i, idx) => idx + 1 === newRelativePosition);

    // calculate the absolute sort position value to use for the mutation
    let submitSortPosition;
    if (!itemAtNewPosition) {
      // no item at position, add to the end of the target list
      let toUse = 1; // default to first position

      if (note_types.length) {
        // existing note types exist, find the highest absolute sort position value
        const noteTypes = [...note_types];
        const sorted = noteTypes.sort(
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
          project_id: valuesProjectId,
          name: values.name,
          sort_position: submitSortPosition,
        },
      },
      update(cache) {
        // invalidate new project note_types
        cache.modify({
          id: cache.identify({ __ref: `Project:${selectedProject.id}` }),
          fields: {
            note_types(existing = [], { DELETE }) {
              return DELETE;
            },
          },
        });
      },
    };

    // refetch current project details if item was moved to easily handle resorting/removal
    if (
      selectedProject.id !== projectId ||
      submitSortPosition !== item.sort_position
    ) {
      params.refetchQueries = [
        {
          query: GET_PROJECT,
          variables: {
            id: projectId,
          },
        },
      ];
    }

    // execute mutation
    updateNoteType(params).catch(handleNetworkError);

    // reset ui state
    setEditing(false);
  };

  const handleNetworkError = (error) => {
    toast.error(error.toString(), { autoClose: false });
  };

  const projectOptions = projects.map((p) => (
    <MenuItem key={p.id} value={p.id}>
      {p.name}
    </MenuItem>
  ));

  const getSortPositionOptions = (pId) => {
    const project = projects.find((p) => p.id === pId);
    const { note_types: projectNoteTypes } = project;

    if (!projectNoteTypes || !projectNoteTypes.length) {
      return <MenuItem value="1">1</MenuItem>;
    } else {
      const noteTypes = [...projectNoteTypes];
      const sorted = noteTypes.sort(
        (a, b) => a.sort_position - b.sort_position
      );
      const indexed = sorted.map((p, idx) => ({
        ...p,
        relativeSortPosition: idx + 1,
      }));

      if (pId !== projectId) {
        indexed.push({
          relativeSortPosition: projectNoteTypes.length + 1,
        });
      }

      return indexed.map((i, idx) => (
        <MenuItem key={idx} value={i.relativeSortPosition}>
          {i.relativeSortPosition}
        </MenuItem>
      ));
    }
  };

  return (
    <Modal
      centerVertical
      hideClose
      onClose={handleCancelClick}
      size="xs"
      type="dialog"
    >
      <div className="update-note-type-modal">
        {/* Data: {JSON.stringify(noteTypeQueryData, null, 2)} */}
        <div className="mb-4">Editing list: {item.name}</div>

        <div className="">
          <div className="text-lg mb-2">Details</div>
          <Formik
            initialValues={{
              ...item,
              projectId,
              relativeSortPosition: defaultRelativeSortPosition + 1,
            }}
            onSubmit={handleFormSubmit}
            validationSchema={formSchema}
          >
            {({ errors, handleChange, touched, values }) => (
              <Form>
                <TextInput
                  containerClassName="mb-2"
                  errors={errors}
                  label="Name"
                  name="name"
                  onChange={handleChange}
                  placeholder="Name"
                  touched={touched}
                  value={values.name}
                />
                <div className="flex">
                  <div className="flex-1">
                    <SelectInput
                      containerClassName="mb-2"
                      errors={errors}
                      label="Project"
                      name="projectId"
                      options={projectOptions}
                      onChange={handleChange}
                      touched={touched}
                      value={values.projectId}
                    />
                  </div>
                  <div className="w-20 ml-2">
                    <SelectInput
                      containerClassName="mb-2"
                      errors={errors}
                      label="Position"
                      name="relativeSortPosition"
                      options={getSortPositionOptions(values.projectId)}
                      // options={indexedItems.map((i) => (
                      //   <MenuItem key={i.id} value={i.sort_position}>
                      //     {i.sort_position}
                      //   </MenuItem>
                      // ))}
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
                  <Button
                    className="hover:bg-gray-200"
                    onClick={handleCancelClick}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        {/* <div className="">
          <div className="text-lg mb-2">Danger Zone</div>
        </div> */}
      </div>
    </Modal>
  );
}
