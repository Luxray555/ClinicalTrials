import Image from "next/image";
import logoImage from "@@/public/images/logo.png";
import img3 from "@@/public/images/img3.jpg";
import LoginForm from "@/components/auth/login-form";
import { Link } from "@/i18n/routing";

export default function LoginPage() {
  return (
    <>
      <div className="relative h-full w-1/2 max-md:hidden">
        <Image
          src={img3}
          alt="Woman sitting"
          priority
          quality={80}
          placeholder="blur"
          className="h-full object-cover blur-[1px]"
        />
        <Link href="/">
          <Image
            src={logoImage}
            alt="Logo image"
            height={130}
            width={130}
            className="absolute left-6 top-6"
          />
        </Link>
      </div>

      <div className="custom-scrollbar flex h-full w-1/2 flex-col items-center overflow-y-scroll py-10 max-md:w-full">
        <Link href="/">
          <Image
            src={logoImage}
            alt="Logo image"
            height={150}
            width={150}
            className="mb-5 hidden max-md:block"
          />
        </Link>
        <LoginForm className="my-auto" />
      </div>
    </>
  );
}
