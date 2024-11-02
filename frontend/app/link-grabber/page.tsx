"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/my-ui/loader";
import axios from "axios";
import { Check, X, ChevronLeft } from "lucide-react";
import { download } from "@/lib/utils";

type LinkType = {
  channel_title: string;
  description: string;
  published_at: string;
  thumbnail: string;
  title: string;
  video_id: string;
  accepted?: boolean;
};

const Page = () => {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadReady, setDownloadReady] = useState<boolean>(false);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [detected, setDetected] = useState<{ errors: number; links: number }>({
    errors: 0,
    links: 0,
  });

  const getLinks = async (queries: string[]): Promise<LinkType[]> => {
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/grab-links",
        {
          queries,
        }
      );
      console.log(response.data);
      if (response.data.error) return [];
      return response.data;
    } catch (error) {
      console.log("Error:", error);
      return [];
    }
  };

  const extractLinks = () => {
    const text = textRef.current;
    if (!text) return { queries: [], errors: [] };
    if (text.value == "") {
      textRef.current?.focus();
      return { queries: [], errors: [] };
    }
    const lines = text.value.split("\n");
    const queries = [];
    const errors = [];
    for (const line of lines) {
      const splits = line.split("\t");
      if (splits.length < 6) {
        if (line == "") continue;
        errors.push(line);
        continue;
      }
      queries.push(`${splits[0]} ${splits[5]}`);
    }
    return { queries: queries, errors: errors };
  };

  const handleClick = async () => {
    setLoading(true);
    const lines = extractLinks();
    const queries = lines.queries;
    const errors = lines.errors;
    setErrors(errors);
    const links = await getLinks(queries);
    setLinks(links);
    setLoading(false);
  };

  const handleChange = () => {
    const lines = extractLinks();
    const queries = lines.queries;
    const errors = lines.errors;
    setDetected({ errors: errors.length, links: queries.length });
  };

  return (
    <div className="fixed top-0 left-0 w-screen h-screen items-center justify-center flex flex-col">
      <Card
        className={`${
          downloadReady
            ? "w-96"
            : links.length <= 0
            ? "w-screen h-full"
            : "w-[608px]"
        } max-w-5xl max-h-[546px] overflow-y-auto transition-all overflow-hidden`}
      >
        <Loader loading={loading} size={35}>
          {links.length <= 0 ? (
            <>
              <CardHeader className="font-bold text-xl">
                Link Grabber
              </CardHeader>
              <CardContent>
                <Textarea
                  ref={textRef}
                  placeholder="Paste copied content here"
                  className="w-full h-96"
                  onChange={handleChange}
                />
              </CardContent>
              <CardFooter className="mb-4 w-full flex justify-between">
                <span className="text-secondary-foreground">
                  {detected.links} links and {detected.errors} errors detected
                </span>
                <Button onClick={handleClick}>Get Links</Button>
              </CardFooter>
            </>
          ) : (
            <DataHandler
              links={links}
              errors={errors}
              downloadable={setDownloadReady}
            />
          )}
        </Loader>
      </Card>
    </div>
  );
};

const DataHandler: React.FC<{
  links: LinkType[];
  errors: string[];
  downloadable: (b: boolean) => void;
}> = ({ links, downloadable, errors }) => {
  const [current, setCurrent] = useState<number>(0);
  const [processed, setProcessed] = useState<LinkType[]>([]);

  const processLink = (accept: boolean) => {
    const link = links.at(current);
    if (!link) return;
    link.accepted = accept;
    const copy = JSON.parse(JSON.stringify(link));
    setProcessed((prev) => [copy, ...prev]);
    setCurrent((prev) => prev + 1);
  };

  const goBack = () => {
    setProcessed((prev) => prev.slice(1, prev.length));
    setCurrent((prev) => prev - 1);
  };

  useEffect(() => {
    if (current >= links.length) downloadable(true);
    else downloadable(false);
  }, [current]);

  const processFiles = (copy: boolean) => {
    const accepted = [];
    const dismissed: string[] = [];
    for (const link of processed) {
      if (link.accepted) {
        accepted.push(`https://www.youtube.com/watch?v=${link.video_id}\n`);
      } else {
        dismissed.push(
          `${link.title}: https://www.youtube.com/watch?v=${link.video_id}\n`
        );
      }
    }
    if (copy) {
      navigator.clipboard.writeText(accepted.join(""));
    } else {
      download("accepted.txt", accepted);
      setTimeout(() => {
        download("dismissed.txt", dismissed);
      }, 100);
    }
  };

  return (
    <>
      {current >= links.length ? (
        <CardHeader className="text-2xl font-bold">Download</CardHeader>
      ) : (
        <div className="text-2xl font-bold mt-6 px-6 pb-2 truncate w-full">
          {links[Math.min(links.length, current)].title}
        </div>
      )}
      <CardContent
        className={`${
          current >= links.length ? "text-secondary-foreground" : "w-[560px]"
        } transition-all`}
      >
        {current < links.length ? (
          links.map((link, index) => (
            <VideoEmbed key={index} link={link} current={current == index} />
          ))
        ) : (
          <>
            By clicking the Download button a{" "}
            <span className="text-primary">`accepted.txt`</span> file will be
            Downloaded that contains all accepted links and a{" "}
            <span className="text-primary">`dismissed.txt`</span> file that
            contains all dismissed links. (only if more then one video accepted/dismissed)
            <br />
            By clicking on the Copy button the accepted links will be copied to
            clipboard.
          </>
        )}
      </CardContent>
      <CardFooter className="mb-4 flex justify-between items-center">
        {current < links.length ? (
          <>
            <Button
              disabled={processed.length == 0}
              className="h-10 w-10 p-2"
              variant={"outline"}
              onClick={goBack}
            >
              <ChevronLeft />
            </Button>
            <div>
              {current + 1}/{links.length}
            </div>
            <div className="flex gap-2">
              <Button
                disabled={links.length == current}
                onClick={() => processLink(true)}
                className="h-10 w-10 p-2"
              >
                <Check />
              </Button>
              <Button
                disabled={links.length == current}
                onClick={() => processLink(false)}
                className="h-10 w-10 p-2"
                variant={"destructive"}
              >
                <X />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex gap-2 ml-auto">
            <Button onClick={goBack} className="mr-1">Go Back</Button>
            <Button onClick={() => processFiles(true)} variant={"outline"}>
              Copy
            </Button>
            <Button onClick={() => processFiles(false)} variant={"outline"}>
              Download
            </Button>
          </div>
        )}
      </CardFooter>
    </>
  );
};

const VideoEmbed: React.FC<{ link: LinkType; current: boolean }> = ({
  link,
  current,
}) => {
  if (!current) return;
  return (
    <>
      <div className="w-[560px] h-[315px] shadow-2xl shadow-primary-foreground/10 rounded-lg relative">
        <iframe
          width="560"
          height="315"
          src={`https://www.youtube-nocookie.com/embed/${link.video_id}?autoplay=1`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen 
          className="w-full rounded-lg top-0 left-0 absolute z-10"
        ></iframe>
      </div>
    </>
  );
};

export default Page;
