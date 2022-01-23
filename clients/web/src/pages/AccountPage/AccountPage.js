import React, { useState } from "react";
import { capitalize } from "@material-ui/core";

import cx from "lib/classnames";
import {
  useAccountPageQuery,
  useSubscriptionUsageQuery,
} from "lib/gql/queries/appUser";

import MyProjects from "./MyProjects";
import ChevronUp from "components/Icons/ChevronUpIcon";
import ChevronDown from "components/Icons/ChevronDownIcon";
import ProgressBar from "components/ProgressBar/ProgressBar";
import PageLayout from "layouts/PageLayout/PageLayout";
// import Button from "components/Button/Button";
import Spinner from "components/Loader/Spinner";

function ContactDetails({ me }) {
  const { email, email_verified: verified } = me;

  return (
    <div>
      <SectionHeading text="Account Details" />
      <SectionContent>
        <div className="flex items-center">
          <div className="flex-1 break-words">Email: {email}</div>
          {verified && (
            <div
              className={cx(
                "bg-green-100 text-green-900",
                "text-xs uppercase",
                "px-1.5 py-0.5",
                "rounded",
                "border border-green-900",
                "ml-2"
              )}
            >
              Verified
            </div>
          )}
        </div>
      </SectionContent>
    </div>
  );
}

export function SectionHeading({ text }) {
  return <h1 className="mb-4 text-lg">{text}</h1>;
}

export function SectionContent({ children }) {
  return <div className="w-full pl-10 mb-10 text-sm">{children}</div>;
}

function SubscriptionUsageItem({ item }) {
  return (
    <div>
      <div className="text-sm mb-2">{item.flag.description}</div>
      <div className="ml-10 flex items-center">
        <div className="text-sm mr-4 w-10 whitespace-nowrap">
          {item.current} / {item.flag.value}
        </div>
        <div className="flex-1 ml-6">
          <ProgressBar current={item.current} steps={item.flag.value} />
        </div>
      </div>
    </div>
  );
}

function SubscriptionUsage() {
  const {
    data: usageData,
    error: usageError,
    loading: usageLoading,
  } = useSubscriptionUsageQuery({
    fetchPolicy: "network-only",
  });
  const [expanded, setExpanded] = useState(false);

  if (usageLoading) return <Spinner />;
  if (usageError) return `Error: ${usageError}`;

  const toggleExpanded = () => {
    if (expanded) {
      setExpanded(false);
    } else {
      setExpanded(true);
    }
  };

  const {
    me: {
      subscription: {
        usage: {
          // board_create_monthly,
          board_create_total_active,
          image_upload_request_monthly,
        },
      },
    },
  } = usageData;

  return (
    <div className="shadow-md">
      <div
        className={cx(
          "flex items-center",
          // "shadow-md",
          "border",
          "p-2",
          "rounded",
          "cursor-pointer",
          "hover:bg-gray-100",
          "select-none"
        )}
        onClick={toggleExpanded}
      >
        <div className="flex-1">Usage</div>
        {expanded ? <ChevronUp size="sm" /> : <ChevronDown size="sm" />}
      </div>

      <div
        className={cx(
          "overflow-hidden",
          "transition-all",

          expanded && "border-l border-r border-b"
        )}
        style={{ maxHeight: expanded ? "800px" : 0 }}
      >
        <div className={cx("p-4")}>
          <div className="">
            {/* <SubscriptionUsageItem item={board_create_monthly} />
            <hr className="my-0.5" /> */}
            <SubscriptionUsageItem item={image_upload_request_monthly} />
            <hr className="my-4" />
            <SubscriptionUsageItem item={board_create_total_active} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SubscriptionDetails({ me }) {
  const {
    subscription: {
      status,
      plan: { name: planName },
    },
  } = me;

  return (
    <div>
      <SectionHeading text="Subscription" />
      <SectionContent>
        <div className="flex mb-2">
          <div className="flex-1">
            <div className="mr-4">Plan: {capitalize(planName)} </div>
            <div>Status: {capitalize(status)}</div>
          </div>

          {/* <div>
            <Button disabled primary short>
              Upgrade
            </Button>
          </div> */}
        </div>

        <SubscriptionUsage />
      </SectionContent>
    </div>
  );
}

function AccountData() {
  const { data, error, loading } = useAccountPageQuery();

  if (loading) {
    return (
      <div className="">
        <Spinner />
      </div>
    );
  }

  if (error) return `Error: ${error.toString()}`;
  if (!data || !data.me) return "No data";

  const { me } = data || {};

  return (
    <div>
      <ContactDetails me={me} />
      <MyProjects />
      <SubscriptionDetails me={me} />
    </div>
  );
}

function AccountPage() {
  return (
    <PageLayout>
      <div className="max-w-md mx-auto py-2 px-2 md:px-0">
        <AccountData />
      </div>
    </PageLayout>
  );
}

export default AccountPage;
