import React, { useState } from "react";
import { AppMode, MODE_ACCENTS } from "@/hooks/useMode";
import { useAuth } from "@/hooks/useAuth";
import {
  Category,
  useCreateSubcategory,
  useUpdateSubcategory,
  useDeleteSubcategory,
} from "@/hooks/useCategories";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, MoreVertical, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { subcategorySchema } from "@/lib/validation";

export interface PillItem {
  id: string;
  label: string;
  count?: number;
}

interface CategoryPillsProps {
  pills: PillItem[];
  activePillId: string;
  onSelectPill: (pillId: string) => void;
  accentColor?: string;
  mode?: AppMode;
  className?: string;
  selectedCategory?: Category | null;
}

const ITEMS_PER_ROW = 8;

const CategoryPills: React.FC<CategoryPillsProps> = ({
  pills,
  activePillId,
  onSelectPill,
  accentColor,
  mode = "articles",
  className = "",
  selectedCategory,
}) => {
  const { isAdmin } = useAuth();
  const resolvedAccent =
    accentColor || (mode ? MODE_ACCENTS[mode] : "#A07DFA") || "#A07DFA";

  const createSubcategory = useCreateSubcategory();
  const updateSubcategory = useUpdateSubcategory();
  const deleteSubcategory = useDeleteSubcategory();

  // Inline Subcategory Modal state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<{ id?: string; name: string; name_en?: string; slug?: string; sort_order?: number } | null>(null);
  const [nameUk, setNameUk] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Quick inline add state
  const [quickInput, setQuickInput] = useState("");
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  // Chunk pills into rows of maximum 8 items
  const chunkedPills = React.useMemo(() => {
    if (!pills || pills.length === 0) return [];
    const chunks: PillItem[][] = [];
    for (let i = 0; i < pills.length; i += ITEMS_PER_ROW) {
      chunks.push(pills.slice(i, i + ITEMS_PER_ROW));
    }
    return chunks;
  }, [pills]);

  const handleOpenAddDialog = () => {
    if (!selectedCategory) {
      toast.info("Оберіть конкретний розділ у випадаючому списку, щоб додати до нього підкатегорію");
      return;
    }
    setEditingSub(null);
    setNameUk("");
    setNameEn("");
    setSlug("");
    setSortOrder((selectedCategory.subcategories || []).length);
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (pill: PillItem) => {
    if (!selectedCategory) return;
    const existing = (selectedCategory.subcategories || []).find(
      (s) => s.name === pill.id || s.name === pill.label || s.id === pill.id
    );

    setEditingSub(existing ? {
      id: existing.id,
      name: existing.name,
      name_en: existing.name_en || "",
      slug: existing.slug || "",
      sort_order: existing.sort_order || 0,
    } : {
      name: pill.label,
      name_en: "",
      slug: "",
      sort_order: 0,
    });

    setNameUk(existing ? existing.name : pill.label);
    setNameEn(existing?.name_en || "");
    setSlug(existing?.slug || "");
    setSortOrder(existing?.sort_order || 0);
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleSaveSubcategory = async () => {
    if (!selectedCategory) {
      toast.error("Не обрано розділ");
      return;
    }

    const validation = subcategorySchema.safeParse({
      name: nameUk.trim(),
      name_en: nameEn.trim() || undefined,
      category_id: selectedCategory.id,
      mode: selectedCategory.mode || mode,
      slug: slug.trim() || undefined,
      sort_order: sortOrder,
    });

    if (!validation.success) {
      const errMap: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        errMap[err.path[0] as string] = err.message;
      });
      setErrors(errMap);
      return;
    }

    try {
      if (editingSub && editingSub.id) {
        await updateSubcategory.mutateAsync({
          id: editingSub.id,
          category_id: selectedCategory.id,
          name: nameUk.trim(),
          previousName: editingSub.name,
          name_en: nameEn.trim() || null,
          slug: slug.trim() || null,
          sort_order: sortOrder,
        });
        toast.success("Підкатегорію оновлено");
      } else {
        await createSubcategory.mutateAsync({
          category_id: selectedCategory.id,
          name: nameUk.trim(),
          name_en: nameEn.trim() || null,
          slug: slug.trim() || null,
          sort_order: sortOrder,
          mode: selectedCategory.mode || mode,
        });
        toast.success("Підкатегорію додано");
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Помилка збереження");
    }
  };

  const handleDeleteSubcategory = async (pill: PillItem) => {
    if (!selectedCategory) return;
    if (!confirm(`Видалити підкатегорію "${pill.label}"?`)) return;

    const existing = (selectedCategory.subcategories || []).find(
      (s) => s.name === pill.id || s.name === pill.label || s.id === pill.id
    );

    try {
      await deleteSubcategory.mutateAsync({
        id: existing?.id || pill.id,
        category_id: selectedCategory.id,
        name: pill.label,
      });
      if (activePillId === pill.id) {
        onSelectPill("all");
      }
      toast.success(`Підкатегорію "${pill.label}" видалено`);
    } catch (err: any) {
      console.error(err);
      toast.error("Помилка видалення підкатегорії");
    }
  };

  const handleQuickAdd = async () => {
    if (!selectedCategory) {
      toast.info("Оберіть конкретний розділ у випадаючому списку, щоб додати підкатегорію");
      return;
    }
    const val = quickInput.trim();
    if (!val) return;

    setIsQuickAdding(true);
    try {
      await createSubcategory.mutateAsync({
        category_id: selectedCategory.id,
        name: val,
        mode: selectedCategory.mode || mode,
        sort_order: (selectedCategory.subcategories || []).length,
      });
      setQuickInput("");
      toast.success(`Підкатегорію "${val}" додано`);
    } catch (err: any) {
      toast.error(err?.message || "Помилка додавання");
    } finally {
      setIsQuickAdding(false);
    }
  };

  if (!pills || (pills.length <= 1 && !isAdmin)) {
    return null;
  }

  return (
    <div
      id="category-pills-container"
      className={`py-2 w-full ${className}`}
      role="tablist"
      aria-label="Підкатегорії та фільтри"
    >
      {chunkedPills.map((chunk, rowIndex) => (
        <div
          key={`pill-row-${rowIndex}`}
          className="flex flex-wrap gap-3 items-center mb-3 last:mb-0"
        >
          {chunk.map((pill) => {
            const isActive = activePillId === pill.id;
            const isAll = pill.id === "all";

            return (
              <div key={pill.id} className="relative inline-flex items-center group">
                <button
                  id={`category-pill-${pill.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onSelectPill(pill.id)}
                  style={{
                    backgroundColor: isActive ? resolvedAccent : "transparent",
                    borderColor: resolvedAccent,
                  }}
                  className={`w-fit flex-none inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-200 cursor-pointer select-none whitespace-nowrap shadow-sm ${
                    isActive
                      ? "text-black shadow-md scale-[1.02] border-transparent"
                      : "text-white hover:bg-white/10 active:scale-95 opacity-90 hover:opacity-100"
                  }`}
                  title={pill.label}
                >
                  <span>{pill.label}</span>
                  {typeof pill.count === "number" && (
                    <span
                      style={{
                        backgroundColor: isActive
                          ? "rgba(0,0,0,0.18)"
                          : "rgba(255,255,255,0.15)",
                      }}
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none shrink-0 font-bold ${
                        isActive ? "text-black" : "text-white"
                      }`}
                    >
                      {pill.count}
                    </span>
                  )}
                </button>

                {/* Admin context dropdown for inline subcategory management */}
                {isAdmin && selectedCategory && !isAll && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="ml-1 w-5 h-5 rounded-full bg-background/80 hover:bg-background flex items-center justify-center text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity border border-border"
                        title="Керування підкатегорією"
                      >
                        <MoreVertical className="w-3 h-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-36 bg-card border-border text-xs">
                      <DropdownMenuItem
                        onClick={() => handleOpenEditDialog(pill)}
                        className="cursor-pointer gap-2"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Редагувати</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteSubcategory(pill)}
                        className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Видалити</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}

          {/* Admin Inline Add Button at the end of the pills */}
          {isAdmin && selectedCategory && rowIndex === chunkedPills.length - 1 && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleOpenAddDialog}
                style={{ borderColor: resolvedAccent + "80", color: resolvedAccent }}
                className="h-7 px-2.5 rounded-full text-xs font-semibold hover:bg-white/10"
              >
                <Plus className="w-3 h-3 mr-1" />
                Додати підкатегорію
              </Button>

              <div className="hidden sm:flex items-center gap-1">
                <Input
                  placeholder="Швидке додавання..."
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleQuickAdd();
                    }
                  }}
                  disabled={isQuickAdding}
                  className="h-7 w-36 text-xs bg-background/60 border-border rounded-full px-2.5"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Admin Dialog for Creating / Editing Subcategories inline */}
      {isAdmin && selectedCategory && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>
                  {editingSub ? "Редагування підкатегорії" : "Створити підкатегорію"}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 text-xs">
                <span className="text-muted-foreground">Батьківський розділ: </span>
                <span className="font-semibold text-foreground">{selectedCategory.name}</span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inline-sub-name-uk">Назва підкатегорії (UK) *</Label>
                <Input
                  id="inline-sub-name-uk"
                  placeholder="напр. AsyncIO, Tailwind, FastAPI"
                  value={nameUk}
                  onChange={(e) => setNameUk(e.target.value)}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inline-sub-name-en">Назва англійською (EN, необов'язково)</Label>
                <Input
                  id="inline-sub-name-en"
                  placeholder="напр. AsyncIO, Tailwind CSS"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="inline-sub-slug">Slug (URL)</Label>
                  <Input
                    id="inline-sub-slug"
                    placeholder="asyncio"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inline-sub-sort">Порядок сортування</Label>
                  <Input
                    id="inline-sub-sort"
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Скасувати
              </Button>
              <Button onClick={handleSaveSubcategory} className="font-semibold">
                {editingSub ? "Зберегти зміни" : "Створити"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CategoryPills;
