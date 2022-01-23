import React, { useState } from "react";
import { Form, Formik } from "formik";
import * as yup from "yup";
import { useApolloClient } from "@apollo/client";

import { useDeleteProjectMutation } from "lib/gql/mutations/project";

import Button from "components/Button/Button";
import TrashIcon from "components/Icons/TrashIcon";
import TextInput from "components/Form/TextInput";
import Modal from "components/Modal/Modal";
import toast from "components/Notification/toastMessage";
import { ALERT_DANGER_CLASS_NAME } from "components/Typography/Alert";

const popoverId = "delete-project-popover";

const formSchema = yup.object().shape({
  input: yup
    .string()
    .matches(/^(delete)$/i, `Type "delete" to confirm deletion`)
    .required("Please confirm if you wish to continue"),
});

export default function DeleteProject({ item }) {
  const client = useApolloClient();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteProject, { error, loading }] = useDeleteProjectMutation();

  if (loading) return "Deleting...";
  if (error) return `Error ${error}`;

  const handleConfirmDelete = () => {
    deleteProject({
      variables: { id: confirmingDelete.id },
    })
      .then(() => {
        // reset the whole store because there are so many other things potentially in cache
        client.resetStore();
      })
      .catch(handleNetworkError);
  };

  const handleDeleteClick = (event) => {
    setConfirmingDelete(item);
  };

  const handleNetworkError = (error) => {
    toast.error(error.toString(), { autoClose: false });
  };

  const handleModalClose = () => {
    setConfirmingDelete(false);
  };

  return (
    <div className="flex">
      <Button
        aria-describedby={popoverId}
        className="bg-red-100 hover:bg-red-200 text-red-900"
        onClick={handleDeleteClick}
        short
      >
        <TrashIcon className="mr-2" color="text-red-900" /> Delete Project
      </Button>

      {confirmingDelete && (
        <Modal
          className={ALERT_DANGER_CLASS_NAME}
          hideClose
          onClose={handleModalClose}
          size="xs"
          type="dialog"
        >
          <div className="mb-4">
            Are you sure you want to delete the project "{item.name}"?
          </div>
          <div className="text-sm">
            <p className="mb-4">
              <span>
                This will permanently delete all lists and notes associated with
                this project.
              </span>{" "}
              <span className="text-red-600 font-bold underline">
                You will not be able to get them back.
              </span>{" "}
            </p>
            <p className="mb-4">
              Do you wish to proceed? Type "
              <span className="italic">delete</span>" below to confirm.
            </p>{" "}
          </div>
          <Formik
            initialValues={{ input: "" }}
            validationSchema={formSchema}
            onSubmit={handleConfirmDelete}
          >
            {({ errors, handleChange, touched, values }) => (
              <Form>
                <TextInput
                  containerClassName="mb-2"
                  errors={errors}
                  name="input"
                  onChange={handleChange}
                  placeholder={`Type "delete" to confirm...`}
                  touched={touched}
                  value={values.input}
                />
                <div className="flex">
                  <Button className="mr-2" type="submit" primary>
                    Delete Project
                  </Button>
                  <Button
                    className="hover:bg-red-200"
                    onClick={handleModalClose}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal>
      )}
    </div>
  );
}
