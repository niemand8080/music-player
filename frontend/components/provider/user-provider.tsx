"use client";
import React, { createContext, useContext } from "react";

interface UserContextType {
  username: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const username = "";
  return (
    <UserContext.Provider
      value={{
        username,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context == undefined) {
    throw new Error("useUser can only be used within a UserProvider");
  }
  return context;
};
