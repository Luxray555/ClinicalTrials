"use client";

import updateDoctorData from "@/actions/doctors/update-doctor-data";
import { UploadButton } from "@/utils/uploadthing";

export default function UploadImageButton() {
  return (
    <UploadButton
      endpoint="imageUploader"
      // content={{
      //   button({ ready, uploadProgress }) {
      //   //   if (uploadProgress) {
      //   //     return `Uploading: ${Math.round(uploadProgress)}%`;
      //   //   }
      //   //   return ready ? "Change Picture" : "Loading...";
      //   // },
      // }}
      // appearance={{
      //   button: "bg-primary/10 w-full",
      // }}
      className="w-full"
      onClientUploadComplete={async (res) => {
        await updateDoctorData({
          image: res[0].url,
        });
        console.log("Files: ", res);
      }}
      onUploadError={(error: Error) => {
        // Do something with the error.
        console.log("error", error.message);
        alert(`ERROR! ${error.message}`);
      }}
    />
  );
}
