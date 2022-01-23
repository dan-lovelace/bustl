import moment from "moment-timezone";

export function fromNow(date) {
  const time = moment(date).fromNow(date);

  return `${time} ago`;
}

export function dateToString(date, format = "LLL") {
  const parsed = moment(date).format(format);

  return parsed;
}
