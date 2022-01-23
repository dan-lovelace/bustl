import React, { useState } from "react";
import { Form, Formik } from "formik";
import MenuItem from "@material-ui/core/MenuItem";
import * as yup from "yup";

import { useUpdateProjectMutation } from "lib/gql/mutations/project";
import { GET_PROJECTS } from "lib/gql/queries";

import DeleteMyProject from "./DeleteMyProject";
import Button from "components/Button/Button";
import IconButton from "components/Button/IconButton";
import SelectInput from "components/Form/SelectInput";
import TextInput from "components/Form/TextInput";
import CogIcon from "components/Icons/CogIcon";
import Modal from "components/Modal/Modal";
import toast from "components/Notification/toastMessage";

const editSchema = yup.object().shape({
  name: yup.string().required("This project needs a name"),
  relativeSortPosition: yup
    .number()
    .min(0)
    .required("This project needs a sort position"),
});

export default function EditProject({ indexedItems, item }) {
  const [editing, setEditing] = useState(false);
  const [updateProject, { error, loading }] = useUpdateProjectMutation();
  const handleEditClick = () => {
    setEditing(true);
  };

  if (error) return `Error ${error}`;

  const handleFormSubmit = (values) => {
    // noop if loading
    if (loading) return;

    const params = {
      variables: {
        id: item.id,
        input: {
          name: values.name,
        },
      },
    };

    // set sort_position default submission value to item's current sort_position
    let submitSortPosition = item.sort_position;

    // compare new position with current
    const newRelativePosition = parseInt(values.relativeSortPosition, 10);
    if (newRelativePosition !== item.relativeSortPosition) {
      // sort position changed, convert position from relative to absolute value
      const currentItemAtPosition = indexedItems.find(
        (i) => i.relativeSortPosition === newRelativePosition
      );

      submitSortPosition = currentItemAtPosition.sort_position;

      // refetch projects after update to resort things. maybe optimize this later..
      params.refetchQueries = [{ query: GET_PROJECTS }];
    }

    // set sort_position input
    params.variables.input.sort_position = submitSortPosition;

    // call mutation
    updateProject(params).catch(handleNetworkError);

    // reset ui state
    setEditing(false);
  };

  const handleNetworkError = (error) => {
    toast.error(error.toString(), { autoClose: false });
  };

  const handleModalClose = () => {
    setEditing(false);
  };

  return (
    <div className="edit-project">
      <IconButton size="sm" onClick={() => handleEditClick(item)} short>
        <CogIcon />
      </IconButton>

      {editing && (
        <Modal hideClose onClose={handleModalClose} size="xs" type="dialog">
          <div className="mb-4">Editing project: {item.name}</div>

          <div className="mb-8">
            <div className="text-lg mb-2">Details</div>
            <Formik
              onSubmit={handleFormSubmit}
              initialValues={item}
              validationSchema={editSchema}
            >
              {({ errors, handleChange, touched, values }) => (
                <Form>
                  <div className="flex">
                    <div className="flex-1">
                      <TextInput
                        autoFocus
                        containerClassName="mb-2"
                        errors={errors}
                        label="Name"
                        name="name"
                        onChange={handleChange}
                        placeholder="Project name"
                        required
                        touched={touched}
                        value={values.name}
                      />
                    </div>
                    <div className="w-20 ml-2">
                      <SelectInput
                        containerClassName="mb-2"
                        errors={errors}
                        label="Position"
                        name="relativeSortPosition"
                        options={indexedItems.map((i) => (
                          <MenuItem key={i.id} value={i.relativeSortPosition}>
                            {i.relativeSortPosition}
                          </MenuItem>
                        ))}
                        onChange={handleChange}
                        touched={touched}
                        value={values.relativeSortPosition}
                      />
                    </div>
                  </div>
                  <div className="flex">
                    <Button
                      className="mr-2"
                      disabled={loading}
                      primary
                      type="submit"
                    >
                      Save Changes
                    </Button>
                    <Button
                      className="hover:bg-gray-200"
                      onClick={handleModalClose}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          <div className="">
            <div className="text-lg mb-2">Danger Zone</div>
            <DeleteMyProject item={item} />
          </div>
        </Modal>
      )}
    </div>
  );
}
