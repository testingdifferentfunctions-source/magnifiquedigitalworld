import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import {
  useModeEntry,
  useCreateModeEntry,
  useUpdateModeEntry,
  useDeleteModeEntry,
  type ModeEntryType,
} from "@/hooks/useModeEntries";
import { useCategories } from "@/hooks/useCategories";
import PageLayout from "@/components/PageLayout";
import BlockEditor from "@/components/BlockEditor";
import PaletteColorEditor from "@/components/PaletteColorEditor";
import DesignEntryEditor from "@/components/DesignEntryEditor";
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
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Trash2, Upload, ExternalLink, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeUrl } from "@/lib/validation";
import type { ContentBlock } from "@/lib/blocks";

const TYPE_OPTIONS: { value: ModeEntryType; label: string }[] = [
  { value: "news", label: "Новини (News)" },
  { value: "palette", label: "Палітри (Palettes)" },
  { value: "resource", label: "Ресурси (Resources)" },
  { value: "component", label: "Компоненти (Components)" },
  { value: "template", label: "Сніпети (Snippets)" },
  { value: "dictionary", label: "Словник (Dictionary)" },
  { value: "design", label: "Дизайн (Design)" },
];

const VALID_TYPES: ModeEntryType[] = ["news", "palette", "resource", "component", "template", "dictionary", "design"];

const modeEntrySchema = z.object({
  type: z.enum(["news", "palette", "resource", "component", "template", "dictionary", "design"]),
  slug: z.string().trim().optional().nullable().or(z.literal("")),
  title_uk: z
    .string()
    .trim()
    .min(1, { message: "Заголовок (UK) обов'язковий" })
    .max(200, { message: "Заголовок занадто довгий" }),
  title_en: z.string().trim().max(200).optional().nullable().or(z.literal("")),
  description_uk: z
    .string()
    .trim()
    .min(1, { message: "Опис (UK) обов'язковий" })
    .max(1000, { message: "Опис занадто довгий" }),
  description_en: z.string().trim().max(1000).optional().nullable().or(z.literal("")),
  image_url: z.string().trim().optional().nullable().or(z.literal("")),
  image_source_url: z.string().trim().optional().nullable().or(z.literal("")),
  external_url: z.string().trim().optional().nullable().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(true),
  canonical_url_uk: z.string().trim().optional().nullable().or(z.literal("")),
  canonical_url_en: z.string().trim().optional().nullable().or(z.literal("")),
  blocks_uk: z.array(z.any()).default([]),
  blocks_en: z.array(z.any()).default([]),
});

type FormValues = z.infer<typeof modeEntrySchema>;

