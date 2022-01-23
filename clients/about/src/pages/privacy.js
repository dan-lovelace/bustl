import React from "react";

import { getTermsVersion } from "../utils/helpers";
import { Heading, Paragraph } from "../components/typography/headings";

const termsVersion = getTermsVersion();

export default function Privacy() {
  return (
    <div className="container mx-auto p-5 lg:px-48">
      <Paragraph>Last updated: {termsVersion}</Paragraph>
      <Heading>Privacy Policy</Heading>
      <Paragraph>
        LogicNow LLC ("us", "we", or "our") operates the https://bus.tl website
        (the "Service").
      </Paragraph>
      <Paragraph>
        This page informs you of our policies regarding the collection, use and
        disclosure of Personal Information when you use our Service.
      </Paragraph>
      <Paragraph>
        We will not use or share your information with anyone except as
        described in this Privacy Policy.
      </Paragraph>
      <Paragraph>
        We use your Personal Information for providing and improving the
        Service. By using the Service, you agree to the collection and use of
        information in accordance with this policy. Unless otherwise defined in
        this Privacy Policy, terms used in this Privacy Policy have the same
        meanings as in our Terms and Conditions, accessible at
        https://bus.tl/terms.
      </Paragraph>

      <Heading>Information Collection And Use</Heading>
      <Paragraph>
        While using our Service, we may ask you to provide us with certain
        personally identifiable information that can be used to contact or
        identify you. Personally identifiable information may include, but is
        not limited to, your email address, phone number, postal address, other
        information ("Personal Information").
      </Paragraph>
      <Paragraph>
        We collect this information for the purpose of providing the Service,
        identifying and communicating with you, responding to your
        requests/inquiries, servicing your purchase orders, and improving our
        services.
      </Paragraph>

      <Heading>Log Data</Heading>
      <Paragraph>
        We may also collect information that your browser sends whenever you
        visit our Service ("Log Data"). This Log Data may include information
        such as your computer's Internet Protocol ("IP") address, browser type,
        browser version, the pages of our Service that you visit, the time and
        date of your visit, the time spent on those pages and other statistics.
      </Paragraph>

      <Heading>Cookies</Heading>
      <Paragraph>
        Cookies are files with a small amount of data, which may include an
        anonymous unique identifier. Cookies are sent to your browser from a web
        site and transferred to your device. We use cookies to collect
        information in order to improve our services for you.
      </Paragraph>
      <Paragraph>
        You can instruct your browser to refuse all cookies or to indicate when
        a cookie is being sent. The Help feature on most browsers provide
        information on how to accept cookies, disable cookies or to notify you
        when receiving a new cookie.
      </Paragraph>
      <Paragraph>
        If you do not accept cookies, you may not be able to use some features
        of our Service and we recommend that you leave them turned on.
      </Paragraph>

      {/* <Heading>Do Not Track Disclosure</Heading>
      <Paragraph>
        We support Do Not Track ("DNT"). Do Not Track is a preference you can
        set in your web browser to inform websites that you do not want to be
        tracked.
      </Paragraph>
      <Paragraph>
        You can enable or disable Do Not Track by visiting the Preferences or
        Settings page of your web browser.
      </Paragraph> */}

      <Heading>Service Providers</Heading>
      <Paragraph>
        We may employ third party companies and individuals to facilitate our
        Service, to provide the Service on our behalf, to perform
        Service-related services and/or to assist us in analyzing how our
        Service is used.
      </Paragraph>
      <Paragraph>
        These third parties have access to your Personal Information only to
        perform specific tasks on our behalf and are obligated not to disclose
        or use your information for any other purpose.
      </Paragraph>

      <Heading>Communications</Heading>
      <Paragraph>
        We may use your Personal Information to contact you with newsletters,
        marketing or promotional materials and other information that may be of
        interest to you. You may opt out of receiving any, or all, of these
        communications from us by following the unsubscribe link or instructions
        provided in any email we send or by contacting us.
      </Paragraph>

      <Heading>Compliance With Laws</Heading>
      <Paragraph>
        We will disclose your Personal Information where required to do so by
        law or subpoena or if we believe that such action is necessary to comply
        with the law and the reasonable requests of law enforcement or to
        protect the security or integrity of our Service.
      </Paragraph>

      <Heading>Business Transaction</Heading>
      <Paragraph>
        If LogicNow LLC is involved in a merger, acquisition or asset sale, your
        Personal Information may be transferred as a business asset. In such
        cases, we will provide notice before your Personal Information is
        transferred and/or becomes subject to a different Privacy Policy.
      </Paragraph>

      <Heading>Security</Heading>
      <Paragraph>
        The security of your Personal Information is important to us, and we
        strive to implement and maintain reasonable, commercially acceptable
        security procedures and practices appropriate to the nature of the
        information we store, in order to protect it from unauthorized access,
        destruction, use, modification, or disclosure.
      </Paragraph>
      <Paragraph>
        However, please be aware that no method of transmission over the
        internet, or method of electronic storage is 100% secure and we are
        unable to guarantee the absolute security of the Personal Information we
        have collected from you.
      </Paragraph>

      <Heading>International Transfer</Heading>
      <Paragraph>
        Your information, including Personal Information, may be transferred to
        — and maintained on — computers located outside of your state, province,
        country or other governmental jurisdiction where the data protection
        laws may differ than those from your jurisdiction.
      </Paragraph>
      <Paragraph>
        If you are located outside United States and choose to provide
        information to us, please note that we transfer the information,
        including Personal Information, to United States and process it there.
      </Paragraph>
      <Paragraph>
        Your consent to this Privacy Policy followed by your submission of such
        information represents your agreement to that transfer.
      </Paragraph>

      <Heading>Links To Other Sites</Heading>
      <Paragraph>
        Our Service may contain links to other sites that are not operated by
        us. If you click on a third party link, you will be directed to that
        third party's site. We strongly advise you to review the Privacy Policy
        of every site you visit.
      </Paragraph>
      <Paragraph>
        We have no control over, and assume no responsibility for the content,
        privacy policies or practices of any third party sites or services.
      </Paragraph>

      <Heading>Children's Privacy</Heading>
      <Paragraph>
        Only persons age 13 or older have permission to access our Service. Our
        Service does not address anyone under the age of 13 ("Children").
      </Paragraph>
      <Paragraph>
        We do not knowingly collect personally identifiable information from
        children under 13. If you are a parent or guardian and you learn that
        your Children have provided us with Personal Information, please contact
        us. If we become aware that we have collected Personal Information from
        a child under age 13 without verification of parental consent, we take
        steps to remove that information from our servers.
      </Paragraph>

      <Heading>Changes To This Privacy Policy</Heading>
      <Paragraph>
        This Privacy Policy is effective as of {termsVersion} and will remain in
        effect except with respect to any changes in its provisions in the
        future, which will be in effect immediately after being posted on this
        page.
      </Paragraph>
      <Paragraph>
        We reserve the right to update or change our Privacy Policy at any time
        and you should check this Privacy Policy periodically. Your continued
        use of the Service after we post any modifications to the Privacy Policy
        on this page will constitute your acknowledgment of the modifications
        and your consent to abide and be bound by the modified Privacy Policy.
      </Paragraph>
      <Paragraph>
        If we make any material changes to this Privacy Policy, we will notify
        you either through the email address you have provided us, or by placing
        a prominent notice on our website.
      </Paragraph>

      <Heading>Contact Us</Heading>
      <Paragraph>
        If you have any questions about this Privacy Policy, please contact us.
      </Paragraph>
      <Paragraph>
        <a href="mailto:support@bus.tl">support@bus.tl</a>
      </Paragraph>
      {/* <Paragraph>
          <Link to="/contact">bus.tl/contact</Link>
        </Paragraph> */}
    </div>
  );
}
