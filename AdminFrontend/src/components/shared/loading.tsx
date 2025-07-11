import { motion } from "framer-motion";

export default function LoadingSpinner() {
  return (
    <div className="flex h-full items-center justify-center">
      <motion.div
        className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
}
