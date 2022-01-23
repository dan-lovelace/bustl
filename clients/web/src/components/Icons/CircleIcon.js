import Icon from "components/Icons/Icon";

export default function CircleIcon(props) {
  return (
    <Icon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth={2} />
      </svg>
    </Icon>
  );
}
