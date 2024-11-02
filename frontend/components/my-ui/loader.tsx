import React from "react";
import { LoaderCircle } from "lucide-react";

export const Loader: React.FC<{
  loading: boolean;
  children?: React.ReactNode;
  size?: number;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
  message?: string;
}> = ({ loading, children, size = 30, rounded = "none", message }) => {
  return (
    <>
      <div className={`w-full h-full relative`}>
        <div className={`${!loading && `opacity-0 pointer-events-none`} rounded-${rounded} cursor-wait absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-20 items-center justify-center flex w-full h-full backdrop-blur-sm transition-all flex-col gap-1`}>
          <div className={`${message && "translate-y-3"} flex items-center justify-center flex-col`}>
          <LoaderCircle className={`animate-spin`} size={size} />
          <span className="text-sm text-secondary-foreground">{message}</span>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export const ButtonLoader: React.FC<{
  loading: boolean;
  children: React.ReactNode;
}> = ({ loading, children }) => {
  return <>{loading ? <LoaderCircle className="animate-spin" /> : children}</>;
};
