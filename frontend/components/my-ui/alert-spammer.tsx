"use client";
import React, { useEffect, useState } from "react";
import { AlertProvider, useAlert } from "../provider/alert-provider";
import { AlertType } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export const AlertSpammer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AlertProvider>
      {children}
      <AlertDisplay />
    </AlertProvider>
  );
};

const AlertDisplay = () => {
  const { alerts } = useAlert();
  const [stopCountdown, setStopCountdown] = useState<boolean>(false);
  const [currentAlertIndex, setCurrentAlertIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentAlert = alerts[currentAlertIndex];

  useEffect(() => {
    if (!currentAlert && alerts.length) {
      setCurrentAlertIndex(0);
    }
    if (currentAlertIndex >= alerts.length && alerts.length > 0) {
      setCurrentAlertIndex(alerts.length - 1);
    }
  }, [alerts, currentAlert, currentAlertIndex]);

  const handleDismiss = () => {
    if (currentAlertIndex < alerts.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentAlertIndex(prev => prev + 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  if (!alerts.length || !currentAlert) return null;

  return (
    <Alert
      alert={currentAlert}
      stopCountdown={stopCountdown}
      onMouseOver={() => setStopCountdown(true)}
      onMouseLeave={() => setStopCountdown(false)}
      onDismiss={handleDismiss}
      isTransitioning={isTransitioning}
    />
  );
};

const Alert: React.FC<{
  alert: AlertType;
  stopCountdown: boolean;
  onMouseOver: () => void;
  onMouseLeave: () => void;
  onDismiss: () => void;
  isTransitioning: boolean;
}> = ({ alert, stopCountdown, onMouseLeave, onMouseOver, onDismiss, isTransitioning }) => {
  const { removeAlert } = useAlert();
  const router = useRouter();
  const { title, type, displayTime, path } = alert;
  const [extraClasses, setExtraClasses] = useState<string>("");

  const [display, setDisplay] = useState<"" | "displaying" | "hide">("");
  const [timeLeft, setTimeLeft] = useState<number>();

  useEffect(() => {
    const color =
      type == "default"
        ? "secondary"
        : type == "success"
        ? "success"
        : "destructive";
    setExtraClasses(`hover:shadow-${color}/30 border-${color} shadow-${color}/50 hover:bg-${color}`)
  }, [type]);

  useEffect(() => {
    setTimeLeft(displayTime + 300);
    setDisplay("");
    const timer = setTimeout(() => setDisplay("displaying"), 100);
    return () => clearTimeout(timer);
  }, [displayTime, alert.uid]);

  useEffect(() => {
    if (timeLeft == undefined) return;
    const hideOn = 100;
    const interval = setInterval(() => {
      if (!stopCountdown) {
        const left = timeLeft - 100;
        setTimeLeft(left);
        if (left <= hideOn && display == "displaying") {
          setDisplay("hide");
          removeAlert(alert);
        }
      }
    }, 100);
    return () => {
      clearInterval(interval);
    };
  }, [timeLeft, stopCountdown, alert, display, removeAlert]);

  if (extraClasses == "") return null;

  return (
    <div
      onClick={() => path && router.push(path)}
      onMouseLeave={onMouseLeave}
      onMouseOver={onMouseOver}
      className={`group
        ${display == "" ? "scale-0 opacity-0" : ""}
        ${display == "hide" || isTransitioning ? "opacity-0 -translate-y-24 scale-90" : ""}
        ${display == "displaying" && !isTransitioning ? "opacity-100 scale-100 shadow-md" : ""}
        fixed top-12 left-1/2 border -translate-x-1/2 z-[999999999999] pointer-events-auto rounded-lg p-2 h-10 w-56 
        cursor-pointer hover:scale-105 transition-all duration-300 bg-background justify-between flex items-center 
        hover:shadow-lg ${extraClasses}`}
    >
      <span>{title}</span>
      <Button 
        onClick={(e) => {
          e.preventDefault();
          onDismiss();
        }} 
        variant="ghost" 
        size="icon" 
        className="text-secondary-foreground hover:bg-transparent opacity-0 group-hover:opacity-100"
      >
        <X size={20} />
      </Button>
    </div>
  );
};