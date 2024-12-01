"use client"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { api } from '@/lib/utils';
import { X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'

export const Search = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<("s" | "a" | "v" | "p")[]>([])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key == "s" && e.metaKey) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key == "Escape") {
        setIsOpen(false);
      } else if (e.key.length == 1) {
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    }
  }, []);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    if (isOpen) input.focus();
    else input.blur();
  }, [isOpen]);

  const toggleFilter = (name: "s" | "a" | "v" | "p" | "all") => {
    if (name == "all") setFilters([]);
    else if (filters.includes(name)) setFilters(prev => prev.filter(s => s != name));
    else setFilters(prev => [name, ...prev]);
  };

  const filter = async () => {
    const query = inputRef.current?.value;
    const searchFor = filters.filter(v => ["s", "a", "v"].includes(v)).join(',');
    const result = await api(`/search?q=${query}&sf=${searchFor}`);
    console.log(result);
  };

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
            >
              Songs
            </Toggle>
            <Toggle
              pressed={filters.includes("a")}
              onPressedChange={() => toggleFilter("a")}
              variant={"better"}
            >
              Artists
            </Toggle>
            <Toggle
              pressed={filters.includes("v")}
              onPressedChange={() => toggleFilter("v")}
              variant={"better"}
            >
              Videos
            </Toggle>
            <Toggle
              pressed={filters.includes("p")}
              onPressedChange={() => toggleFilter("p")}
              variant={"better"}
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
          className={`border w-96 h-96 bg-popover/80 rounded-xl flex flex-col shadow-sm`}
        >
          <div className='p-3 border-b'>
            <Input 
              ref={inputRef}
              type='search'
              placeholder='Search..'
              onChange={filter}
            />
          </div>
        </div>
        <div className='h-10'></div>
      </div>
    </div>
  )
}
