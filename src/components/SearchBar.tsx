import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  semanticMode?: boolean;
}

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Семантичний пошук...",
  suggestions = [],
  semanticMode = true,
}: SearchBarProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = value.trim()
    ? suggestions.filter(s => 
        s.toLowerCase().includes(value.toLowerCase()) && 
        s.toLowerCase() !== value.toLowerCase()
      ).slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : -1
      );
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      onChange(filteredSuggestions[selectedIndex]);
      setShowSuggestions(false);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div id="global-search-bar-container" className="relative w-full max-w-md" ref={containerRef}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none text-muted-foreground">
        {semanticMode ? (
          <Sparkles className="w-4 h-4 text-primary animate-pulse" aria-hidden="true" />
        ) : (
          <Search className="w-4 h-4" aria-hidden="true" />
        )}
      </div>
      <Input
        id="global-search-input"
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pl-9 pr-10 bg-background/70 backdrop-blur-sm border-border focus-visible:ring-primary/50 text-sm"
      />
      {value && (
        <Button
          id="search-clear-btn"
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange("")}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          aria-label="Очистити пошук"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-1.5 text-[11px] font-medium text-muted-foreground border-b border-border/50 flex items-center justify-between">
            <span>Підказки пошуку</span>
            <span className="text-[10px] text-primary">Семантичний збіг</span>
          </div>
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-3.5 py-2 text-sm hover:bg-accent/60 transition-colors flex items-center justify-between ${
                index === selectedIndex ? "bg-accent" : ""
              }`}
            >
              <span className="truncate">{suggestion}</span>
              <Sparkles className="w-3 h-3 text-muted-foreground shrink-0 ml-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;