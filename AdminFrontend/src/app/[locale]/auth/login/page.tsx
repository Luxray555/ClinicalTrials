import Image from "next/image";
import img3 from "@@/public/images/login.svg";
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex w-4/5 flex-row items-center justify-center gap-10">
      <div className="relative h-full w-1/2 max-md:hidden">
        <Image
          src={img3}
          alt="Woman sitting"
          priority
          // placeholder="blur"
          className="h-full w-full flex-grow object-contain"
        />
      </div>

      <div className="custom-scrollbar flex h-full w-1/2 flex-col items-center py-10 max-md:w-full">
        <LoginForm className="my-auto" />
      </div>
    </div>
  );
}
