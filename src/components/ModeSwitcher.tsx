import { useMode, MODE_LABELS, AppMode } from "@/hooks/useMode";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModeSwitcherProps {
  className?: string;
}

const ModeSwitcher = ({ className }: ModeSwitcherProps) => {
  const { mode, setMode, modes } = useMode();

  return (
    <Select value={mode} onValueChange={(value) => setMode(value as AppMode)}>
      <SelectTrigger className={`h-9 w-[150px] bg-card border-border ${className ?? ""}`} aria-label="Режим контенту">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-popover border-border">
        {modes.map((m) => (
          <SelectItem key={m} value={m}>
            {MODE_LABELS[m]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ModeSwitcher;
