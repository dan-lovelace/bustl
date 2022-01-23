import React from "react";
import { Form, Formik } from "formik";
import * as yup from "yup";

import cx from "lib/classnames";
import { cacheCreateProjectNoteType } from "lib/gql/cache/noteType";
import { useCreateNoteTypeMutation } from "lib/gql/mutations/noteType";

import Button from "components/Button/Button";
import TextInput from "components/Form/TextInput";
import Modal from "components/Modal/Modal";
import toast from "components/Notification/toastMessage";

const formSchema = yup.object().shape({
  name: yup.string().required("Your new list needs a name"),
});

export default function CreateNoteTypeModal({ projectId, setCreating }) {
  const [createNoteType, { loading: creatingNoteType }] =
    useCreateNoteTypeMutation();

  const closeModal = () => {
    setCreating(false);
  };

  const onCompleted = (event) => {
    closeModal();
  };

  const handleFormSubmit = (values) => {
    // mutation params
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
      onCompleted,
    };

    // call mutation with error handler
    createNoteType(params).catch(handleNetworkError);

    // reset ui state
    setCreating(false);
  };

  const handleNetworkError = (error) => {
    toast.error(error.toString());
  };

  return (
    <Modal
      centerVertical
      hideClose
      onClose={closeModal}
      size="xs"
      type="dialog"
    >
      <div>
        <div className="mb-4">New List</div>
        <Formik
          initialValues={{ name: "" }}
          onSubmit={handleFormSubmit}
          validationSchema={formSchema}
        >
          {({ errors, handleChange, touched, values }) => (
            <Form>
              <TextInput
                autoFocus
                containerClassName="mb-2"
                errors={errors}
                name="name"
                onChange={handleChange}
                placeholder="List name"
                touched={touched}
                value={values.name}
              />
              <div className={cx("flex")}>
                <Button
                  className="mr-2"
                  disabled={creatingNoteType}
                  primary
                  type="submit"
                >
                  Create List
                </Button>
                <Button className="hover:bg-gray-200" onClick={closeModal}>
                  Cancel
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
}
