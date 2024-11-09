"use client"
import React, { createContext, useContext } from "react"

interface AlertContextProps {
  newAlert: () => void;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const newAlert = () => {};
  return (
    <AlertContext.Provider
      value={{
        newAlert,
      }}
    >
      {children}
    </AlertContext.Provider>
  )
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert only works within a AlertProvider");
  }
  return context
}