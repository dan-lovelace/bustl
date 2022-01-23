import React, { useState } from "react";
import { Form, Formik } from "formik";

import cx from "lib/classnames";
import { useUpdateNoteBodyMutation } from "lib/gql/mutations/note";

import Button from "components/Button/Button";
import TextAreaInput from "components/Form/TextAreaInput";
import Markdown from "components/Markdown/Markdown";
import toast from "components/Notification/toastMessage";

export default function NoteDetailsBody({ darker, item }) {
  const [editing, setEditing] = useState(false);
  const [updateNoteBody, { loading }] = useUpdateNoteBodyMutation();

  const handleCancelClick = () => {
    // update editing state
    setEditing(false);
  };

  const handleFocus = () => {
    if (loading) {
      // remove focus if loading
      document.activeElement.blur();
    } else {
      // begin editing otherwise
      setEditing(true);
    }
  };

  const handleFormSubmit = (values, { setFieldError }) => {
    // noop if loading
    if (loading) return;

    // mutation params
    const params = {
      variables: {
        id: item.id,
        body: values.body,
      },
    };

    // mutation with network catch handler
    updateNoteBody(params).catch((e) => handleNetworkError(e, setFieldError));

    // reset ui state
    setEditing(false);
  };

  const handleNetworkError = (error, setFieldError) => {
    // display a toast notification
    toast.error(error.toString(), { autoClose: false });

    // update form body field error state
    setFieldError("body", error.toString());

    // enable editing
    setEditing(true);
  };

  const startEditing = () => {
    // noop if loading
    if (loading) return;

    // update editing state
    setEditing(true);
  };

  return (
    <div>
      <div className="flex items-center h-8 mb-1">
        <div className={cx("text-lg", "font-bold")}>Description</div>
        {!editing && (
          <Button
            className={cx(
              "ml-4",
              darker ? "hover:bg-gray-200" : "hover:bg-gray-100"
            )}
            onClick={startEditing}
            short
          >
            Edit
          </Button>
        )}
      </div>
      {editing ? (
        <Formik
          initialValues={{
            body: item.body,
          }}
          onSubmit={handleFormSubmit}
        >
          {({ errors, handleChange, touched, values }) => (
            <Form>
              <TextAreaInput
                containerClassName={cx(
                  "note-body",
                  "px-2",
                  "mb-2",
                  "border-2",
                  "transition-colors",
                  "rounded",
                  editing
                    ? "bg-white border-blue-600"
                    : "bg-gray-100 border-gray-100"
                )}
                allowTabs
                errors={errors}
                naked
                name="body"
                onChange={handleChange}
                onFocus={handleFocus}
                placeholder="Add a description"
                touched={touched}
                value={values.body}
              />
              <div className="flex">
                <Button className="mr-2" primary type="submit">
                  Save
                </Button>
                <Button
                  className={cx(
                    darker ? "hover:bg-gray-200" : "hover:bg-gray-100"
                  )}
                  onClick={handleCancelClick}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      ) : (
        <div className="cursor-pointer" onClick={startEditing}>
          {item.body.length > 0 ? (
            <div className="mt-3.5">
              <Markdown source={item.body} />
            </div>
          ) : (
            <div
              className={cx(
                "rounded",
                "border-2",
                "h-28",
                "px-2 py-1.5",
                darker
                  ? "border-gray-200 bg-gray-200 hover:bg-gray-300"
                  : "border-gray-100 bg-gray-100 hover:bg-gray-200"
              )}
            >
              Add a description
            </div>
          )}
        </div>
      )}
    </div>
  );
}
