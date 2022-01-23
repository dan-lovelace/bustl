import React, { useState } from "react";

import { headerLogo } from "layouts/PageLayout/Header";
import { getAboutClientLocation } from "lib/app-config";
import { useAcceptTermsMutation } from "lib/gql/mutations/appUser";

import Button from "components/Button/Button";
import LinkButton from "components/Button/LinkButton";
import Image from "components/Image/Image";
import Modal from "components/Modal/Modal";

const privacyId = "privacy";
const termsId = "terms";

export default function TermsOfService() {
  const [declined, setDeclined] = useState(false);
  const [selected, setSelected] = useState(termsId);
  const [acceptTerms, { loading }] = useAcceptTermsMutation();

  const handleAcceptClick = () => {
    acceptTerms();
  };

  const handleDeclineClick = () => {
    setDeclined(true);
  };

  const handleGoBackClick = () => {
    setDeclined(false);
  };

  const handleToggleClick = () => {
    setSelected(selected === termsId ? privacyId : termsId);
  };

  return (
    <Modal hideClose type="dialog">
      {declined ? (
        <div>
          <div className="mb-4">
            Acceptance of our terms and privacy policy are required to use the
            services.
          </div>
          <div className="text-center">
            <Button
              className="bg-gray-200 hover:bg-gray-300"
              onClick={handleGoBackClick}
            >
              Go back
            </Button>
            <LinkButton className="ml-2" href={getAboutClientLocation()}>
              Still decline
            </LinkButton>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4 h-12 py-2">
            <Image className="h-full mx-auto" src={headerLogo} alt="bustl" />
          </div>
          <div className="mb-4">
            Our terms and conditions have changed since you last visited. Please
            take time to review them and our privacy policy.
          </div>
          <div className="mb-4">
            <iframe
              className="w-full h-48 md:h-96 border rounded"
              title={selected}
              src={`${getAboutClientLocation()}/${selected}`}
            />
            <LinkButton onClick={handleToggleClick}>
              See{" "}
              {selected === termsId ? "privacy policy" : "terms and conditions"}
            </LinkButton>
          </div>
          <div className="text-center">
            <Button
              className="bg-gray-200 hover:bg-gray-300"
              onClick={handleDeclineClick}
            >
              Decline
            </Button>
            <Button
              className="ml-2"
              primary
              disabled={loading}
              onClick={handleAcceptClick}
            >
              Agree
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
