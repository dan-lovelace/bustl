import { noteTypeFragment } from "lib/gql/fragments";

export function cacheCreateProjectNoteType(cache, newNoteType, projectId) {
  cache.modify({
    id: cache.identify({ __ref: `Project:${projectId}` }),
    fields: {
      note_types(existing = []) {
        const oldNoteTypes = [
          ...(existing && existing.length > 0 ? existing : []),
        ];
        const newRef = cache.writeFragment({
          data: newNoteType,
          fragment: noteTypeFragment,
        });

        return [...oldNoteTypes, newRef];
      },
    },
  });
}
