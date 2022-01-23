import React, { useState } from "react";
import { generatePath, Link, useRouteMatch } from "react-router-dom";

import { useProjectsQuery } from "lib/gql/queries";
import { abbreviateProjectName } from "lib/project";
import { PROJECT_DETAILS_PAGE } from "lib/routes";

import SidebarItem from "./SidebarItem";
import NoteIcon from "components/Icons/NoteIcon";
import PlusIcon from "components/Icons/PlusIcon";
import CreateProjectModal from "components/CreateProjectModal/CreateProjectModal";
import Spinner from "components/Loader/Spinner";

function CreateProjectButton({ sidebarOpen }) {
  const [creatingProject, setCreatingProject] = useState(false);

  const handleNewProjectClick = () => {
    setCreatingProject(true);
  };

  return (
    <>
      <SidebarItem
        expandedText="New project"
        IconComponent={PlusIcon}
        onClick={handleNewProjectClick}
        selected={false}
        sidebarOpen={sidebarOpen}
      />

      {creatingProject && (
        <CreateProjectModal setCreatingProject={setCreatingProject} />
      )}
    </>
  );
}

export default function SidebarProjectList({ handleLinkClick, sidebarOpen }) {
  const {
    data: projectsData,
    error: projectsError,
    loading: projectsLoading,
  } = useProjectsQuery();
  const match = useRouteMatch(PROJECT_DETAILS_PAGE);

  if (projectsLoading) {
    return (
      <div className="px-6 py-2">
        <Spinner />
      </div>
    );
  }

  if (projectsError) return `Error ${projectsError}`;
  if (!projectsData) return "No projects data";

  const { projects: dataProjects } = projectsData;
  const projects =
    dataProjects && dataProjects.length > 0 ? [...dataProjects] : [];
  const sorted = projects.sort((a, b) => a.sort_position - b.sort_position);

  return (
    <div className="project-list">
      {sorted.map((p) => (
        <Link
          key={p.id}
          onClick={handleLinkClick}
          to={generatePath(PROJECT_DETAILS_PAGE, { projectId: p.id })}
        >
          <SidebarItem
            collapsedLabel={abbreviateProjectName(p.name)}
            expandedText={p.name}
            IconComponent={NoteIcon}
            selected={match && match.params && match.params.projectId === p.id}
            sidebarOpen={sidebarOpen}
          />
        </Link>
      ))}
      <CreateProjectButton sidebarOpen={sidebarOpen} />
    </div>
  );
}
