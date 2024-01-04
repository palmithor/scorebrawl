import {Icons} from "./icons";

export const Spinner = ({ size }: { size?: string }) => (
  <Icons.spinner size={size} className="animate-spin" />
);
