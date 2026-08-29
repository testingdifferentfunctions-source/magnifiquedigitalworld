import { useNavigate, useLocation } from "react-router-dom";
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
  const navigate = useNavigate();
  const location = useLocation();

  const availableModes = modes.filter((m) => !excludeModes.includes(m));
  const currentSelected = excludeModes.includes(mode) ? (availableModes[0] || "articles") : mode;
  const isDesignMode = currentSelected === "design";
  const isResearchMode = currentSelected === "research";

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    if (newMode === "editor") {
      if (location.pathname !== "/editor") {
        navigate("/editor");
      }
    } else if (newMode === "research") {
      // If navigating to research from non-root pages other than popular/favorites, navigate to home (which renders research) or /research
      if (
        location.pathname === "/editor" ||
        location.pathname.startsWith("/section/") ||
        location.pathname.startsWith("/news/") ||
        location.pathname.startsWith("/resource/") ||
        location.pathname.startsWith("/component/") ||
        location.pathname.startsWith("/dictionary/") ||
        location.pathname.startsWith("/design/") ||
        location.pathname.startsWith("/palette/")
      ) {
        navigate("/");
      }
    } else {
      // If switching from /research, /editor, or research detail page, redirect to home root (/)
      if (
        location.pathname === "/editor" ||
        location.pathname === "/research" ||
        location.pathname.startsWith("/research/") ||
        location.pathname.startsWith("/section/")
      ) {
        navigate("/");
      }
    }
  };

  return (
    <Select value={currentSelected} onValueChange={(value) => handleModeChange(value as AppMode)}>
      <SelectTrigger
        id="mode-switcher-trigger"
        className={`h-9 w-[150px] transition-colors ${
          isDesignMode
            ? "bg-[#030008] text-white border-[#231b2f] hover:border-[#FFBCBC]/60 font-medium [&>svg]:text-white [&>svg]:opacity-90"
            : isResearchMode
            ? "bg-[#141718] text-neutral-100 border-[#253538] hover:border-[#F78D60]/60 font-medium"
            : "bg-card border-border text-foreground"
        } ${className ?? ""}`}
        aria-label={language === "en" ? "Content Mode" : "Режим контенту"}
      >
        <SelectValue placeholder={getModeLabel(currentSelected, language)}>
          {getModeLabel(currentSelected, language)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        className={`z-50 ${
          isDesignMode
            ? "bg-[#030008] border-[#231b2f] text-slate-100 shadow-2xl"
            : isResearchMode
            ? "bg-[#141718] border-[#222B2C] text-neutral-100 shadow-2xl"
            : "bg-popover border-border"
        }`}
      >
        {availableModes.map((m) => (
          <SelectItem
            key={m}
            value={m}
            className={
              isDesignMode
                ? "text-slate-200 transition-colors duration-200 cursor-pointer focus:bg-[#FFBCBC] focus:text-black hover:bg-[#FFBCBC] hover:text-black data-[highlighted]:bg-[#FFBCBC] data-[highlighted]:text-black data-[state=checked]:bg-[#FFBCBC] data-[state=checked]:text-black [&[data-state=checked]>span>svg]:text-black [&[data-highlighted]>span>svg]:text-black [&:focus>span>svg]:text-black"
                : isResearchMode
                ? "text-neutral-200 transition-colors duration-200 cursor-pointer focus:bg-[#F78D60] focus:text-[#0F0F0F] hover:bg-[#F78D60] hover:text-[#0F0F0F] data-[highlighted]:bg-[#F78D60] data-[highlighted]:text-[#0F0F0F] data-[state=checked]:bg-[#F78D60] data-[state=checked]:text-[#0F0F0F] [&[data-state=checked]>span>svg]:text-[#0F0F0F] [&[data-highlighted]>span>svg]:text-[#0F0F0F] [&:focus>span>svg]:text-[#0F0F0F]"
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
