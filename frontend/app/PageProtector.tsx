"use client";
import { useUser } from "@/components/provider/user-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type ProtectedPageType = {
  href: string;
  label: string;
  redirect?: { label: string; href: string };
};

const protectedPages: ProtectedPageType[] = [
  { href: "/for-you", label: "For You" },
  { href: "/playlists", label: "Playlists" },
  { href: "/settings", label: "Settings" },
];

export const PageProtector = () => {
  const pathname = usePathname();
  const { user, authorized } = useUser();
  const [currentPP, setCurrentPP] = useState<ProtectedPageType>();

  useEffect(() => {
    if (authorized == undefined) return;
    if (user) {
      setCurrentPP(undefined);
      return;
    }
    const page = protectedPages.filter(({ href }) => pathname == href)[0];
    setCurrentPP(undefined);
    if (!page) return;
    setCurrentPP(page);
  }, [pathname, user, authorized]);

  return (
    <AlertDialog open={!!currentPP}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            To visit{" "}
            <span className="text-primary">{currentPP && currentPP.label}</span>{" "}
            you need to be logged in!
          </AlertDialogTitle>
          <AlertDialogDescription>
            You can create a new free account by clicking on the Login button.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => history.back()}>
            Go Back
          </AlertDialogCancel>
          <AlertDialogAction>
            {currentPP && currentPP.redirect ? (
              <Link href={currentPP.redirect.href}>
                {currentPP.redirect.label}
              </Link>
            ) : (
              <Link href={"/auth/login"}>Login</Link>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
