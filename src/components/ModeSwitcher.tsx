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
  const isDesignMode = currentSelected === "design";

  return (
    <Select value={currentSelected} onValueChange={(value) => setMode(value as AppMode)}>
      <SelectTrigger
        className={`h-9 w-[150px] transition-colors ${
          isDesignMode
            ? "bg-[#030008] text-white border-[#231b2f] hover:border-[#FFBCBC]/60 font-medium [&>svg]:text-white [&>svg]:opacity-90"
            : "bg-card border-border text-foreground"
        } ${className ?? ""}`}
        aria-label={language === "en" ? "Content Mode" : "Режим контенту"}
      >
        <SelectValue placeholder={getModeLabel(currentSelected, language)}>
          {getModeLabel(currentSelected, language)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        className={
          isDesignMode
            ? "bg-[#030008] border-[#231b2f] text-slate-100 shadow-2xl"
            : "bg-popover border-border"
        }
      >
        {availableModes.map((m) => (
          <SelectItem
            key={m}
            value={m}
            className={
              isDesignMode
                ? "text-slate-200 transition-colors duration-200 cursor-pointer focus:bg-[#FFBCBC] focus:text-black hover:bg-[#FFBCBC] hover:text-black data-[highlighted]:bg-[#FFBCBC] data-[highlighted]:text-black data-[state=checked]:bg-[#FFBCBC] data-[state=checked]:text-black [&[data-state=checked]>span>svg]:text-black [&[data-highlighted]>span>svg]:text-black [&:focus>span>svg]:text-black"
                : "transition-colors duration-200 cursor-pointer"
            }
          >
            {getModeLabel(m, language)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ModeSwitcher;
