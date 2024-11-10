"use client"
import { AlertType } from "@/lib/utils";
import React, { createContext, useContext, useState } from "react"

interface AlertContextProps {
  newAlert: (title: JSX.Element | string, path?: string, displayMS?: number, type?: "default" | "success" | "error") => void;
  removeAlert: (alert: AlertType) => void;
  alerts: AlertType[];
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  
  const newAlert = (title: JSX.Element | string, path?: string, displayMS = 2000, type: "default" | "success" | "error" = "default") => {
    const newAlert: AlertType = {
      title: title,
      type: type,
      displayTime: displayMS,
      uid: `${alerts.length * 1.4} ${JSON.stringify(title)}`,
      path: path
    }
    setAlerts(prev => [...prev, newAlert])
  };
  
  const removeAlert = (alert: AlertType) => {
    const remaining = alerts.filter(a => a != alert);
    setTimeout(() => setAlerts(remaining), 400);
  }

  return (
    <AlertContext.Provider
      value={{
        alerts,
        newAlert,
        removeAlert,
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