import { Mail, Phone, UserRound } from "lucide-react";

type Props = {
  name?: string;
  email?: string;
  phone?: string;
};

export default function ContactCard({ name, email, phone }: Props) {
  return (
    <div className="flex h-fit w-fit flex-col gap-2 border p-4">
      <div className="flex items-center gap-2">
        <UserRound className="text-primary" />
        <p>{name}</p>
      </div>
      <div className="flex items-center gap-2">
        <Mail className="text-primary" />
        <a href={`mailto:${email}`} className="hover:underline">
          <p>{email}</p>
        </a>
      </div>
      <div className="flex items-center gap-2">
        <Phone className="text-primary" />
        <p>{phone}</p>
      </div>
    </div>
  );
}
