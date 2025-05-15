"use client";

import React from "react";

interface ServerErrorMessageProps {
  status?: number;
  message?: string;
  error?: string;
  onRetry?: () => void;
}

const ServerErrorMessage: React.FC<ServerErrorMessageProps> = ({
  status = 500,
  message = "Something went wrong.",
  error,
  onRetry,
}) => {
  return (
    <div className="mx-auto mt-8 max-w-xl rounded-xl border border-red-300 bg-red-100 p-6 text-red-800 shadow-sm">
      <h2 className="mb-2 text-lg font-semibold">Error {status}</h2>
      <p className="mb-1">{message}</p>
      {error && <p className="text-sm italic text-red-600">{error}</p>}

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ServerErrorMessage;
