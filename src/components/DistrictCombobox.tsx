import React, { useState, useRef, useEffect, useMemo } from 'react';
import { DOUALA_DISTRICTS } from '../data/mockData';
import { filterDistricts, POPULAR_DOUALA_DISTRICTS, removeAccents } from '../utils/textUtils';

interface DistrictComboboxProps {
  value: string;
  onChange: (district: string) => void;
  districts?: string[];
  label?: string;
  id?: string;
  placeholder?: string;
  required?: boolean;
  showPopularChips?: boolean;
  className?: string;
  helperText?: string;
}

export const DistrictCombobox: React.FC<DistrictComboboxProps> = ({
  value,
  onChange,
  districts = DOUALA_DISTRICTS,
  label,
  id = 'district-combobox',
  placeholder = 'Rechercher un quartier (ex : Akwa, Logpom, Maképè...)',
  required = false,
  showPopularChips = true,
  className = '',
  helperText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal search input with value prop changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        const trimmed = searchTerm.trim();
        if (trimmed) {
          const exactMatch = districts.find(
            (d) => removeAccents(d) === removeAccents(trimmed)
          );
          if (exactMatch) {
            onChange(exactMatch);
            setSearchTerm(exactMatch);
          } else if (trimmed !== value) {
            onChange(trimmed);
          }
        } else if (value) {
          setSearchTerm(value);
        }
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [searchTerm, value, onChange, districts]);

  const filtered = useMemo(() => {
    return filterDistricts(districts, searchTerm);
  }, [districts, searchTerm]);

  const handleSelectDistrict = (district: string) => {
    onChange(district);
    setSearchTerm(district);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      if (isOpen && filtered.length > 0) {
        e.preventDefault();
        const targetIdx = highlightedIndex >= 0 && highlightedIndex < filtered.length ? highlightedIndex : 0;
        handleSelectDistrict(filtered[targetIdx]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Highlight query within name
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const cleanQuery = removeAccents(query.trim());
    const cleanText = removeAccents(text);
    const startIndex = cleanText.indexOf(cleanQuery);
    if (startIndex === -1) return text;
    const endIndex = startIndex + query.trim().length;

    const before = text.slice(0, startIndex);
    const match = text.slice(startIndex, endIndex);
    const after = text.slice(endIndex);

    return (
      <>
        {before}
        <strong className="text-[#006946] bg-[#bfecdc]/60 rounded-xs px-0.5">{match}</strong>
        {after}
      </>
    );
  };

  return (
    <div ref={containerRef} className={`relative flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-[#151e18] uppercase tracking-wider">
          {label} {required && <span className="text-[#ba1a1a]">*</span>}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#006946] pointer-events-none" aria-hidden="true">
          location_on
        </span>

        <input
          id={id}
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={`${id}-listbox`}
          required={required}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          aria-describedby={helperText ? `${id}-helper` : undefined}
          placeholder={placeholder}
          className="w-full h-11 pl-10 pr-16 rounded-xl bg-white border border-[#dbe5dc] text-sm text-[#151e18] focus:outline-none focus:ring-2 focus:ring-[#006946] focus-visible:ring-2 focus-visible:ring-[#006946] transition-all"
        />

        {/* Clear & Dropdown toggle buttons */}
        <div className="absolute right-2 flex items-center gap-0.5">
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                onChange('');
                inputRef.current?.focus();
                setIsOpen(true);
              }}
              aria-label="Effacer le quartier"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#6e7a72] hover:text-[#151e18] hover:bg-[#ecf6ed]"
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Afficher la liste des quartiers"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#6e7a72] hover:text-[#006946] hover:bg-[#ecf6ed]"
          >
            <span
              className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-[#006946]' : ''
              }`}
            >
              expand_more
            </span>
          </button>
        </div>
      </div>

      {helperText && <p id={`${id}-helper`} className="text-[11px] text-[#6e7a72]">{helperText}</p>}

      {/* Popular district chips */}
      {showPopularChips && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] font-bold text-[#6e7a72] flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px] text-[#006946]">trending_up</span>
            Populaires :
          </span>
          {POPULAR_DOUALA_DISTRICTS.slice(0, 6).map((pop) => (
            <button
              key={pop}
              type="button"
              onClick={() => handleSelectDistrict(pop)}
              className={`text-[11px] px-2 py-0.5 rounded-full transition-all ${
                value.toLowerCase().includes(pop.toLowerCase())
                  ? 'bg-[#006946] text-white font-bold'
                  : 'bg-[#ecf6ed] text-[#006946] hover:bg-[#bfecdc] font-medium'
              }`}
            >
              {pop}
            </button>
          ))}
        </div>
      )}

      {/* Floating Suggestions Dropdown */}
      {isOpen && (
        <div
          id={`${id}-listbox`}
          role="listbox"
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-white rounded-2xl shadow-xl border border-[#dbe5dc] p-1.5 divide-y divide-[#f2fcf2] no-scrollbar animate-in fade-in-50 zoom-in-95 duration-150"
        >
          {/* Header count badge */}
          <div className="px-3 py-1.5 flex items-center justify-between text-[11px] text-[#6e7a72] font-semibold bg-[#f2fcf2] rounded-xl mb-1">
            <span>
              {filtered.length === 0
                ? 'Aucun quartier correspondant'
                : `${filtered.length} quartier${filtered.length > 1 ? 's' : ''} trouvé${filtered.length > 1 ? 's' : ''}`}
            </span>
            <span className="text-[#006946]">{districts.length} au total</span>
          </div>

          {filtered.length === 0 ? (
            <div className="p-3 text-center text-xs text-[#6e7a72] space-y-1">
              <p>Aucun quartier ne correspond à « {searchTerm} ».</p>
              <button
                type="button"
                onClick={() => handleSelectDistrict(searchTerm)}
                className="text-xs text-[#006946] font-bold underline hover:text-[#005236]"
              >
                Utiliser « {searchTerm} » comme adresse personnalisée
              </button>
            </div>
          ) : (
            filtered.map((district, idx) => {
              const isSelected = value.toLowerCase() === district.toLowerCase();
              const isHighlighted = idx === highlightedIndex;

              return (
                <button
                  key={district}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectDistrict(district)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-between transition-colors ${
                    isHighlighted
                      ? 'bg-[#ecf6ed] text-[#006946]'
                      : isSelected
                      ? 'bg-[#bfecdc]/50 text-[#006946] font-bold'
                      : 'text-[#151e18] hover:bg-[#f2fcf2]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="material-symbols-outlined text-[16px] text-[#006946]" aria-hidden="true">
                      location_on
                    </span>
                    <span className="truncate">{renderHighlightedText(district, searchTerm)}</span>
                    <span className="text-[10px] text-[#6e7a72]">(Douala)</span>
                  </div>

                  {isSelected && (
                    <span className="material-symbols-outlined text-[16px] text-[#006946]" aria-hidden="true">
                      check_circle
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
