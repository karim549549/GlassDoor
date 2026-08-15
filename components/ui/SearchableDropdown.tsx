"use client";

import React, { useState, useEffect, useId, useRef } from "react";

export interface DropdownOption {
  id: string;
  name: string;
}

interface SearchableDropdownProps {
  label: string;
  options: DropdownOption[] | string[];
  value: string; // Current selected ID or string value
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  disabled?: boolean;
}

export function SearchableDropdown({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  // null means "nothing typed yet in this open session" - the input then falls
  // back to the selected option's display text.
  const [typedQuery, setTypedQuery] = useState<string | null>(null);
  // Several of these render on the same form, so the label association needs a
  // per-instance id rather than a hardcoded one.
  const inputId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalize options to DropdownOption[]
  const normalizedOptions = React.useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "string") {
        return { id: opt, name: opt };
      }
      return opt;
    });
  }, [options]);

  // Find the selected option's name to display when NOT focused/searching
  const selectedOption = normalizedOptions.find((opt) => opt.id === value);
  const displayValue = selectedOption ? selectedOption.name : value || "";

  // Input text is derived, not stored: while closed it always mirrors the
  // selected value, while open it shows whatever the user has typed so far.
  const searchQuery = isOpen ? (typedQuery ?? displayValue) : displayValue;

  // Handle clicking outside the dropdown container
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isOpen) {
          // Verify if current search query matches any option exactly (case-insensitive)
          const matched = normalizedOptions.find(
            (opt) => opt.name.trim().toLowerCase() === searchQuery.trim().toLowerCase()
          );

          if (matched) {
            onChange(matched.id);
          } else {
            // If they typed something but it doesn't match, we set to what they typed
            // and let Yup validation handle validation error.
            if (searchQuery.trim() === "") {
              onChange("");
            } else {
              onChange(searchQuery);
            }
          }
          setTypedQuery(null);
          setIsOpen(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, searchQuery, normalizedOptions, onChange]);

  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputFocus = () => {
    if (disabled) return;
    setTypedQuery(null);
    setIsOpen(true);
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  const handleOptionClick = (option: DropdownOption) => {
    onChange(option.id);
    setTypedQuery(null);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTypedQuery(e.target.value);
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className="space-y-2 relative w-full font-mono text-[0.78rem] uppercase tracking-wider text-foreground">
      <label htmlFor={inputId} className="font-bold text-[0.72rem] tracking-widest text-muted-foreground block">
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={`w-full p-3 bg-card border border-foreground focus:outline-none placeholder-muted-foreground/60 rounded-none uppercase text-[0.78rem] transition-colors ${
            disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : "cursor-text"
          }`}
        />
        
        {/* Toggle Indicator Arrow */}
        <button
          type="button"
          onClick={() => {
            if (disabled) return;
            setTypedQuery(null);
            setIsOpen(!isOpen);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground hover:text-foreground/60 focus:outline-none p-1 cursor-pointer"
        >
          {isOpen ? "▲" : "▼"}
        </button>

        {/* Dropdown Options List */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-background border border-foreground z-50 max-h-48 overflow-y-auto divide-y divide-foreground/10 shadow-[4px_4px_0px_0px_var(--foreground)] select-none">
            {filteredOptions.length === 0 ? (
              <div className="p-3.5 text-muted-foreground text-[0.7rem] normal-case italic">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const selected = opt.id === value;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleOptionClick(opt)}
                    className={`p-3 cursor-pointer flex items-center justify-between transition-colors ${
                      selected
                        ? "bg-orange/15 font-bold text-orange hover:bg-orange/20"
                        : "hover:bg-foreground/5"
                    }`}
                  >
                    <span>{opt.name}</span>
                    {selected && <span>✓</span>}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {error && (
        <span className="font-mono text-[0.6rem] text-accent mt-0.5 tracking-wide block leading-none transition-opacity duration-150">
          ⚠️ {error}
        </span>
      )}
    </div>
  );
}
