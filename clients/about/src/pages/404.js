import { Link } from "gatsby";
import React from "react";
import Layout, { LayoutContainer } from "../components/layout";
import { Heading, Subheading } from "../components/typography/headings";

export default function NotFound() {
  return (
    <Layout>
      <LayoutContainer>
        <Heading className="mb-10">Page not found</Heading>
        <Subheading>
          <Link to="/">Go home</Link>
        </Subheading>
      </LayoutContainer>
    </Layout>
  );
}
