import React, { useState } from "react";
import { Form, Formik } from "formik";
import * as yup from "yup";

import cx from "lib/classnames";
import { useUpdateNoteTitleMutation } from "lib/gql/mutations/note";
import { isEnterKey } from "lib/keyboard";
import { cleanupTitle } from "lib/note";
import { titleValidator } from "lib/validations";

import Button from "components/Button/Button";
import TextAreaInput from "components/Form/TextAreaInput";
import toast from "components/Notification/toastMessage";

const updateSchema = yup.object().shape({
  title: titleValidator,
});

export default function NoteDetailsTitle({ item }) {
  const [editing, setEditing] = useState(false);
  const [updateNoteTitle, { loading }] = useUpdateNoteTitleMutation();

  const handleBlur = (values, handleSubmit) => {
    // noop if loading
    if (loading) return;

    const { title } = values;
    if (title !== item.title) {
      // submit if title has changed
      handleSubmit();
    } else {
      // just stop editing otherwise
      setEditing(false);
    }
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

  const handleKeyDown = (event) => {
    // react to the enter key for desktop users
    if (isEnterKey(event)) {
      // prevent newlines
      event.preventDefault();

      // blur the input to trigger submission logic
      document.activeElement.blur();
    }
  };

  const handleFormSubmit = (values, { setFieldError }) => {
    // noop if loading
    if (loading) return;

    // clean up title string
    const { title } = values;
    const cleanTitle = cleanupTitle(title);

    // mutation params
    const params = {
      variables: {
        id: item.id,
        title: cleanTitle,
      },
    };

    // mutation with network catch handler
    updateNoteTitle(params).catch((e) => handleNetworkError(e, setFieldError));

    // reset ui states
    setEditing(false);
    document.activeElement.blur();
  };

  const handleNetworkError = (error, setFieldError) => {
    // display a toast notification
    toast.error(error.toString(), { autoClose: false });

    // update form title field error state
    setFieldError("title", error.toString());

    // enable editing
    setEditing(true);
  };

  return (
    <div>
      <Formik
        initialValues={{
          title: item.title,
        }}
        onSubmit={handleFormSubmit}
        validationSchema={updateSchema}
      >
        {({ errors, handleChange, handleSubmit, touched, values }) => (
          <Form>
            <div
              className={cx(
                "px-2",
                errors.title && "pb-2",
                "border-2",
                "transition-colors",
                "rounded",
                editing
                  ? "bg-white border-blue-600"
                  : "bg-gray-100 border-gray-100"
              )}
            >
              <TextAreaInput
                boldFont
                containerClassName={cx()}
                errors={errors}
                naked
                name="title"
                onBlur={() => handleBlur(values, handleSubmit)}
                onChange={handleChange}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                placeholder="Title"
                spellCheck={editing ? true : false}
                startingRows={1}
                textSize="lg"
                touched={touched}
                value={values.title}
              />
            </div>
            <Button className="hidden" disabled={loading} type="submit" />
          </Form>
        )}
      </Formik>
    </div>
  );
}
