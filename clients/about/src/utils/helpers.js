import appConfig from "/static/app-config.json";

export function classnames(...args) {
  return args.filter((a) => !!a).join(" ");
}

function getAuthUrl(type = "login") {
  return `https://app.bus.tl/${type}`;
}

export function getLoginUrl() {
  // redirect straight to app so logged-in users are taken directly
  // to the boards page. logged-out users will be redirected to login.
  return "https://app.bus.tl";
}

export function getSignupUrl() {
  return getAuthUrl("signup");
}

export function getTermsVersion() {
  return appConfig.terms_version;
}

export function handleMobileMenuClick() {
  const ele = document.querySelector(".mobile-menu");

  ele.classList.toggle("hidden");
}
