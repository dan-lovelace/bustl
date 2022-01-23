import React from "react";
import { Form, Formik } from "formik";
import * as yup from "yup";

import cx from "lib/classnames";
import { useProjectDetailsCreateNoteMutation } from "lib/gql/mutations/note";
import { isEnterKey } from "lib/keyboard";
import { cleanupTitle } from "lib/note";
import { titleValidator } from "lib/validations";

import Button from "components/Button/Button";
import PlusIcon from "components/Icons/PlusIcon";
import TextAreaInput from "components/Form/TextAreaInput";
import Spinner from "components/Loader/Spinner";
import toast from "components/Notification/toastMessage";
import FieldError from "components/Form/FieldError";

const formSchema = yup.object().shape({
  title: titleValidator,
});

export default function CreateNote({ creating, noteTypeId, setCreating }) {
  const [createNote, { loading: creatingNote }] =
    useProjectDetailsCreateNoteMutation();

  const handleCancelClick = () => {
    setCreating(false);
  };

  const handleKeyDown = (event, handleSubmit) => {
    if (isEnterKey(event)) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleFormSubmit = (values) => {
    if (creatingNote) return;

    // clean up title string
    const { title } = values;
    const cleanTitle = cleanupTitle(title);

    const params = {
      variables: {
        input: {
          note_type_id: noteTypeId,
          title: cleanTitle,
        },
      },
    };

    // mutate and catch any network errors
    createNote(params).catch(handleNetworkError);

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
        "create-note-form",
        "w-full",
        "bg-gray-100",
        "pt-0.5", // some amount top padding needed because of bleeding on vertical overflow
        "mb-2 pl-2 pr-2"
      )}
    >
      <Formik
        initialValues={{
          title: "",
        }}
        onSubmit={handleFormSubmit}
        validationSchema={formSchema}
      >
        {({ errors, handleChange, handleSubmit, touched, values }) => (
          <Form>
            <div
              className={cx("bg-white", "px-2", "mb-2", "rounded", "shadow-md")}
            >
              <TextAreaInput
                autoFocus
                naked
                name="title"
                onChange={handleChange}
                onKeyDown={(event) => handleKeyDown(event, handleSubmit)}
                placeholder="New note's title"
                startingRows={1}
                touched={touched}
                value={values.title}
              />
              {errors && errors.title && (
                <div className="pb-2">
                  <FieldError>{errors.title}</FieldError>
                </div>
              )}
            </div>
            <div className={cx("flex")}>
              <Button
                className="mr-2"
                disabled={creatingNote}
                primary
                type="submit"
              >
                {creatingNote ? "Creating note..." : "Add Note"}
              </Button>
              <Button className="hover:bg-gray-200" onClick={handleCancelClick}>
                Cancel
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  ) : (
    <div
      className={cx(
        "create-note-button",
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
      {creatingNote ? (
        <div className="flex items-center p-2">
          <Spinner color="blue" />
        </div>
      ) : (
        <>
          <PlusIcon className="mr-2" /> New note
        </>
      )}
    </div>
  );
}
