import React, { useState } from "react";
import { Form, Formik } from "formik";
import * as yup from "yup";

import cx from "lib/classnames";
import { cacheCreateProjectNoteType } from "lib/gql/cache/noteType";

import { useCreateNoteTypeMutation } from "lib/gql/mutations/noteType";

import Button from "components/Button/Button";
import TextInput from "components/Form/TextInput";
import PlusIcon from "components/Icons/PlusIcon";
import Spinner from "components/Loader/Spinner";
import toast from "components/Notification/toastMessage";

const formSchema = yup.object().shape({
  name: yup.string().required("Your list needs a name"),
});

export default function CreateNoteTypeButton({ projectId }) {
  const [creating, setCreating] = useState(false);
  const [createNoteType, { loading: creatingNoteType }] =
    useCreateNoteTypeMutation();

  const handleCancelClick = () => {
    setCreating(false);
  };

  const handleFormSubmit = (values) => {
    const params = {
      variables: {
        input: {
          project_id: projectId,
          name: values.name,
        },
      },
      update(cache, { data: { createNoteType: newNoteType } }) {
        cacheCreateProjectNoteType(cache, newNoteType, projectId);
      },
    };

    // mutate and catch any network errors
    createNoteType(params).catch(handleNetworkError);

    // reset ui states
    setCreating(false);
  };

  const handleCreateClick = () => {
    setCreating(true);
  };

  const handleNetworkError = (error) => {
    toast.error(error.toString());
  };

  return creating ? (
    <div
      className={cx(
        "create-note-type-button",
        "w-full",
        "bg-gray-100",
        "mb-2 pl-2 pt-2 pr-2",
        "rounded"
      )}
    >
      <div className={cx("bg-white", "p-2", "rounded", "shadow-md")}>
        <Formik
          initialValues={{
            name: "",
          }}
          onSubmit={handleFormSubmit}
          validationSchema={formSchema}
        >
          {({ errors, handleChange, touched, values }) => (
            <Form>
              <TextInput
                name="name"
                containerClassName="mb-2"
                autoFocus
                onChange={handleChange}
                value={values.name}
                placeholder="New list's name"
                required
                textSize="xl"
                errors={errors}
                touched={touched}
              />
              <div className={cx("flex")}>
                <Button
                  className="mr-2"
                  disabled={creatingNoteType}
                  primary
                  type="submit"
                >
                  Add List
                </Button>
                <Button onClick={handleCancelClick}>Cancel</Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  ) : (
    <div
      className={cx(
        "flex items-center",
        "w-full",
        "p-2",
        "rounded",
        "hover:bg-gray-200",
        "cursor-pointer",
        "text-sm"
      )}
      onClick={handleCreateClick}
    >
      {creatingNoteType ? (
        <div className="flex items-center p-2">
          <Spinner color="blue" />
        </div>
      ) : (
        <>
          <PlusIcon className="mr-2" /> New list
        </>
      )}
    </div>
  );
}
