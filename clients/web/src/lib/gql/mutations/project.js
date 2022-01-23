import { gql, useMutation } from "@apollo/client";

import { noteTypeFragment, projectFragment } from "../fragments";
import { GET_PROJECTS } from "../queries";

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      ...Project
      note_types {
        ...NoteType
      }
    }
  }
  ${projectFragment}
  ${noteTypeFragment}
`;

export function useCreateProjectMutation() {
  return useMutation(CREATE_PROJECT, {
    update(cache, { data: { createProject } }) {
      cache.modify({
        fields: {
          projects(existingProjects) {
            const newProjectRef = cache.writeFragment({
              data: createProject,
              fragment: projectFragment,
            });

            return [...(existingProjects || []), newProjectRef];
          },
        },
      });
    },
  });
}

export function useDeleteProjectMutation() {
  const mutation = gql`
    mutation DeleteProject($id: ID!) {
      deleteProjects(ids: [$id])
    }
  `;

  return useMutation(mutation, {
    update(cache, { data: { deleteProjects } }) {
      cache.modify({
        fields: {
          projects(existing = [], { readField }) {
            return existing.filter(
              (pRef) => !deleteProjects.includes(readField("id", pRef))
            );
          },
        },
      });
    },
  });
}

export const DELETE_PROJECTS = gql`
  mutation DeleteProjects($ids: [ID]!) {
    deleteProjects(ids: $ids)
  }
`;

export function useDeleteProjectsMutation(ids) {
  return useMutation(DELETE_PROJECTS, { variables: { ids } });
}

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
      ...Project
    }
  }
  ${projectFragment}
`;

export function useUpdateProjectMutation() {
  return useMutation(UPDATE_PROJECT);
}

export function useUpdateProjectSortPositionMutation() {
  const mutation = gql`
    mutation UpdateProjectSortPosition($id: ID!, $sort_position: Int!) {
      updateProject(id: $id, input: { sort_position: $sort_position }) {
        id
        sort_position
      }
    }
  `;

  return useMutation(mutation, {
    refetchQueries: [{ query: GET_PROJECTS }],
  });
}
