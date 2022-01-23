import React, { useEffect, useRef, useState } from "react";
import { useApolloClient } from "@apollo/client";

import cx from "lib/classnames";
import { useCreateBoardMutation } from "lib/gql/mutations/board";
import { SUBSCRIPTION_USAGE_QUERY } from "lib/gql/queries/appUser";
import imageData from "datastore/image";

import UploadIcon from "components/Icons/UploadIcon";
import toast from "components/Notification/toastMessage";

const fileUploadId = "imagesUpload";

function FilePicker({
  className,
  icon: Icon = UploadIcon,
  iconColor,
  iconOnly = false,
  loading = false,
  onChange,
}) {
  const showLoading = loading;

  return (
    <div
      className={cx("flex items-center justify-center", "create-board-button")}
    >
      {/* the input must be rendered before the label here to support keyboard accessibility */}
      <input
        id={fileUploadId}
        name={fileUploadId}
        type="file"
        onChange={onChange}
        accept="image/jpeg,image/png" // this also shows a "take picture" option on mobile
        multiple
      />
      <label
        className={cx(
          "flex items-center justify-center lg:justify-start",
          "p-3",
          "mr-1",
          "w-12 h-12 md:w-auto",
          "rounded-full",
          "hover:bg-gray-100",
          "cursor-pointer",
          showLoading && "pointer-events-none cursor-not-allowed",
          className
        )}
        htmlFor={fileUploadId}
      >
        <span
          className={cx(
            "flex items-center justify-center",
            "transition-all",
            !iconOnly && "md:w-24"
          )}
        >
          <Icon
            className={cx("transition-all ease-in")}
            color={iconColor}
            style={showLoading ? { scale: 0, position: "inline" } : {}}
            size="sm"
          />
          {!iconOnly && (
            <span
              className={cx(
                "hidden md:inline px-3 text-sm",
                showLoading && "animate-pulse"
              )}
            >
              {showLoading ? "Uploading..." : "Upload"}
            </span>
          )}
        </span>
      </label>
    </div>
  );
}

function FileStatusWrapper({ files, onComplete }) {
  const client = useApolloClient();
  const [createBoard] = useCreateBoardMutation();
  const uploadStartToastId = useRef(null);

  useEffect(() => {
    async function uploadFiles() {
      const promises = files.map((file) =>
        new Promise(async (res, rej) => {
          try {
            // create image object with file
            const imageId = await imageData(client, "CREATE_WITH_FILE", {
              file,
            });

            // create board object with new image id
            const boardMutation = await createBoard({
              variables: {
                input: {
                  image_id: imageId,
                },
              },
            });

            const {
              data: {
                createBoard: { id: boardId },
              },
            } = boardMutation;

            res({
              file,
              data: { boardId, imageId },
            });
          } catch (error) {
            rej({
              file,
              error,
            });
          }
        }).catch((err) => err)
      );

      const results = await Promise.all(promises).catch(() => promises);

      toast.dismiss(uploadStartToastId.current);
      onComplete(results);
    }

    uploadStartToastId.current = toast.info(
      <span className={cx("animate-pulse")}>Uploading files...</span>,
      {
        autoClose: false,
        toastId: "upload-started",
      }
    );
    uploadFiles();
  }, []); // eslint-disable-line

  return false;
}

function CreateBoardButton({ className, icon, iconColor, iconOnly }) {
  const client = useApolloClient();
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = async (event) => {
    event.preventDefault();
    const {
      target: { files },
    } = event;

    // even with server-side validation, check usage information to show helpful messaging
    await client
      .query({
        query: SUBSCRIPTION_USAGE_QUERY,
        fetchPolicy: "network-only",
      })
      .then(
        ({
          data: {
            me: {
              subscription: {
                usage: {
                  image_upload_request_monthly: {
                    current,
                    flag: { value: total },
                  },
                },
              },
            },
          },
        }) => {
          const allowed = total - current;

          if (files.length > allowed) {
            toast.info(
              allowed > 0
                ? `Your subscription plan only allows ${allowed} more upload${
                    allowed > 1 ? "s" : ""
                  } for the current 30 day period. Please select fewer files and try again.`
                : "Your subscription plan does not allow any more uploads for the current 30 day period. You may wait before uploading more photos or upgrade to increase your upload limit. Please contact support for any help.",
              { autoClose: false }
            );
          } else {
            setSelectedFiles([...files]);
          }
        }
      )
      .catch(handleNetworkError);
  };

  const handleNetworkError = (error) => {
    toast.error(error.toString());
  };

  const handleUploadComplete = (results) => {
    results.forEach((result) => {
      const { error, file } = result;

      if (error !== undefined) {
        toast.error(
          `${file.name} failed to upload: ${error.message || error.toString()}`
        );
      } else {
        toast.success(`${file.name} added successfully!`);
      }
    });

    setSelectedFiles([]);
  };

  const uploading = !!(selectedFiles && selectedFiles.length > 0);

  return (
    <div className="create-board-button">
      <FilePicker
        className={className}
        icon={icon}
        iconColor={iconColor}
        iconOnly={iconOnly}
        onChange={handleFileChange}
        loading={uploading}
      />
      {uploading && (
        <FileStatusWrapper
          files={selectedFiles}
          onComplete={handleUploadComplete}
        />
      )}
    </div>
  );
}

export default CreateBoardButton;
