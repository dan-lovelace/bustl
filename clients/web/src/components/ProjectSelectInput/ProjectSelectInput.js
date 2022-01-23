import React from "react";
import { useQuery } from "@apollo/client";
import MenuItem from "@material-ui/core/MenuItem";

import { GET_PROJECTS } from "lib/gql/queries";

import SelectInput from "components/Form/SelectInput";

export default function ProjectSelectInput(inputProps) {
  const { data, error, loading } = useQuery(GET_PROJECTS);

  if (loading) return "Loading";
  if (error) return `Error: ${error}`;

  const { projects: projectsData } = data;

  const handleChange = (event) => {
    console.log("change", event);
  };

  return (
    <SelectInput
      name="projectId"
      label="Project"
      {...inputProps}
      onChange={handleChange}
      options={
        projectsData &&
        projectsData.length > 0 &&
        projectsData.map((p) => <MenuItem value={p.id}>{p.name}</MenuItem>)
      }
    ></SelectInput>
  );
}
