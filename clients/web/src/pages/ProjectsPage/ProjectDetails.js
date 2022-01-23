import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

import cx from "lib/classnames";
import { useProjectQuery } from "lib/gql/queries";

import ProjectNoteTypes from "./ProjectNoteTypes";
import Spinner from "components/Loader/Spinner";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const { data, error, loading } = useProjectQuery(projectId);

  useEffect(() => {
    const ele = document.querySelector(".page-content");

    ele.classList.add("bg-blue-950");

    return () => {
      ele.classList.remove("bg-blue-950");
    };
  });

  if (error) return `Error ${error}`;

  const { project: dataProject } = data || {};

  return (
    <div className={cx("project-details-data", "h-full")}>
      {loading ? (
        <div className="px-1 py-2">
          <Spinner color="white" />
        </div>
      ) : (
        <ProjectNoteTypes project={dataProject} />
      )}
    </div>
  );
}
