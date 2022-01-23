import React from "react";

import { hero, heroCopy } from "./hero.module.css";
import { classnames as cx } from "../../utils/helpers";

import SignupButton from "../signupButton";

export default function Hero({
  backgroundColor = "bg-blue-900",
  backgroundImage,
  showSignup = false,
  subtitle,
  title,
}) {
  return (
    <section
      className={cx("relative", "bg-cover bg-center", hero)}
      style={{ backgroundImage: `url("${backgroundImage}")` }}
    >
      <div
        className={cx(
          "absolute left-0 top-0 right-0 bottom-0",
          "bg-opacity-95",
          backgroundColor
        )}
      >
        <div className={cx("container mx-auto", "text-white", heroCopy)}>
          <div className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            {title}
          </div>
          <div className="sm:text-xl max-w-lg mb-12">{subtitle}</div>
          {showSignup && (
            <div>
              <SignupButton className="px-8" text="Get started" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
