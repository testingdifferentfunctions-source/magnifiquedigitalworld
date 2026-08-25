import React, { useState, useMemo } from "react";
import {
  Category,
  Subcategory,
  CategoryMode,
  normalizeCategoryMode,
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateSubcategory,
  useUpdateSubcategory,
  useDeleteSubcategory,
} from "@/hooks/useCategories";
import { MODE_ACCENTS, MODE_LABELS, AppMode } from "@/hooks/useMode";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  MoreVertical,
  Layers,
  FileText,
  Newspaper,
  Palette,
  BookOpen,
  Code,
  Tag,
  Search,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { categorySchema, subcategorySchema } from "@/lib/validation";

const MODE_CONFIG: {
  id: CategoryMode;
  label: string;
  subLabel: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accent: string;
}[] = [
  {
    id: "articles",
    label: "Статті",
    subLabel: "Розділи блогу та туторіалів",
    icon: FileText,
    accent: "#A07DFA",
  },
  {
    id: "news",
    label: "Новини",
    subLabel: "Категорії новин IT",
    icon: Newspaper,
    accent: "#A4B885",
  },
  {
    id: "resources",
    label: "Ресурси",
    subLabel: "Інструменти та сервіси",
    icon: BookOpen,
    accent: "#5DA7DB",
  },
  {
    id: "components",
    label: "Компоненти",
    subLabel: "UI та Python бібліотеки",
    icon: Layers,
    accent: "#F1F5F9",
  },
  {
    id: "templates",
    label: "Сніпети",
    subLabel: "Шаблони та функції коду",
    icon: Code,
    accent: "#C562AF",
  },
  {
    id: "palettes",
    label: "Палітри",
    subLabel: "Стилі та теми кольорів",
    icon: Palette,
    accent: "#8ABEB9",
  },
];

