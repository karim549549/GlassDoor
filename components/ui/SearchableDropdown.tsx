"use client";

import React, { useState, useEffect, useRef } from "react";

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
  const [searchQuery, setSearchQuery] = useState("");
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

  // Update input text when value changes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery(displayValue);
    }
  }, [value, displayValue, isOpen]);

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
            setSearchQuery(matched.name);
          } else {
            // If they typed something but it doesn't match, we set to what they typed
            // and let Yup validation handle validation error.
            if (searchQuery.trim() === "") {
              onChange("");
            } else {
              onChange(searchQuery);
            }
          }
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
    setIsOpen(true);
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  const handleOptionClick = (option: DropdownOption) => {
    onChange(option.id);
    setSearchQuery(option.name);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className="space-y-2 relative w-full font-mono text-[0.78rem] uppercase tracking-wider text-[#0E0E0D]">
      <label className="font-bold text-[0.72rem] tracking-widest text-muted-foreground block">
        {label}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={`w-full p-3 bg-[#FAF8F5] border border-[#0E0E0D] focus:outline-none placeholder-muted-foreground/60 rounded-none uppercase text-[0.78rem] transition-colors ${
            disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : "cursor-text"
          }`}
        />
        
        {/* Toggle Indicator Arrow */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0E0E0D] hover:text-[#0E0E0D]/60 focus:outline-none p-1 cursor-pointer"
        >
          {isOpen ? "▲" : "▼"}
        </button>

        {/* Dropdown Options List */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-[#F1EFE9] border border-[#0E0E0D] z-50 max-h-48 overflow-y-auto divide-y divide-[#0E0E0D]/10 shadow-[4px_4px_0px_0px_#0E0E0D] select-none">
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
                        : "hover:bg-[#0E0E0D]/5"
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
