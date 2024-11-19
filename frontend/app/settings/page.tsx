"use client";
import { useUser } from "@/components/provider/user-provider";
import React from "react";
import { SkeletonImg } from "@/components/my-ui/img";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const { user } = useUser();

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="flex items-center justify-between mx-auto mt-3 gap-5">
        <div className="border rounded-full">
          <SkeletonImg
            url={user?.img_url}
            width={300}
            height={300}
            rounded={10000}
          />
        </div>
        <div className="w-96 h-full p-2 flex flex-col gap-2 justify-center">
          <div className="flex justify-between items-center">
            Email:
            <span className="pr-5 hover:text-primary cursor-default">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center">
            Username:
            <span className="pr-5 hover:text-primary cursor-default">{user?.username}</span>
          </div>
          <div className="flex justify-between items-center">
            Subscription:
            <div className="flex gap-2 items-center">
              <div className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors shadow-sm h-9 px-4 py-2 cursor-default">
                {user?.subscription}
              </div>
              <Button
                onClick={() => router.push("/subscriptions")}
                variant={"link"}
              >
                {user?.subscription != "Zenith" ? "Upgrade" : "Downgrade"}
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            {user?.tags &&
              user?.tags.map((tag, index) => <Badge key={index}>{tag}</Badge>)}
          </div>
          <div className="flex justify-end text-secondary-foreground">
            Joined at{" "}
            {new Date(user?.created_at || 0).toLocaleDateString("de-DE", {
              month: "2-digit",
              year: "numeric",
              day: "2-digit",
            })}
          </div>
        </div>
      </div>
      {/* TODO implement description (editable) */}
    </div>
  );
};

export default Page;