"use client";
import Image from "next/image";

import img5 from "@@/public/images/img4.jpg";
import logoImage from "@@/public/images/logo.png";
import { Link } from "@/i18n/routing";
import ChooseRole from "@/components/auth/choose-role";

export default function RegisterPage() {
  return (
    <>
      <div className="relative h-full w-1/2 max-md:hidden">
        <Image
          src={img5}
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

      <ChooseRole />
    </>
  );
}
