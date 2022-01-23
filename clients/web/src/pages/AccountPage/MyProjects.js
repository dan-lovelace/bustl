import React from "react";

import cx from "lib/classnames";
import { useProjectsQuery } from "lib/gql/queries";

import { SectionHeading, SectionContent } from "./AccountPage";
import UpdateMyProject from "./UpdateMyProject";

function ProjectsList({ data, loading }) {
  if (loading) return "Loading...";
  if (!data || !data.projects || !data.projects.length) return "No projects";

  const { projects: dataProjects } = data;
  const projects = [...dataProjects];
  const sorted = projects.sort((a, b) => a.sort_position - b.sort_position);
  const indexed = sorted.map((p, idx) => ({
    ...p,
    relativeSortPosition: idx + 1,
  }));

  return (
    <div className={cx("my-projects-list", "border", "rounded", "px-2 py-0.5")}>
      <div className="h-full overflow-auto">
        {indexed.map((p, idx) => (
          <div key={p.id}>
            <div className={cx("flex items-center")}>
              <div className="flex-1 text-sm">{p.name}</div>
              <div className="ml-2">
                <UpdateMyProject indexedItems={indexed} item={p} />
              </div>
            </div>
            {idx < dataProjects.length - 1 && <hr className="my-0.5" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MyProjects() {
  const {
    data: projectsData,
    error: projectsError,
    loading: projectsLoading,
  } = useProjectsQuery();

  if (projectsError) return `Error ${projectsError}`;

  return (
    <div>
      <SectionHeading text="Projects" />
      <SectionContent>
        <ProjectsList data={projectsData} loading={projectsLoading} />
      </SectionContent>
    </div>
  );
}