const CategoryManager: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<CategoryMode>("articles");
  const [searchQuery, setSearchQuery] = useState("");

  // Data
  const { data: allCategories = [], isLoading } = useCategories(selectedMode);

  // Mutations
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const createSubcategory = useCreateSubcategory();
  const updateSubcategory = useUpdateSubcategory();
  const deleteSubcategory = useDeleteSubcategory();

  // Category Dialog State
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catNameUk, setCatNameUk] = useState("");
  const [catNameEn, setCatNameEn] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catImage, setCatImage] = useState("");
  const [catSortOrder, setCatSortOrder] = useState<number>(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [catErrors, setCatErrors] = useState<Record<string, string>>({});

  // Subcategory Dialog State
  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);
  const [parentCatForSub, setParentCatForSub] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [subNameUk, setSubNameUk] = useState("");
  const [subNameEn, setSubNameEn] = useState("");
  const [subSlug, setSubSlug] = useState("");
  const [subSortOrder, setSubSortOrder] = useState<number>(0);
  const [subErrors, setSubErrors] = useState<Record<string, string>>({});

  // Inline Quick Add State
  const [quickSubName, setQuickSubName] = useState<Record<string, string>>({});

  const activeModeConfig = useMemo(
    () => MODE_CONFIG.find((m) => m.id === selectedMode) || MODE_CONFIG[0],
    [selectedMode]
  );

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return allCategories;
    const q = searchQuery.toLowerCase();
    return allCategories.filter((cat) => {
      const matchCat =
        cat.name.toLowerCase().includes(q) ||
        (cat.name_en && cat.name_en.toLowerCase().includes(q)) ||
        (cat.slug && cat.slug.toLowerCase().includes(q));
      const matchSub = (cat.subcategories || []).some(
        (sub) =>
          sub.name.toLowerCase().includes(q) ||
          (sub.name_en && sub.name_en.toLowerCase().includes(q))
      );
      return matchCat || matchSub;
    });
  }, [allCategories, searchQuery]);

  // Image upload
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Дозволені лише зображення");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Максимальний розмір — 5 МБ");
      return;
    }
    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `categories/${crypto.randomUUID()}.${fileExt}`;
      const { error } = await supabase.storage.from("article-images").upload(fileName, file);
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from("article-images").getPublicUrl(fileName);
      setCatImage(publicUrl);
      toast.success("Зображення завантажено");
    } catch {
      toast.error("Помилка завантаження файлу");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Open Category Dialog
  const handleOpenCategoryDialog = (cat?: Category) => {
    setCatErrors({});
    if (cat) {
      setEditingCategory(cat);
      setCatNameUk(cat.name);
      setCatNameEn(cat.name_en || "");
      setCatSlug(cat.slug || "");
      setCatImage(cat.image_url || "");
      setCatSortOrder(cat.sort_order || 0);
    } else {
      setEditingCategory(null);
      setCatNameUk("");
      setCatNameEn("");
      setCatSlug("");
      setCatImage("");
      setCatSortOrder(allCategories.length);
    }
    setIsCatDialogOpen(true);
  };

  // Save Category
  const handleSaveCategory = async () => {
    const validation = categorySchema.safeParse({
      name: catNameUk.trim(),
      name_en: catNameEn.trim() || undefined,
      mode: selectedMode,
      slug: catSlug.trim() || undefined,
      image_url: catImage.trim() || undefined,
      sort_order: catSortOrder,
    });

    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        newErrors[err.path[0] as string] = err.message;
      });
      setCatErrors(newErrors);
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          name: catNameUk.trim(),
          name_en: catNameEn.trim() || null,
          slug: catSlug.trim() || null,
          image_url: catImage.trim() || null,
          sort_order: catSortOrder,
          mode: selectedMode,
        });
        toast.success("Категорію успішно оновлено");
      } else {
        await createCategory.mutateAsync({
          name: catNameUk.trim(),
          name_en: catNameEn.trim() || null,
          slug: catSlug.trim() || null,
          image_url: catImage.trim() || null,
          sort_order: catSortOrder,
          mode: selectedMode,
          sub_topics: [],
        });
        toast.success("Категорію успішно створено");
      }
      setIsCatDialogOpen(false);
    } catch (err: any) {
      console.error("Save category error:", err);
      toast.error(err?.message || "Не вдалося зберегти категорію");
    }
  };

  // Delete Category
  const handleDeleteCategory = async (cat: Category) => {
    if (!confirm(`Видалити категорію "${cat.name}" та всі її підкатегорії?`)) return;
    try {
      await deleteCategory.mutateAsync(cat.id);
      toast.success(`Категорію "${cat.name}" видалено`);
    } catch (err: any) {
      console.error("Delete category error:", err);
      toast.error(err?.message || "Помилка видалення");
    }
  };

  // Open Subcategory Dialog
  const handleOpenSubcategoryDialog = (parentCat: Category, sub?: Subcategory) => {
    setSubErrors({});
    setParentCatForSub(parentCat);
    if (sub) {
      setEditingSubcategory(sub);
      setSubNameUk(sub.name);
      setSubNameEn(sub.name_en || "");
      setSubSlug(sub.slug || "");
      setSubSortOrder(sub.sort_order || 0);
    } else {
      setEditingSubcategory(null);
      setSubNameUk("");
      setSubNameEn("");
      setSubSlug("");
      setSubSortOrder((parentCat.subcategories || []).length);
    }
    setIsSubDialogOpen(true);
  };

  // Save Subcategory
  const handleSaveSubcategory = async () => {
    if (!parentCatForSub) return;

    const validation = subcategorySchema.safeParse({
      name: subNameUk.trim(),
      name_en: subNameEn.trim() || undefined,
      category_id: parentCatForSub.id,
      mode: selectedMode,
      slug: subSlug.trim() || undefined,
      sort_order: subSortOrder,
    });

    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        newErrors[err.path[0] as string] = err.message;
      });
      setSubErrors(newErrors);
      return;
    }

    try {
      if (editingSubcategory) {
        await updateSubcategory.mutateAsync({
          id: editingSubcategory.id,
          category_id: parentCatForSub.id,
          name: subNameUk.trim(),
          previousName: editingSubcategory.name,
          name_en: subNameEn.trim() || null,
          slug: subSlug.trim() || null,
          sort_order: subSortOrder,
        });
        toast.success("Підкатегорію оновлено");
      } else {
        await createSubcategory.mutateAsync({
          category_id: parentCatForSub.id,
          name: subNameUk.trim(),
          name_en: subNameEn.trim() || null,
          slug: subSlug.trim() || null,
          sort_order: subSortOrder,
          mode: selectedMode,
        });
        toast.success("Підкатегорію додано");
      }
      setIsSubDialogOpen(false);
    } catch (err: any) {
      console.error("Save subcategory error:", err);
      toast.error(err?.message || "Помилка збереження підкатегорії");
    }
  };

  // Quick Inline Add Subcategory
  const handleQuickAddSubcategory = async (parentCat: Category) => {
    const text = (quickSubName[parentCat.id] || "").trim();
    if (!text) return;
    try {
      await createSubcategory.mutateAsync({
        category_id: parentCat.id,
        name: text,
        mode: selectedMode,
        sort_order: (parentCat.subcategories || []).length,
      });
      setQuickSubName((prev) => ({ ...prev, [parentCat.id]: "" }));
      toast.success(`Підкатегорію "${text}" додано`);
    } catch (err: any) {
      console.error("Quick add subcategory error:", err);
      toast.error(err?.message || "Помилка додавання");
    }
  };

  // Delete Subcategory
  const handleDeleteSubcategory = async (parentCat: Category, sub: Subcategory) => {
    if (!confirm(`Видалити підкатегорію "${sub.name}"?`)) return;
    try {
      await deleteSubcategory.mutateAsync({
        id: sub.id,
        category_id: parentCat.id,
        name: sub.name,
      });
      toast.success(`Підкатегорію "${sub.name}" видалено`);
    } catch (err: any) {
      console.error("Delete subcategory error:", err);
      toast.error(err?.message || "Помилка видалення підкатегорії");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Layers className="w-6 h-6 text-primary" />
              Керування категоріями та підкатегоріями
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Динамічне налаштування головних категорій (випадаючі списки) та підкатегорій (теги-пігулки) для всіх режимів
            </p>
          </div>
          <Button
            onClick={() => handleOpenCategoryDialog()}
            style={{ backgroundColor: activeModeConfig.accent, color: "#000" }}
            className="font-semibold shadow-sm hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Створити головну категорію ({activeModeConfig.label})
          </Button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 p-1.5 bg-muted/40 rounded-xl border border-border">
          {MODE_CONFIG.map((m) => {
            const Icon = m.icon;
            const isSelected = selectedMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSelectedMode(m.id);
                  setSearchQuery("");
                }}
                className={`flex items-center justify-center sm:justify-start gap-2.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all select-none ${
                  isSelected
                    ? "bg-card text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: m.accent }}
                />
                <Icon className="w-4 h-4 shrink-0" style={{ color: isSelected ? m.accent : undefined }} />
                <span className="truncate">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search bar inside mode */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Пошук категорій та підкатегорій у розділі "${activeModeConfig.label}"...`}
              className="pl-9 bg-card border-border"
            />
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            Всього: <span className="font-semibold text-foreground">{filteredCategories.length}</span> категорій
          </div>
        </div>
      </div>

      {/* Main Categories Cards List */}
      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Завантаження категорій...</div>
      ) : filteredCategories.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center flex flex-col items-center justify-center gap-3">
            <Tag className="w-10 h-10 text-muted-foreground/50" />
            <div className="space-y-1">
              <h3 className="font-semibold text-base">Немає категорій у режимі "{activeModeConfig.label}"</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "За вашим пошуковим запитом нічого не знайдено." : "Створіть першу категорію для цього режиму."}
              </p>
            </div>
            <Button
              onClick={() => handleOpenCategoryDialog()}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Додати категорію
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCategories.map((category) => {
            const subcats = category.subcategories || [];
            return (
              <Card
                key={category.id}
                className="bg-card border-border overflow-hidden transition-all duration-200 hover:border-border/80"
              >
                <CardHeader className="p-4 sm:p-5 bg-muted/15 border-b border-border/50">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-10 h-10 rounded-lg object-cover border border-border shrink-0 mt-0.5"
                        />
                      ) : (
                        <div
                          style={{ borderColor: activeModeConfig.accent }}
                          className="w-10 h-10 rounded-lg border bg-background/60 flex items-center justify-center shrink-0 mt-0.5"
                        >
                          <activeModeConfig.icon
                            className="w-5 h-5"
                            style={{ color: activeModeConfig.accent }}
                          />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-foreground">
                            {category.name}
                          </h3>
                          {category.name_en && (
                            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                              EN: {category.name_en}
                            </span>
                          )}
                          {category.slug && (
                            <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-mono">
                              /{category.slug}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Підкатегорій: <span className="font-semibold text-foreground">{subcats.length}</span> •
                          Порядок: #{category.sort_order ?? 0}
                        </p>
                      </div>
                    </div>

                    {/* Category Action Buttons */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenSubcategoryDialog(category)}
                        className="h-8 text-xs font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Підкатегорія
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenCategoryDialog(category)}
                        className="h-8 w-8 p-0"
                        title="Редагувати категорію"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCategory(category)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Видалити категорію"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Subcategories (CategoryPills) Nested List */}
                <CardContent className="p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Підкатегорії (Pill Items у фільтрах):
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      Клікніть на пігулку для редагування або видалення
                    </span>
                  </div>

                  {/* Pills representation */}
                  <div className="flex flex-wrap gap-2 items-center">
                    {subcats.length === 0 ? (
                      <span className="text-xs text-muted-foreground italic">
                        Немає доданих підкатегорій. Додайте першу через форму нижче.
                      </span>
                    ) : (
                      subcats.map((sub) => (
                        <div
                          key={sub.id}
                          style={{
                            borderColor: activeModeConfig.accent + "80",
                            backgroundColor: activeModeConfig.accent + "15",
                          }}
                          className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full text-xs font-semibold border transition-all hover:scale-105 group select-none shadow-xs"
                        >
                          <span className="text-foreground">{sub.name}</span>
                          {sub.name_en && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              ({sub.name_en})
                            </span>
                          )}

                          {/* Quick subcategory dropdown actions */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="w-5 h-5 rounded-full hover:bg-background/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors ml-0.5"
                              >
                                <MoreVertical className="w-3 h-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36 bg-card border-border text-xs">
                              <DropdownMenuItem
                                onClick={() => handleOpenSubcategoryDialog(category, sub)}
                                className="cursor-pointer gap-2"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Редагувати</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteSubcategory(category, sub)}
                                className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Видалити</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Quick Inline Subcategory Adder */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                    <Input
                      placeholder={`Швидке додавання підкатегорії до "${category.name}" (натисніть Enter)...`}
                      value={quickSubName[category.id] || ""}
                      onChange={(e) =>
                        setQuickSubName((prev) => ({
                          ...prev,
                          [category.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleQuickAddSubcategory(category);
                        }
                      }}
                      className="h-8 text-xs bg-background border-border"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleQuickAddSubcategory(category)}
                      className="h-8 text-xs shrink-0"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Додати
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MAIN CATEGORY DIALOG */}
      <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Редагування категорії" : "Нова головна категорія"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name-uk">
                Назва (Українською) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cat-name-uk"
                placeholder="Наприклад: Основи Python, Веб & Фронтенд"
                value={catNameUk}
                onChange={(e) => {
                  setCatNameUk(e.target.value);
                  if (catErrors.name) setCatErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={catErrors.name ? "border-destructive" : ""}
              />
              {catErrors.name && <p className="text-xs text-destructive">{catErrors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-name-en">Назва (English - опціонально)</Label>
              <Input
                id="cat-name-en"
                placeholder="e.g. Python Basics, Web & Frontend"
                value={catNameEn}
                onChange={(e) => setCatNameEn(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cat-slug">Slug (URL ідентифікатор)</Label>
                <Input
                  id="cat-slug"
                  placeholder="basics"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cat-sort">Порядок сортування</Label>
                <Input
                  id="cat-sort"
                  type="number"
                  placeholder="0"
                  value={catSortOrder}
                  onChange={(e) => setCatSortOrder(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-image">Обкладинка / Іконка (URL)</Label>
              <div className="flex gap-2">
                <Input
                  id="cat-image"
                  placeholder="https://..."
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUploadingImage}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleImageUpload(file);
                    };
                    input.click();
                  }}
                  className="shrink-0"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  {isUploadingImage ? "..." : "Фото"}
                </Button>
              </div>
              {catImage && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={catImage}
                    alt="Preview"
                    className="w-10 h-10 rounded object-cover border border-border"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCatImage("")}
                    className="text-xs h-7 text-muted-foreground hover:text-destructive"
                  >
                    Видалити фото
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsCatDialogOpen(false)}>
              Скасувати
            </Button>
            <Button
              onClick={handleSaveCategory}
              style={{ backgroundColor: activeModeConfig.accent, color: "#000" }}
              className="font-semibold"
            >
              {editingCategory ? "Зберегти зміни" : "Створити категорію"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CREATE / EDIT SUBCATEGORY DIALOG */}
      <Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSubcategory ? "Редагування підкатегорії" : "Нова підкатегорія"}
            </DialogTitle>
            <CardDescription>
              Батьківська категорія:{" "}
              <span className="font-semibold text-foreground">{parentCatForSub?.name}</span>
            </CardDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="sub-name-uk">
                Назва підкатегорії (Українською) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sub-name-uk"
                placeholder="Наприклад: FastAPI, Синтаксис, React"
                value={subNameUk}
                onChange={(e) => {
                  setSubNameUk(e.target.value);
                  if (subErrors.name) setSubErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={subErrors.name ? "border-destructive" : ""}
              />
              {subErrors.name && <p className="text-xs text-destructive">{subErrors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sub-name-en">Назва (English - опціонально)</Label>
              <Input
                id="sub-name-en"
                placeholder="e.g. FastAPI, Syntax, React"
                value={subNameEn}
                onChange={(e) => setSubNameEn(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sub-slug">Slug (Тег / Ідентифікатор)</Label>
                <Input
                  id="sub-slug"
                  placeholder="fastapi"
                  value={subSlug}
                  onChange={(e) => setSubSlug(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sub-sort">Порядок сортування</Label>
                <Input
                  id="sub-sort"
                  type="number"
                  placeholder="0"
                  value={subSortOrder}
                  onChange={(e) => setSubSortOrder(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsSubDialogOpen(false)}>
              Скасувати
            </Button>
            <Button
              onClick={handleSaveSubcategory}
              style={{ backgroundColor: activeModeConfig.accent, color: "#000" }}
              className="font-semibold"
            >
              {editingSubcategory ? "Зберегти" : "Додати підкатегорію"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManager;
