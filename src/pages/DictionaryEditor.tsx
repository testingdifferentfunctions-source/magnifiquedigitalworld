import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import {
  useModeEntry,
  useCreateModeEntry,
  useUpdateModeEntry,
  useDeleteModeEntry,
} from "@/hooks/useModeEntries";
import { useCategories } from "@/hooks/useCategories";
import PageLayout from "@/components/PageLayout";
import DictionaryBlockEditor from "@/components/DictionaryBlockEditor";
import TagInput from "@/components/TagInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, BookMarked, Save, Trash2, Globe, ExternalLink, Clock, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  dictionaryEntrySchema,
  type DictionaryEntryFormValues,
  sanitizeUrl,
} from "@/lib/validation";
import type { ContentBlock } from "@/lib/blocks";
import { getAdminRoute } from "@/lib/adminPath";
import { saveDraft, loadDraft, clearDraft, formatDraftTime } from "@/lib/autosave";

/**
 * Dedicated Admin Block Editor for "Словник" (Dictionary) mode.
 * - Text-first architecture: no preview images, cover images, or image upload fields.
 * - Structured blocks: Headings, formatted paragraphs, bullet lists, and code examples.
 * - Bilingual support: Ukrainian (required) and English (optional).
 */
export const DictionaryEditor = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { data: existingEntry, isLoading: entryLoading } = useModeEntry(id || "");
  const createEntry = useCreateModeEntry();
  const updateEntry = useUpdateModeEntry();
  const deleteEntry = useDeleteModeEntry();

  const [activeTab, setActiveTab] = useState<"uk" | "en">("uk");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const isEditing = !!id;

  // Autosave & draft tracking
  const draftKey = isEditing ? `draft_dictionary_${id}` : `draft_dictionary_new`;

  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(() => {
    const saved = loadDraft<DictionaryEntryFormValues>(draftKey);
    return saved?.savedAt ?? null;
  });
  const [hasDraftRestored, setHasDraftRestored] = useState<boolean>(() => {
    const saved = loadDraft<DictionaryEntryFormValues>(draftKey);
    return Boolean(saved && saved.data);
  });

  const { data: dictionaryCategories = [] } = useCategories("dictionary");
  const activeCategory =
    dictionaryCategories.find((c) => c.id === selectedCategoryId) ||
    dictionaryCategories[0];
  const categorySubcategories = activeCategory?.subcategories || [];

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<DictionaryEntryFormValues>({
    resolver: zodResolver(dictionaryEntrySchema),
    defaultValues: () => {
      const saved = loadDraft<DictionaryEntryFormValues>(draftKey);
      if (saved && saved.data) {
        return saved.data;
      }
      return {
        type: "dictionary",
        slug: "",
        title_uk: "",
        title_en: "",
        description_uk: "",
        description_en: "",
        category_id: "",
        external_url: "",
        tags: [],
        published: true,
        canonical_url_uk: "",
        canonical_url_en: "",
        blocks_uk: [],
        blocks_en: [],
      };
    },
  });

  const watchedTags = watch("tags") || [];
  const watchedBlocksUk = watch("blocks_uk") || [];
  const watchedBlocksEn = watch("blocks_en") || [];

  // Protect route
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Load existing dictionary entry ONLY IF no unsaved local draft exists
  useEffect(() => {
    if (existingEntry && isEditing) {
      const existingDraft = loadDraft<DictionaryEntryFormValues>(draftKey);
      if (!existingDraft || !existingDraft.data) {
        reset({
          type: "dictionary",
          slug: existingEntry.slug ?? "",
          title_uk: existingEntry.title_uk ?? "",
          title_en: existingEntry.title_en ?? "",
          description_uk: existingEntry.description_uk ?? "",
          description_en: existingEntry.description_en ?? "",
          external_url: existingEntry.external_url ?? "",
          tags: existingEntry.tags ?? [],
          published: existingEntry.published,
          canonical_url_uk: existingEntry.canonical_url_uk ?? "",
          canonical_url_en: existingEntry.canonical_url_en ?? "",
          blocks_uk: existingEntry.blocks_uk ?? [],
          blocks_en: existingEntry.blocks_en ?? [],
        });
      }
    }
  }, [existingEntry, isEditing, draftKey, reset]);

  // Flush save on window unload / visibility change / unmount
  const flushSave = useCallback(() => {
    const values = getValues();
    saveDraft(draftKey, values);
  }, [draftKey, getValues]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushSave();
      }
    };
    const handleBeforeUnload = () => {
      flushSave();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handleBeforeUnload);

    return () => {
      flushSave();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);
    };
  }, [flushSave]);

  // Continuous Autosave on form changes
  useEffect(() => {
    const subscription = watch((value) => {
      if (!value) return;

      const hasContent = Boolean(
        value.title_uk ||
        value.description_uk ||
        value.title_en ||
        value.description_en ||
        (value.tags && value.tags.length > 0) ||
        (value.blocks_uk && (value.blocks_uk as any[]).length > 0) ||
        (value.blocks_en && (value.blocks_en as any[]).length > 0)
      );

      if (hasContent || isEditing) {
        saveDraft(draftKey, value as DictionaryEntryFormValues);
        setDraftSavedAt(Date.now());
        setHasDraftRestored(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, draftKey, isEditing]);

  const handleDiscardDraft = () => {
    if (!confirm("Ви впевнені, що хочете очистити чернетку? Незбережені зміни будуть видалені.")) return;
    clearDraft(draftKey);
    setDraftSavedAt(null);
    setHasDraftRestored(false);

    if (existingEntry && isEditing) {
      reset({
        type: "dictionary",
        slug: existingEntry.slug ?? "",
        title_uk: existingEntry.title_uk ?? "",
        title_en: existingEntry.title_en ?? "",
        description_uk: existingEntry.description_uk ?? "",
        description_en: existingEntry.description_en ?? "",
        external_url: existingEntry.external_url ?? "",
        tags: existingEntry.tags ?? [],
        published: existingEntry.published,
        canonical_url_uk: existingEntry.canonical_url_uk ?? "",
        canonical_url_en: existingEntry.canonical_url_en ?? "",
        blocks_uk: existingEntry.blocks_uk ?? [],
        blocks_en: existingEntry.blocks_en ?? [],
      });
    } else {
      reset({
        type: "dictionary",
        slug: "",
        title_uk: "",
        title_en: "",
        description_uk: "",
        description_en: "",
        category_id: "",
        external_url: "",
        tags: [],
        published: true,
        canonical_url_uk: "",
        canonical_url_en: "",
        blocks_uk: [],
        blocks_en: [],
      });
    }
    toast.success("Чернетку очищено");
  };

  const onFormError = (formErrors: any) => {
    console.error("Dictionary form validation errors:", formErrors);
    const firstKey = Object.keys(formErrors)[0];
    const firstMsg =
      formErrors[firstKey]?.message ||
      "Перевірте заповнення обов'язкових полів (назва терміну та визначення українською мовою)";
    toast.error(firstMsg);
  };

  const onSubmit = async (values: DictionaryEntryFormValues) => {
    try {
      // Clean and sanitize text-only payload (guarantee image fields are null)
      const payload = {
        type: "dictionary" as const,
        slug: values.slug?.trim() || null,
        title_uk: values.title_uk.trim(),
        title_en: values.title_en?.trim() || null,
        description_uk: values.description_uk.trim(),
        description_en: values.description_en?.trim() || null,
        // Guaranteed no images for Dictionary mode
        image_url: null,
        image_source_url: null,
        external_url: sanitizeUrl(values.external_url || "") || null,
        tags: Array.isArray(values.tags) ? values.tags : [],
        published: Boolean(values.published),
        canonical_url_uk: sanitizeUrl(values.canonical_url_uk || "") || null,
        canonical_url_en: sanitizeUrl(values.canonical_url_en || "") || null,
        blocks_uk: (values.blocks_uk as ContentBlock[]) || [],
        blocks_en: (values.blocks_en as ContentBlock[]) || [],
      };

      // Crucially remove legacy un-suffixed base keys to prevent PGRST204 column errors in Supabase
      delete (payload as any).title;
      delete (payload as any).description;
      delete (payload as any).content;
      delete (payload as any).summary;
      delete (payload as any).sources;

      console.log('[DictionaryEditor] Submitting payload:', payload);

      if (isEditing && id) {
        await updateEntry.mutateAsync({ id, ...payload });
        clearDraft(draftKey);
        setDraftSavedAt(null);
        setHasDraftRestored(false);
        toast.success("Термін словника успішно оновлено");
      } else {
        await createEntry.mutateAsync(payload);
        clearDraft(draftKey);
        setDraftSavedAt(null);
        setHasDraftRestored(false);
        toast.success("Термін словника успішно створено");
      }
      navigate(getAdminRoute());
    } catch (err: any) {
      console.error("[DictionaryEditor] Save error:", err);
      toast.error(err?.message || "Помилка збереження терміну словника");
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Ви впевнені, що хочете видалити цей термін зі словника?"))
      return;
    try {
      await deleteEntry.mutateAsync(id);
      clearDraft(draftKey);
      setDraftSavedAt(null);
      setHasDraftRestored(false);
      toast.success("Термін видалено зі словника");
      navigate(getAdminRoute());
    } catch (err: any) {
      console.error("[DictionaryEditor] Delete error:", err);
      toast.error(err?.message || "Помилка видалення терміну");
    }
  };

  if (authLoading || (isEditing && entryLoading)) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Завантаження редактора словника...</p>
        </div>
      </PageLayout>
    );
  }

  if (!isAdmin) return null;

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate(getAdminRoute())}
              className="hover:bg-neutral-800 text-neutral-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад до панелі керування
            </Button>
            {draftSavedAt && (
              <div className="flex items-center gap-1.5 text-xs text-neutral-300 bg-neutral-800/80 px-2.5 py-1 rounded-md border border-neutral-700/60">
                <Clock className="w-3.5 h-3.5 text-[#F3CD97]" />
                <span>Автозбережено: {formatDraftTime(draftSavedAt)}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(draftSavedAt || hasDraftRestored) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDiscardDraft}
                className="text-xs border-neutral-700 text-neutral-400 hover:text-destructive hover:border-destructive/50"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Очистити чернетку
              </Button>
            )}
            {isEditing && (
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Видалити термін
              </Button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6">
          {/* Main Metadata Card */}
          <Card className="bg-[#191919] border-neutral-800 shadow-md">
            <CardHeader className="border-b border-neutral-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F3CD97]/15 flex items-center justify-center border border-[#F3CD97]/30">
                  <BookMarked className="w-5 h-5 text-[#F3CD97]" />
                </div>
                <div>
                  <CardTitle className="text-xl text-neutral-100 font-bold">
                    {isEditing
                      ? "Редагування терміну словника"
                      : "Створення терміну для Словника (Dictionary)"}
                  </CardTitle>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Текстовий формат без зображень: заголовки, формулювання, пункти та сніпети коду
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Publication Status & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-2">
                  <Label htmlFor="dictionary-slug" className="text-xs text-neutral-400">
                    URL-ідентифікатор (Slug)
                  </Label>
                  <Input
                    id="dictionary-slug"
                    placeholder="Наприклад: recursion, dom-tree, big-o-notation"
                    className="bg-[#121212] border-neutral-800 text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-[#F3CD97]"
                    {...register("slug")}
                  />
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-4 sm:pt-6">
                  <Label
                    htmlFor="dictionary-published-switch"
                    className="cursor-pointer text-sm font-medium text-neutral-200"
                  >
                    Опубліковано в словнику
                  </Label>
                  <Controller
                    control={control}
                    name="published"
                    render={({ field }) => (
                      <Switch
                        id="dictionary-published-switch"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Category & Subcategory Taxonomy Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-400">Категорія словника</Label>
                  <Select
                    value={selectedCategoryId}
                    onValueChange={(val) => {
                      setSelectedCategoryId(val);
                      const cat = dictionaryCategories.find((c) => c.id === val);
                      if (cat && !watchedTags.includes(cat.name)) {
                        setValue("tags", [...watchedTags, cat.name]);
                      }
                    }}
                  >
                    <SelectTrigger className="bg-[#121212] border-neutral-800 text-neutral-200">
                      <SelectValue placeholder="Оберіть категорію словника" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F1F1F] border-neutral-800">
                      {dictionaryCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} {c.name_en ? `(${c.name_en})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {categorySubcategories.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-neutral-400">Підкатегорія</Label>
                    <Select
                      onValueChange={(val) => {
                        if (val && !watchedTags.includes(val)) {
                          setValue("tags", [...watchedTags, val]);
                        }
                      }}
                    >
                      <SelectTrigger className="bg-[#121212] border-neutral-800 text-neutral-200">
                        <SelectValue placeholder="Оберіть підкатегорію" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1F1F1F] border-neutral-800">
                        {categorySubcategories.map((sub) => (
                          <SelectItem key={sub.id} value={sub.name}>
                            {sub.name} {sub.name_en ? `(${sub.name_en})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Tags Input */}
              <div className="space-y-2 pt-1">
                <Label className="text-xs text-neutral-400">
                  Теги терміну (наприклад: #алгоритми, #frontend, #cs)
                </Label>
                <TagInput
                  tags={watchedTags}
                  onChange={(newTags) => setValue("tags", newTags, { shouldDirty: true })}
                  placeholder="Додайте тег і натисніть Enter..."
                />
              </div>

              {/* External Documentation / Reference Link */}
              <div className="space-y-2 pt-1">
                <Label htmlFor="external_url" className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-[#F3CD97]" />
                  Посилання на першоджерело / специфікацію (MDN, RFC, Wiki, Docs)
                </Label>
                <Input
                  id="external_url"
                  placeholder="https://developer.mozilla.org/uk/docs/..."
                  className="bg-[#121212] border-neutral-800 text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-[#F3CD97]"
                  {...register("external_url")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bilingual Tabs & Content Block Editors */}
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as "uk" | "en")}
            className="space-y-4"
          >
            <TabsList className="grid grid-cols-2 w-full bg-[#181818] border border-neutral-800 p-1 rounded-xl">
              <TabsTrigger
                value="uk"
                className="py-2.5 font-semibold text-neutral-300 data-[state=active]:bg-[#262626] data-[state=active]:text-[#F3CD97] data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                🇺🇦 Українська версія (Обов'язкова)
              </TabsTrigger>
              <TabsTrigger
                value="en"
                className="py-2.5 font-semibold text-neutral-300 data-[state=active]:bg-[#262626] data-[state=active]:text-[#F3CD97] data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                🇬🇧 English Version (Optional)
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Ukrainian Content */}
            <TabsContent value="uk" className="space-y-5">
              <Card className="bg-[#191919] border-neutral-800">
                <CardHeader className="pb-3 border-b border-neutral-800/60">
                  <CardTitle className="text-base text-neutral-200 font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#F3CD97]" />
                    Основний зміст терміну (Українська)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-5">
                  <div className="space-y-2">
                    <Label htmlFor="title_uk" className="text-xs text-neutral-400">
                      Назва терміну / Концепту <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="title_uk"
                      placeholder="Наприклад: Двійкове дерево пошуку, Closure (Замикання), Мемоізація"
                      className="bg-[#121212] border-neutral-800 text-neutral-100 placeholder:text-neutral-600 focus-visible:ring-[#F3CD97] text-base font-semibold"
                      {...register("title_uk")}
                    />
                    {errors.title_uk && (
                      <p className="text-xs text-red-400 font-medium">
                        {errors.title_uk.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description_uk" className="text-xs text-neutral-400">
                      Коротке визначення для карток та пошуку <span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      id="description_uk"
                      rows={3}
                      placeholder="Лаконічне визначення суті концепту (1-2 речення)..."
                      className="bg-[#121212] border-neutral-800 text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-[#F3CD97] leading-relaxed"
                      {...register("description_uk")}
                    />
                    {errors.description_uk && (
                      <p className="text-xs text-red-400 font-medium">
                        {errors.description_uk.message}
                      </p>
                    )}
                  </div>

                  {/* Dedicated Text Block Editor (UK) */}
                  <div className="pt-2 border-t border-neutral-800">
                    <DictionaryBlockEditor
                      label="Детальні текстові блоки опису терміну (UK)"
                      value={watchedBlocksUk}
                      onChange={(blocks) =>
                        setValue("blocks_uk", blocks, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: English Content */}
            <TabsContent value="en" className="space-y-5">
              <Card className="bg-[#191919] border-neutral-800">
                <CardHeader className="pb-3 border-b border-neutral-800/60">
                  <CardTitle className="text-base text-neutral-200 font-semibold flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#F3CD97]" />
                    English Translation (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-5">
                  <div className="space-y-2">
                    <Label htmlFor="title_en" className="text-xs text-neutral-400">
                      Term Name (English)
                    </Label>
                    <Input
                      id="title_en"
                      placeholder="e.g. Binary Search Tree, Closure, Memoization"
                      className="bg-[#121212] border-neutral-800 text-neutral-100 placeholder:text-neutral-600 focus-visible:ring-[#F3CD97]"
                      {...register("title_en")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description_en" className="text-xs text-neutral-400">
                      Short Definition (English)
                    </Label>
                    <Textarea
                      id="description_en"
                      rows={3}
                      placeholder="Concise definition in English..."
                      className="bg-[#121212] border-neutral-800 text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-[#F3CD97] leading-relaxed"
                      {...register("description_en")}
                    />
                  </div>

                  {/* Dedicated Text Block Editor (EN) */}
                  <div className="pt-2 border-t border-neutral-800">
                    <DictionaryBlockEditor
                      label="Detailed Text Blocks (EN)"
                      value={watchedBlocksEn}
                      onChange={(blocks) =>
                        setValue("blocks_en", blocks, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Bar / Save Button */}
          <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 p-4 rounded-xl bg-[#1D1D1D]/90 backdrop-blur-md border border-neutral-800 shadow-xl">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(getAdminRoute())}
              className="border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
            >
              Скасувати
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#F3CD97] hover:bg-[#e4be87] text-[#151515] font-bold px-6 shadow-md transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting
                ? "Збереження..."
                : isEditing
                ? "Оновити термін"
                : "Зберегти термін"}
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default DictionaryEditor;
