import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import cx from "lib/classnames";

const contextClass = {
  success: "bg-green-600",
  error: "bg-red-600",
  info: "bg-gray-600",
  warning: "bg-orange-400",
  default: "bg-indigo-600",
  dark: "bg-white-600 font-gray-300",
};

export default function NotificationContainer() {
  return (
    <ToastContainer
      position="bottom-left"
      toastClassName={({ type }) =>
        cx(
          "relative flex p-2 min-h-10 rounded justify-between overflow-hidden cursor-pointer mb-1 mx-1",
          contextClass[type || "default"]
        )
      }
    />
  );
}
