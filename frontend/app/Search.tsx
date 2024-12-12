"use client"
import { ArtistSearchItem, LoadingSearchItem, MediaSearchItem } from '@/components/my-ui/search';
import { ServerLoader } from '@/components/my-ui/loaders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { api, ArtistType, MediaType } from '@/lib/utils';
import { ArrowLeft, ServerCrash, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react'

type ResultType = { data: MediaType | ArtistType, type: "artist" | "media" };
type PathType = "artist" | "song";
type FilterType = "s" | "a" | "v" | "p";

// FIXME This search bar is really buggy
// TODO efficient filter function

export const Search = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterType[]>([])
  const [disabledFilters, setDisabledFilters] = useState<FilterType[]>([])
  const [results, setResults] = useState<ResultType[]>([]);
  const [resultsIn, setResultsIn] = useState<number>(0);
  const [searchState, setSearchState] = useState<string | React.ReactNode>();
  const [path, setPath] = useState<{ before: string, path: string, type: PathType, add_info: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const input = inputRef.current;
    if (!input) return;
    if (e.key == "s" && e.metaKey) {
      e.preventDefault();
      setIsOpen(true);
    }
    if (e.key == "Escape" && isOpen) {
      if (path.length > 0) {
        removePath();
      } else if (input.value != "") {
        // input.value = "";
        filter();
      } else {
        console.log("close", e.key, path.length, input.value);
        setIsOpen(false);
      }
    } else if (e.key.length == 1 && isOpen) {
      input.focus();
    }
  }, [path, isOpen]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    }
  }, [handleKeyDown]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    if (isOpen) {
      input.focus();
    } else {
      input.blur();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      clearTimeout(searchTimeout);
    }
  }, []);

  const toggleFilter = (name: FilterType | "all") => {
    let newFilters: FilterType[] = []
    if (name == "all") newFilters = [];
    else if (name == "p") newFilters = ['p'];
    else if (filters.includes(name)) newFilters = filters.filter(s => s != name);
    else newFilters = [name, ...filters];
    if (newFilters.length > 1) newFilters = newFilters.filter(s => s != "p");
    setFilters(newFilters);
  };
  
  const toggleDisabledFilter = (name: FilterType | "all") => {
    if (name == "all") setDisabledFilters([]);
    else if (disabledFilters.includes(name)) setDisabledFilters(prev => prev.filter(s => s != name));
    else setDisabledFilters(prev => [name, ...prev]);
  };

  const filter = useCallback(async () => {
    setLoading(true)
    const startMs = new Date().getTime();
    const query = inputRef.current?.value.replaceAll(" ", "%");
    if (filters.includes("p")) {
      
    } else if (query != "" || path[0]) {
      const pathType = path[0] && path[0].type;
      const aid = pathType == "artist" ? path[0].add_info : "";
      const searchFor = filters.filter(v => ["s", "a", "v"].includes(v)).join(',');
      const result = await api(`/search?q=${query}&sf=${searchFor}&aid=${aid}`);
      if (typeof result == "object") {
        setResults(result);
        setSearchState(undefined)
        if (result.length <= 0) {
          setSearchState(<span className='flex items-center gap-2 justify-center w-full'>Nothing Found..</span>);
        }
      } else {
        console.error("Something went wrong (probably the API)");
        setSearchState(<span className='flex items-center gap-2 justify-center w-full'><ServerCrash size={16} /> API Error..</span>);
      }
    } else {
      // TODO show most searched / last if logged in and else most popular
      setResults([]);
      setSearchState(undefined)
    }
    setResultsIn((new Date().getTime() - startMs) / 1000);
    setLoading(false);
  }, [path]);

  useEffect(() => {
    filter();
  }, [filters]);

  useEffect(() => {
    if (path[0] && path[0].type == "artist") {
      toggleDisabledFilter("a");
      toggleDisabledFilter("p");
    } else {
      setDisabledFilters([]);
    }
  }, [path]);

  const handleChange = () => {
    const input = inputRef.current;
    if (!input) return;
    clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(filter, 100));
    setLoading(true);
  }

  const addPath = (path: string, type: PathType, add_info: string) => {
    console.log("addPath")
    const input = inputRef.current;
    if (!input) return;
    setPath(prev => [{ before: input.value, path, type, add_info }, ...prev])
    input.value = "";
    input.focus();
    handleChange();
  };

  const removePath = useCallback(() => {
    console.log("removePath")
    const input = inputRef.current;
    if (!input) return;
    input.value = path[0].before;
    console.info(path[0].before);
    setPath(prev => prev.slice(1));
    handleChange();
  }, [path]);

  return (
    <div
      data-state={isOpen ? "open" : "closed"}
      className={`w-screen h-screen fixed top-0 left-0 data-[state=closed]:opacity-0
        data-[state=closed]:pointer-events-none z-50 backdrop-blur-sm bg-popover/30
        flex items-center justify-center transition-all duration-300`}
    >
      <div
        data-state={isOpen ? "open" : "closed"}
        className={`data-[state=closed]:scale-90 data-[state=closed]:blur-sm
          flex flex-col gap-2 transition-all duration-300`}
      >
        <div className='flex justify-between'>
          <div className='gap-2 flex'>
            <Toggle
              pressed={filters.length == 0}
              onPressedChange={() => toggleFilter("all")}
              variant={"better"}
            >
              All
            </Toggle>
            <Toggle
              pressed={filters.includes("s")}
              onPressedChange={() => toggleFilter("s")}
              variant={"better"}
              disabled={disabledFilters.includes("s")}
            >
              Songs
            </Toggle>
            <Toggle
              pressed={filters.includes("v")}
              onPressedChange={() => toggleFilter("v")}
              variant={"better"}
              disabled={disabledFilters.includes("v")}
            >
              Videos
            </Toggle>
            <Toggle
              pressed={filters.includes("a")}
              onPressedChange={() => toggleFilter("a")}
              variant={"better"}
              disabled={disabledFilters.includes("a")}
            >
              Artists
            </Toggle>
            <Toggle
              pressed={filters.includes("p")}
              onPressedChange={() => toggleFilter("p")}
              variant={"better"}
              disabled={disabledFilters.includes("p")}
            >
              Pages
            </Toggle>
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            variant={"ghost"}
            size={"icon"}
            className='text-foreground/60 hover:bg-transparent'
          >
            <X size={24} />
          </Button>
        </div>
        <div
          className={`border max-w-[1000px] w-[95vw] h-[60vh] bg-popover/80 rounded-xl 
            flex flex-col shadow-sm overflow-y-scroll scrollbar-hidden overflow-x-hidden relative transition-all`}
        >
          <div className={`${path.length == 0 && "pl-1"} p-3 border-b top-0 left-0 sticky bg-popover/90 z-50 backdrop-blur-sm w-full flex gap-2 transition-all duration-300`}>
            <Tooltip>
              <TooltipTrigger 
                onClick={removePath}
                disabled={path.length <= 0}
                className={`flex items-center justify-center rounded-md hover:bg-accent h-9 w-9
                  disabled:w-0 disabled:opacity-0 transition-all duration-300`}
              >
                <ArrowLeft size={24} />
              </TooltipTrigger>
              <TooltipContent className='no-select cursor-default'>
                ESC
              </TooltipContent>
            </Tooltip>
            <Input 
              ref={inputRef}
              type='search'
              placeholder={path[0] && path[0].path || 'Search..'}
              onChange={handleChange}
            />
          </div>
          <div className='w-full h-full flex flex-col'>
            {results.length == 0 && loading ? [...Array(8)].map((_, i) => (
              <LoadingSearchItem key={i} />
            )) : results.map(({ data, type }, index) => (
              <div key={index}>
                {type == "artist" ? (
                  <ArtistSearchItem 
                    artist={data} 
                    onPathUpdate={(value, info) => addPath(value, "artist", info)}
                  />
                ) : (
                  <MediaSearchItem 
                    media={data} 
                    onPathUpdate={(value, info, type) => addPath(value, type, info)}
                  />
                )}
              </div>
            ))}
            <div className='text-foreground/40 items-center flex w-full p-3'>
              {searchState}
            </div>
          </div>
          <div 
            className={`${!loading ? "opacity-0 h-0" : "h-10"} bg-popover/90 backdrop-blur-sm justify-center 
              w-full flex absolute bottom-0 left-0 border-t z-50`}
          >
            <ServerLoader />
          </div>
        </div>
        <div className='h-10 text-center text-foreground/40'>
          {results.length} results in {resultsIn}s
        </div>
      </div>
    </div>
  )
}

