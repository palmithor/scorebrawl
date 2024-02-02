"use client";

import { X } from "lucide-react";
import * as React from "react";
import { useEffect } from "react";

import slugify from "@sindresorhus/slugify";
import { Command as CommandPrimitive } from "cmdk";
import { Badge } from "~/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "~/components/ui/command";

export type Item = Record<"value" | "label", string>;
export const FancyMultiSelect = ({
  items,
  excludeItems = [],
  inputPlaceholder,
  onValueChange,
  closeOnSelect,
  selected,
  setSelected,
}: {
  items: Item[];
  excludeItems: Item[];
  inputPlaceholder?: string;
  onValueChange: (items: Item[]) => void;
  closeOnSelect?: boolean;
  selected: Item[];
  setSelected: React.Dispatch<React.SetStateAction<Item[]>>;
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState("");

  const handleUnselect = React.useCallback((item: Item) => {
    setSelected((prev) => prev.filter((s) => s.value !== item.value));
  }, []);

  useEffect(() => {
    onValueChange(selected);
  }, [selected]);

  useEffect(() => {});

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    if (input) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (input.value === "") {
          setSelected((prev) => {
            const newSelected = [...prev];
            newSelected.pop();
            return newSelected;
          });
        }
      }
      // This is not a default behaviour of the <input /> field
      if (e.key === "Escape") {
        input.blur();
      }
    }
  }, []);

  const selectables = items
    .filter((item) => !selected.includes(item))
    .filter((item) => !excludeItems.includes(item));

  return (
    <Command
      onKeyDown={handleKeyDown}
      className="overflow-visible bg-transparent"
      filter={(value, search) => {
        if (slugify(value).includes(slugify(search))) {
          return 1;
        }
        return 0;
      }}
    >
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selected.map((item) => {
            return (
              <Badge key={item.value} variant="secondary">
                {item.label}
                <button
                  type="button"
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(item);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => {
                    handleUnselect(item);
                    inputRef.current?.focus();
                  }}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
          {/* Avoid having the "Search" Icon */}
          <CommandPrimitive.Input
            ref={inputRef}
            value={filter}
            onValueChange={setFilter}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={selected.length === 0 ? inputPlaceholder || "" : ""}
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && selectables.length > 0 ? (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="h-full overflow-auto">
              {selectables.map((item) => (
                <CommandItem
                  key={item.value}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onSelect={() => {
                    setFilter("");
                    setSelected((prev) => {
                      const selected = [...prev, item];
                      onValueChange(selected);
                      return selected;
                    });
                    if (closeOnSelect) {
                      inputRef?.current?.blur();
                    }
                  }}
                  className={"cursor-pointer"}
                >
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ) : null}
      </div>
    </Command>
  );
};
