import Image from "next/image";

// import img5 from "@@/public/images/img4.jpg";
import img5 from "@@/public/images/register-ill.svg";

import RegisterForm from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex h-full flex-row items-center justify-center gap-10">
      <div className="relative h-full w-1/2 max-md:hidden">
        <Image
          src={img5}
          alt="Woman sitting"
          priority
          quality={80}
          // placeholder="blur"
          className="h-full object-cover"
        />
      </div>

      <div className="custom-scrollbar flex h-full w-1/2 flex-col items-center py-10 max-md:w-full">
        <RegisterForm className="my-auto" />
      </div>
    </div>
  );
}
