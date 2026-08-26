import { useMode, getModeLabel, AppMode } from "@/hooks/useMode";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModeSwitcherProps {
  className?: string;
  excludeModes?: AppMode[];
}

const ModeSwitcher = ({ className, excludeModes = [] }: ModeSwitcherProps) => {
  const { mode, setMode, modes } = useMode();
  const { language } = useLanguage();

  const availableModes = modes.filter((m) => !excludeModes.includes(m));
  const currentSelected = excludeModes.includes(mode) ? (availableModes[0] || "articles") : mode;

  return (
    <Select value={currentSelected} onValueChange={(value) => setMode(value as AppMode)}>
      <SelectTrigger
        className={`h-9 w-[150px] bg-card border-border ${className ?? ""}`}
        aria-label={language === "en" ? "Content Mode" : "Режим контенту"}
      >
        <SelectValue placeholder={getModeLabel(currentSelected, language)}>
          {getModeLabel(currentSelected, language)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-popover border-border">
        {availableModes.map((m) => (
          <SelectItem key={m} value={m}>
            {getModeLabel(m, language)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ModeSwitcher;
