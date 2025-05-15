"use client";

import { useState } from "react";
import { BriefcaseMedical, NotebookText } from "lucide-react";
import { motion } from "framer-motion";
import RegisterDoctorForm from "@/components/auth/register-doctor-form";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import logoImage from "@@/public/images/logo.png";
import RegisterInvestigatorForm from "./register-investigator-form";

export default function ChooseRole() {
  const [userType, setUserType] = useState<"DOCTOR" | "INVESTIGATOR" | null>(
    null,
  );
  return (
    <div className="custom-scrollbar flex h-screen w-1/2 flex-col items-center overflow-y-scroll py-10 max-md:w-full">
      <Link href="/">
        <Image
          src={logoImage}
          alt="Logo image"
          height={150}
          width={150}
          className="mb-5 hidden max-md:block"
        />
      </Link>
      {userType === null && (
        <div className="my-auto flex gap-8">
          <motion.div
            className="flex w-40 flex-col items-center justify-center gap-2 rounded-lg border p-4"
            onClick={() => setUserType("DOCTOR")}
            whileHover={{
              scale: 1.1,
              cursor: "pointer",
            }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <BriefcaseMedical className="text-primary" />
            <p>Doctor</p>
          </motion.div>
          <motion.div
            className="flex w-40 flex-col items-center justify-center gap-2 rounded-lg border p-4"
            onClick={() => setUserType("INVESTIGATOR")}
            whileHover={{ scale: 1.1, cursor: "pointer" }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <NotebookText className="text-primary" />
            <p>Investigator</p>
          </motion.div>
        </div>
      )}
      {userType === "DOCTOR" && <RegisterDoctorForm className="my-auto" />}
      {userType === "INVESTIGATOR" && (
        <RegisterInvestigatorForm className="my-auto" />
      )}
    </div>
  );
}
