import { gql } from "@apollo/client";

export const appUserFragment = gql`
  fragment AppUser on AppUser {
    id
    email
    email_verified
    must_accept_terms
  }
`;

export const boardMarkerFragment = gql`
  fragment BoardMarker on BoardMarker {
    id
    created_at
    x_position
    y_position
    sort_position
    marker_type
    hidden
  }
`;

export const calendarEventFragment = gql`
  fragment CalendarEvent on CalendarEvent {
    id
    title
    start_time
    end_time
    all_day
    description
    calendar_type
    archived
  }
`;

export const contactMessageFragment = gql`
  fragment ContactMessage on ContactMessage {
    id
    subject
    body
    rating
  }
`;

export const boardFragment = gql`
  fragment Board on Board {
    id
    created_at
    updated_at
    archived
  }
`;

export const imageFragment = gql`
  fragment Image on Image {
    id
    thumbnail
    source
  }
`;

export const noteFragment = gql`
  fragment Note on Note {
    id
    created_at
    updated_at
    title
    body
    archived
    sort_position
  }
`;

export const noteTypeFragment = gql`
  fragment NoteType on NoteType {
    id
    name
    sort_position
  }
`;

export const projectFragment = gql`
  fragment Project on Project {
    id
    name
    sort_position
  }
`;

export const subscriptionFragment = gql`
  fragment Subscription on Subscription {
    status
    plan {
      name
    }
  }
`;