const ModeEntryEditor = () => {
  const { type: rawType, id } = useParams<{ type?: string; id?: string }>();
  const initialType: ModeEntryType =
    rawType && VALID_TYPES.includes(rawType as ModeEntryType)
      ? (rawType as ModeEntryType)
      : "news";

  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { data: existingEntry, isLoading: entryLoading } = useModeEntry(id || "");
  const createEntry = useCreateModeEntry();
  const updateEntry = useUpdateModeEntry();
  const deleteEntry = useDeleteModeEntry();

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<"uk" | "en">("uk");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const isEditing = !!id;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(modeEntrySchema),
    defaultValues: {
      type: initialType,
      slug: "",
      title_uk: "",
      title_en: "",
      description_uk: "",
      description_en: "",
      image_url: "",
      image_source_url: "",
      external_url: "",
      tags: [],
      published: true,
      canonical_url_uk: "",
      canonical_url_en: "",
      blocks_uk: [],
      blocks_en: [],
    },
  });

  const watchedType = watch("type");
  const watchedTags = watch("tags") || [];
  const { data: modeCategories = [] } = useCategories(watchedType);

  const activeCategory = modeCategories.find((c) => c.id === selectedCategoryId) || modeCategories[0];
  const categorySubcategories = activeCategory?.subcategories || [];

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (existingEntry) {
      reset({
        type: existingEntry.type,
        slug: existingEntry.slug ?? "",
        title_uk: existingEntry.title_uk ?? "",
        title_en: existingEntry.title_en ?? "",
        description_uk: existingEntry.description_uk ?? "",
        description_en: existingEntry.description_en ?? "",
        image_url: existingEntry.image_url ?? "",
        image_source_url: existingEntry.image_source_url ?? "",
        external_url: existingEntry.external_url ?? "",
        tags: existingEntry.tags ?? [],
        published: existingEntry.published,
        canonical_url_uk: existingEntry.canonical_url_uk ?? "",
        canonical_url_en: existingEntry.canonical_url_en ?? "",
        blocks_uk: existingEntry.blocks_uk ?? [],
        blocks_en: existingEntry.blocks_en ?? [],
      });
    } else if (rawType && VALID_TYPES.includes(rawType as ModeEntryType)) {
      setValue("type", rawType as ModeEntryType);
    }
  }, [existingEntry, rawType, reset, setValue]);

  const watchedImageUrl = watch("image_url");
  const isCodeMode =
    watchedType === "component" ||
    watchedType === "template" ||
    watchedType === "dictionary";

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
      const fileName = `entries/${crypto.randomUUID()}.${fileExt}`;
      const { error } = await supabase.storage.from("article-images").upload(fileName, file);
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from("article-images").getPublicUrl(fileName);
      setValue("image_url", publicUrl, { shouldValidate: true, shouldDirty: true });
      toast.success("Зображення успішно завантажено");
    } catch (err: any) {
      toast.error(err?.message || "Помилка завантаження зображення");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onFormError = (formErrors: any) => {
    console.error("Form validation errors:", formErrors);
    const firstKey = Object.keys(formErrors)[0];
    const firstMsg =
      formErrors[firstKey]?.message ||
      "Виправте помилки у формі (українська назва та опис обов'язкові)";
    toast.error(firstMsg);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const isCodeOnly =
        values.type === "component" ||
        values.type === "template" ||
        values.type === "dictionary";
      const payload = {
        type: values.type,
        slug: values.slug?.trim() || null,
        title_uk: values.title_uk.trim(),
        title_en: values.title_en?.trim() || null,
        description_uk: values.description_uk.trim(),
        description_en: values.description_en?.trim() || null,
        image_url: isCodeOnly ? null : (sanitizeUrl(values.image_url || "") || null),
        image_source_url: isCodeOnly ? null : (sanitizeUrl(values.image_source_url || "") || null),
        external_url: sanitizeUrl(values.external_url || "") || null,
        tags: values.tags || [],
        published: values.published,
        canonical_url_uk: sanitizeUrl(values.canonical_url_uk || "") || null,
        canonical_url_en: sanitizeUrl(values.canonical_url_en || "") || null,
        blocks_uk: (values.blocks_uk as ContentBlock[]) || [],
        blocks_en: (values.blocks_en as ContentBlock[]) || [],
      };

      if (isEditing && id) {
        await updateEntry.mutateAsync({ id, ...payload });
        toast.success("Запис успішно оновлено");
      } else {
        await createEntry.mutateAsync(payload);
        toast.success("Запис успішно створено");
      }
      navigate("/admin");
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err?.message || "Помилка збереження запису");
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Ви впевнені, що хочете видалити цей запис?")) return;
    try {
      await deleteEntry.mutateAsync(id);
      toast.success("Запис видалено");
      navigate("/admin");
    } catch (err: any) {
      toast.error(err?.message || "Помилка видалення");
    }
  };

  if (authLoading || (isEditing && entryLoading)) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Завантаження...</p>
        </div>
      </PageLayout>
    );
  }

  if (!isAdmin) return null;

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад до панелі керування
          </Button>
          {isEditing && (
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Видалити
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>
                {isEditing ? "Редагування запису" : "Створення нового запису"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Type and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entry-type">Тип запису</Label>
                  <Controller
                    control={control}
                    name="type"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="entry-type">
                          <SelectValue placeholder="Оберіть тип" />
                        </SelectTrigger>
                        <SelectContent>
                          {TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-6">
                  <Label htmlFor="published-switch" className="cursor-pointer">
                    Опубліковано на сайті
                  </Label>
                  <Controller
                    control={control}
                    name="published"
                    render={({ field }) => (
                      <Switch
                        id="published-switch"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Title & Description (UA) */}
              <div className="space-y-4 rounded-lg border border-border p-4 bg-muted/20">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/20 text-primary px-2 py-0.5 text-xs font-bold">
                    UA
                  </span>
                  <h3 className="font-semibold text-sm">Українська версія (обов'язково)</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title_uk">
                    Назва <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title_uk"
                    placeholder="Наприклад: Figma, Aiogram, CLI-парсер"
                    {...register("title_uk")}
                  />
                  {errors.title_uk && (
                    <p className="text-xs text-destructive">{errors.title_uk.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_uk">
                    Короткий опис <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description_uk"
                    rows={3}
                    placeholder="Короткий опис інструменту або бібліотеки для списку та прев'ю..."
                    {...register("description_uk")}
                  />
                  {errors.description_uk && (
                    <p className="text-xs text-destructive">{errors.description_uk.message}</p>
                  )}
                </div>
              </div>

              {/* Title & Description (EN) */}
              <div className="space-y-4 rounded-lg border border-border p-4 bg-muted/20">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-muted-foreground/20 text-muted-foreground px-2 py-0.5 text-xs font-bold">
                    EN
                  </span>
                  <h3 className="font-semibold text-sm">English version (optional)</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title_en">Title (English)</Label>
                  <Input
                    id="title_en"
                    placeholder="e.g. Figma, Aiogram, CLI Argument Parser"
                    {...register("title_en")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_en">Description (English)</Label>
                  <Textarea
                    id="description_en"
                    rows={3}
                    placeholder="Short description for English locale..."
                    {...register("description_en")}
                  />
                </div>
              </div>

              {/* External URL */}
              <div className="space-y-2">
                <Label htmlFor="external_url">
                  Зовнішнє посилання / Офіційний сайт
                </Label>
                <Input
                  id="external_url"
                  placeholder="https://..."
                  {...register("external_url")}
                />
              </div>

              {/* Cover Image & Source (Hidden for Components and Snippets) */}
              {!isCodeMode && (
                <div className="space-y-3">
                  <Label htmlFor="image_url">Обкладинка / Зображення</Label>
                  <div className="flex gap-2">
                    <Input
                      id="image_url"
                      placeholder="https://images.unsplash.com/..."
                      {...register("image_url")}
                    />
                    <label className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUploadingImage}
                        asChild
                      >
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          {isUploadingImage ? "Завантаження..." : "Завантажити"}
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                    </label>
                  </div>

                  {watchedImageUrl && (
                    <div className="mt-2 aspect-video max-w-sm rounded-lg overflow-hidden border border-border bg-muted">
                      <img
                        src={watchedImageUrl}
                        alt="Прев'ю обкладинки"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-2 pt-2">
                    <Label htmlFor="image_source_url">Посилання на джерело зображення</Label>
                    <Input
                      id="image_source_url"
                      placeholder="https://unsplash.com/..."
                      {...register("image_source_url")}
                    />
                  </div>
                </div>
              )}

              {/* Category & Subcategories Selector */}
              {modeCategories.length > 0 && (
                <div className="space-y-3 p-4 rounded-lg bg-muted/20 border border-border">
                  <div className="space-y-1.5">
                    <Label htmlFor="mode-category-select">Головна категорія розділу</Label>
                    <Select
                      value={selectedCategoryId || (activeCategory?.id ?? "")}
                      onValueChange={(val) => setSelectedCategoryId(val)}
                    >
                      <SelectTrigger id="mode-category-select" className="bg-background border-border">
                        <SelectValue placeholder="Оберіть категорію" />
                      </SelectTrigger>
                      <SelectContent>
                        {modeCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name} {cat.name_en ? `(${cat.name_en})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {categorySubcategories.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <Label className="text-xs font-semibold text-muted-foreground">
                        Підкатегорії ({activeCategory?.name}): клікніть, щоб додати або зняти з тегів
                      </Label>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {categorySubcategories.map((sub) => {
                          const isTagSelected = watchedTags.includes(sub.name);
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => {
                                if (isTagSelected) {
                                  setValue(
                                    "tags",
                                    watchedTags.filter((t) => t !== sub.name),
                                    { shouldDirty: true }
                                  );
                                } else {
                                  if (watchedTags.length < 8) {
                                    setValue("tags", [...watchedTags, sub.name], {
                                      shouldDirty: true,
                                    });
                                  } else {
                                    toast.info("Максимум 8 тегів");
                                  }
                                }
                              }}
                              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                                isTagSelected
                                  ? "bg-primary text-primary-foreground border-primary font-semibold"
                                  : "bg-background hover:bg-muted text-foreground border-border"
                              }`}
                            >
                              {isTagSelected ? "✓ " : "+ "}
                              {sub.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              <div className="space-y-2">
                <Label>Теги</Label>
                <Controller
                  control={control}
                  name="tags"
                  render={({ field }) => (
                    <TagInput
                      value={field.value ?? []}
                      tags={field.value ?? []}
                      onChange={field.onChange}
                      placeholder="Введіть тег та натисніть Enter..."
                      maxTags={8}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Editor Section (Palette, Design, OR General Block Editor) */}
          {watchedType === "palette" ? (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Блоки кольорів палітри (Color Detail Blocks)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as "uk" | "en")}
                >
                  <TabsList className="mb-4 grid w-full grid-cols-2">
                    <TabsTrigger value="uk">Українська версія (UK)</TabsTrigger>
                    <TabsTrigger value="en">English version (EN)</TabsTrigger>
                  </TabsList>

                  <TabsContent value="uk" className="space-y-4">
                    <Controller
                      control={control}
                      name="blocks_uk"
                      render={({ field }) => (
                        <PaletteColorEditor
                          blocks={field.value || []}
                          onChange={(newBlocks) => field.onChange(newBlocks)}
                          label="Блоки кольорів (UA)"
                        />
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="en" className="space-y-4">
                    <Controller
                      control={control}
                      name="blocks_en"
                      render={({ field }) => (
                        <PaletteColorEditor
                          blocks={field.value || []}
                          onChange={(newBlocks) => field.onChange(newBlocks)}
                          label="Color Detail Blocks (EN)"
                        />
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : watchedType === "design" ? (
            <div className="space-y-4">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as "uk" | "en")}
              >
                <TabsList className="mb-4 grid w-full grid-cols-2">
                  <TabsTrigger value="uk">Українська версія (UK)</TabsTrigger>
                  <TabsTrigger value="en">English version (EN)</TabsTrigger>
                </TabsList>

                <TabsContent value="uk" className="space-y-4">
                  <Controller
                    control={control}
                    name="blocks_uk"
                    render={({ field }) => (
                      <DesignEntryEditor
                        blocks={field.value || []}
                        onChange={(newBlocks) => field.onChange(newBlocks)}
                        titleUk={watch("title_uk")}
                        descriptionUk={watch("description_uk")}
                        imageUrl={watch("image_url") || ""}
                        onImageUrlChange={(url) => setValue("image_url", url, { shouldDirty: true })}
                        locale="uk"
                      />
                    )}
                  />
                </TabsContent>

                <TabsContent value="en" className="space-y-4">
                  <Controller
                    control={control}
                    name="blocks_en"
                    render={({ field }) => (
                      <DesignEntryEditor
                        blocks={field.value || []}
                        onChange={(newBlocks) => field.onChange(newBlocks)}
                        titleUk={watch("title_en") || watch("title_uk")}
                        descriptionUk={watch("description_en") || watch("description_uk")}
                        imageUrl={watch("image_url") || ""}
                        onImageUrlChange={(url) => setValue("image_url", url, { shouldDirty: true })}
                        locale="en"
                      />
                    )}
                  />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Контент сторінки (Блочний редактор)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as "uk" | "en")}
                >
                  <TabsList className="mb-4 grid w-full grid-cols-2">
                    <TabsTrigger value="uk">Українська версія (UK)</TabsTrigger>
                    <TabsTrigger value="en">English version (EN)</TabsTrigger>
                  </TabsList>

                  <TabsContent value="uk" className="space-y-4">
                    <p className="text-xs text-muted-foreground">
                      Додавайте заголовки, абзаци, списки або фрагменти коду для
                      детальної сторінки матеріалу.
                    </p>
                    <Controller
                      control={control}
                      name="blocks_uk"
                      render={({ field }) => (
                        <BlockEditor
                          value={field.value || []}
                          onChange={(blocks) =>
                            field.onChange(blocks)
                          }
                          label="Блоки українського контенту"
                        />
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="en" className="space-y-4">
                    <p className="text-xs text-muted-foreground">
                      Optional: Structured content blocks for English localization.
                    </p>
                    <Controller
                      control={control}
                      name="blocks_en"
                      render={({ field }) => (
                        <BlockEditor
                          value={field.value || []}
                          onChange={(blocks) =>
                            field.onChange(blocks)
                          }
                          label="English Content Blocks"
                        />
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* SEO Settings Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">SEO Налаштування / SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="canonical_url_uk">Canonical URL (UA)</Label>
                  <Input
                    id="canonical_url_uk"
                    type="url"
                    placeholder="https://example.com/ua/..."
                    {...register("canonical_url_uk")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Канонічне посилання для української версії матеріалу
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canonical_url_en">Canonical URL (EN)</Label>
                  <Input
                    id="canonical_url_en"
                    type="url"
                    placeholder="https://example.com/en/..."
                    {...register("canonical_url_en")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Canonical link for the English version of the content
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Action Bar */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin")}
            >
              Скасувати
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Збереження..." : isEditing ? "Оновити запис" : "Створити запис"}
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default ModeEntryEditor;
