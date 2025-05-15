import { BiError } from "react-icons/bi";

type Props = {
  message: string | undefined;
};

export default function FormError({ message }: Props) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3">
      <BiError className="h-5 w-5 text-destructive" />
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
}
