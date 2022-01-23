import * as React from "react";

import { classnames as cx } from "../utils/helpers";

import Button from "../components/button";
import Hero from "../components/hero/hero";
import Layout from "../components/layout";
import Link from "../components/link";
import SignupButton from "../components/signupButton";

function ContactTile({ button, subtitle, title }) {
  return (
    <div
      className={cx(
        "flex flex-col",
        "bg-white px-8 py-12 rounded-xl",
        "shadow",
        "text-center",
        "border-blue-500 border-t-8 border-b-8 border-l border-r"
      )}
    >
      <div className={cx("text-4xl font-bold", "mb-10")}>{title}</div>
      <div
        className={cx(
          "flex-1",
          "text-left",
          "mb-20",
          "px-6 md:px-20 lg:px-6 xl:px-20"
        )}
      >
        {subtitle}
      </div>
      <div>{button}</div>
    </div>
  );
}

function ContactLink(props) {
  return <EmailLink mailTo="contact@bus.tl" {...props} />;
}

function EmailLink({ children, mailTo }) {
  return <Link href={`mailto:${mailTo}`}>{children || mailTo}</Link>;
}

export default function Contact() {
  return (
    <Layout>
      <Hero
        backgroundColor="bg-yellow-900"
        backgroundImage="/1440-board-img-2.jpg"
        subtitle="Want to talk to someone? We'd love to hear from you. Here's how to reach us..."
        title="Get in touch"
      />
      <div className={cx("relative", "-mt-80 sm:-mt-60 lg:-mt-80 mb-40")}>
        <div className={cx("container mx-auto", "p-2 lg:p-20")}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ContactTile
              title="By Email"
              subtitle={
                <div>
                  <div className="mb-4">
                    For general questions or questions about the product, feel
                    free to send a message to <ContactLink /> any time. If you
                    need help right now, please use{" "}
                    <EmailLink mailTo="support@bus.tl" /> instead.
                  </div>
                  <div className="mb-4">
                    For business- and marketing-related inquiries, use{" "}
                    <EmailLink mailTo="marketing@bus.tl" />.
                  </div>
                </div>
              }
              button={
                <ContactLink>
                  <Button primary>Send Email</Button>
                </ContactLink>
              }
            />
            <ContactTile
              title="By Signing Up"
              subtitle={
                <div>
                  <div className="mb-8 text-xl">
                    Creating an account offers a number of communication
                    benefits:
                  </div>
                  <ul className="list-disc">
                    <li className="mb-4">
                      <strong>In-App Support</strong> &ndash; Once you log in,
                      you get a direct line to our support team from inside the
                      app.
                      {/* As a registered
                      user, you get direct access to our support team from
                      inside the app. Quickly get help if you need it. */}
                      {/* Direct access to
                      our support team inside the app. Get help when you need it. */}
                      {/* Direct access to
                      our support team while you use the app. Get help when you
                      need it. */}
                    </li>
                    <li className="mb-4">
                      <strong>Prioritized Response</strong> &ndash; When you
                      reach out and need something, you can expect a much faster
                      response time.
                      {/* Your
                      communications will be prioritized over unregistered
                      users. You should expect a response within 24 hours. */}
                      {/* Responses to
                      your communications are prioritized and usually occur
                      within 24 hours. */}
                      {/* Your
                      communications are expedited and typically responded to
                      within 24 hours. */}
                      {/* Messages
                      from registered users are expedited and usually receive a
                      response within 24 hours. */}
                    </li>
                    <li className="mb-4">
                      <strong>Embraced Input</strong> &ndash; Let your opinions
                      be heard using the in-app feedback tool. We use your
                      submissions when planning which features to add or
                      improve.
                      {/* Let your opinion
                      be heard at the click of a button. We use your feedback to
                      decide which features to introduce or improve. */}
                      {/* Let us know how
                      things are going at the click of a button. User feedback
                      heavily drives our decisions for adding new and improving
                      existing features. */}
                      {/* Whether you'd like
                      to request a feature, report a bug or just want to let us
                      know how we're doing, easily make it happen using the
                      feedback button. */}
                      {/* Want to request a feature? Report a bug? Have
                      general feedback? Easily let us know using the in-app
                      feedback tool. */}
                    </li>
                  </ul>
                </div>
              }
              button={<SignupButton text="Register now" />}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
