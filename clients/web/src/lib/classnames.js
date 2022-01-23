export default function merge(...args) {
  return args.filter((a) => !!a).join(" ");
}
