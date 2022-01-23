import React from "react";
import { Form, Formik } from "formik";

import { InputLabel } from "@material-ui/core";

import { useCreateContactMessageMutation } from "lib/gql/mutations/contactMessage";

import Button from "components/Button/Button";
import IconButton from "components/Button/IconButton";
import TextAreaInput from "components/Form/TextAreaInput";
import StarOutlineIcon from "components/Icons/StarOutlineIcon";
import StarFilledIcon from "components/Icons/StarFilledIcon";
import Modal from "components/Modal/Modal";
import toast from "components/Notification/toastMessage";
import { contactFormSubjects } from "lib/contact-message";

const ratings = [
  {
    value: 1,
  },
  {
    value: 2,
  },
  {
    value: 3,
  },
  {
    value: 4,
  },
  {
    value: 5,
  },
];

export default function ContactModal({ onClose, variant }) {
  const { copy: modalCopy, label: modalTitle } =
    contactFormSubjects[variant] || {};
  const [createContactMessage, { loading: creatingMessage }] =
    useCreateContactMessageMutation();

  const handleContactClose = () => {
    if (onClose && typeof onClose === "function") {
      onClose();
    }
  };

  const handleFormSubmit = (values) => {
    const params = {
      variables: {
        input: values,
      },
    };

    createContactMessage(params)
      .then(handleNetworkSuccess)
      .catch(handleNetworkError);
  };

  const handleNetworkError = (error) => {
    toast.error(error.toString());
  };

  const handleNetworkSuccess = () => {
    handleContactClose();
    toast.success("Message sent");
  };

  const handleRatingClick = (newValue, formikHandleChange) => () => {
    formikHandleChange({
      target: {
        name: "rating",
        value: newValue,
      },
    });
  };

  return (
    <Modal
      onClose={handleContactClose}
      title={<div className="text-lg font-bold">{modalTitle}</div>}
      type="dialog"
      size="sm"
    >
      <div>
        <div className="mb-4">{modalCopy}</div>
        <Formik
          initialValues={{
            subject: variant,
            body: "",
            rating: null,
          }}
          onSubmit={handleFormSubmit}
        >
          {({ errors, touched, values, handleChange }) => (
            <Form>
              <TextAreaInput
                label="Message"
                name="body"
                errors={errors}
                touched={touched}
                variant="outlined"
                value={values.body}
                onChange={handleChange}
                containerClassName="mb-2"
                required
                autoFocus
              />
              <InputLabel shrink className="mb-1">
                How would you rate your experience with the app today?
              </InputLabel>
              <div className="flex items-center mb-2 w-full">
                {ratings.map((rating, idx) => (
                  <div key={idx}>
                    <IconButton
                      className="hover:bg-gray-200"
                      size="sm"
                      onClick={handleRatingClick(rating.value, handleChange)}
                    >
                      {values.rating < rating.value ? (
                        <StarOutlineIcon className="text-yellow-400" />
                      ) : (
                        <StarFilledIcon className="text-yellow-400" />
                      )}
                    </IconButton>
                  </div>
                ))}
              </div>
              <div className="text-right">
                <Button
                  className="mr-2 hover:bg-gray-200"
                  onClick={handleContactClose}
                >
                  Cancel
                </Button>
                <Button primary type="submit" disabled={creatingMessage}>
                  Submit
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
}
