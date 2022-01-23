import * as yup from "yup";

export const titleValidator = yup
  .string()
  .required("Your note needs a title")
  .trim();
