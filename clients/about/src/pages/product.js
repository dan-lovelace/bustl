import * as React from "react";
import Layout, { LayoutContainer } from "../components/layout";

import Slide1 from "../images/slide-1.png";
import Slide2 from "../images/slide-2.png";
import Slide3 from "../images/slide-3.png";

export default function Product() {
  return (
    <Layout>
      <LayoutContainer>
        <div className="mb-2 rounded overflow-hidden">
          <img className="w-full" src={Slide1} alt="screenshot 1" />
        </div>
        <div className="mb-2 rounded overflow-hidden">
          <img className="w-full" src={Slide2} alt="screenshot 2" />
        </div>
        <div className="mb-2 rounded overflow-hidden">
          <img className="w-full" src={Slide3} alt="screenshot 3" />
        </div>
      </LayoutContainer>
    </Layout>
  );
}
