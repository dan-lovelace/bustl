import React from "react";
import { Form, Formik } from "formik";
import * as yup from "yup";

import cx from "lib/classnames";
import { useCreateProjectMutation } from "lib/gql/mutations/project";

import Button from "components/Button/Button";
import TextInput from "components/Form/TextInput";
import Modal from "components/Modal/Modal";
import toast from "components/Notification/toastMessage";

const formSchema = yup.object().shape({
  name: yup.string().required("Your new project needs a name"),
});

export default function CreateProjectModal({ setCreatingProject }) {
  const [createProject, { loading: creatingProject }] =
    useCreateProjectMutation();

  const closeNewProjectModal = () => {
    setCreatingProject(false);
  };

  const onCompleted = (event) => {
    closeNewProjectModal();
  };

  const handleNewProjectSubmit = (input) => {
    // mutation params
    const params = {
      variables: { input },
      onCompleted,
    };

    // call mutation with error handler
    createProject(params)
      .then(() => {
        // reset ui state
        setCreatingProject(false);
      })
      .catch(handleNetworkError);
  };

  const handleNetworkError = (error) => {
    toast.error(error.toString());
  };

  return (
    <Modal
      centerVertical
      hideClose
      onClose={closeNewProjectModal}
      size="xs"
      type="dialog"
    >
      <div>
        <div className="mb-4">New Project</div>
        <Formik
          initialValues={{ name: "" }}
          onSubmit={handleNewProjectSubmit}
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
                placeholder="Project name"
                touched={touched}
                value={values.name}
              />
              <div className={cx("flex")}>
                <Button
                  className="mr-2"
                  disabled={creatingProject}
                  primary
                  type="submit"
                >
                  Create Project
                </Button>
                <Button
                  className="hover:bg-gray-200"
                  onClick={closeNewProjectModal}
                >
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
