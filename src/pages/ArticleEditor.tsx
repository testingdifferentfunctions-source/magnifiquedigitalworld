import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useArticle, useCreateArticle, useUpdateArticle, useDeleteArticle } from '@/hooks/useArticles';
import { useCategories, isValidUUID, toDeterministicUUID } from '@/hooks/useCategories';
import PageLayout from '@/components/PageLayout';
import RichTextEditor from '@/components/RichTextEditor';
import ImageDropzone from '@/components/ImageDropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import TagInput from '@/components/TagInput';
import { ArrowLeft, Save, Trash2, Clock, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { articleSchema, sanitizeUrl, sanitizeHtml } from '@/lib/validation';
import { getAdminRoute } from '@/lib/adminPath';
import { useLocalStorageDraft } from '@/hooks/useLocalStorageDraft';
import { getStoragePublicUrl } from '@/lib/storage';

export interface ArticleDraftData {
  titleUk: string;
  descriptionUk: string;
  contentUk: string;
  titleEn: string;
  descriptionEn: string;
  contentEn: string;
  imageUrlUk: string;
  imageUrlEn: string;
  imageUrl?: string;
  categoryId: string;
  published: boolean;
  showTestButton: boolean;
  tags: string[];
  canonicalUrlUk: string;
  canonicalUrlEn: string;
  originalSourceUrl: string;
}

const DEFAULT_ARTICLE_DRAFT: ArticleDraftData = {
  titleUk: '',
  descriptionUk: '',
  contentUk: '',
  titleEn: '',
  descriptionEn: '',
  contentEn: '',
  imageUrlUk: '',
  imageUrlEn: '',
  categoryId: '',
  published: false,
  showTestButton: false,
  tags: [],
  canonicalUrlUk: '',
  canonicalUrlEn: '',
  originalSourceUrl: '',
};

const ArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { data: existingArticle, isLoading: articleLoading } = useArticle(id || '');
  const { data: categories = [] } = useCategories('articles');
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();

  const isEditing = Boolean(id);
  const draftKey = isEditing ? `draft_article_edit_${id}` : 'draft_article_new';

  // Robust localStorage draft hook with lazy initialization, instant sync, & browser event handling
  const {
    value: form,
    setField,
    clearDraft,
    savedAt,
    hasDraft,
    resetValue,
    hydrateFromBackend,
    formatSavedTime,
  } = useLocalStorageDraft<ArticleDraftData>({
    key: draftKey,
    defaultValue: DEFAULT_ARTICLE_DRAFT,
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Selected Category subcategories
  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const availableSubcategories = selectedCategory?.subcategories || [];

  const handleContentUkChange = useCallback((val: string) => {
    setField('contentUk', val);
  }, [setField]);

  const handleContentEnChange = useCallback((val: string) => {
    setField('contentEn', val);
  }, [setField]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate]);

  // If editing an existing article, hydrate from database ONLY if user doesn't already have an unsaved local draft
  useEffect(() => {
    if (existingArticle && isEditing) {
      hydrateFromBackend({
        titleUk: existingArticle.title_uk ?? existingArticle.title ?? '',
        descriptionUk: existingArticle.description_uk ?? existingArticle.description ?? '',
        contentUk: existingArticle.content_uk ?? existingArticle.content ?? '',
        titleEn: existingArticle.title_en ?? '',
        descriptionEn: existingArticle.description_en ?? '',
        contentEn: existingArticle.content_en ?? '',
        imageUrlUk: existingArticle.image_url_uk || getStoragePublicUrl(existingArticle.image_url) || existingArticle.image_url || '',
        imageUrlEn: existingArticle.image_url_en || '',
        categoryId: existingArticle.category_id || '',
        published: Boolean(existingArticle.published),
        showTestButton: Boolean((existingArticle as any)?.show_test_button ?? (existingArticle as any)?.showTestButton),
        tags: existingArticle.tags || [],
        canonicalUrlUk: existingArticle.canonical_url_uk ?? existingArticle.original_source_url ?? '',
        canonicalUrlEn: existingArticle.canonical_url_en ?? '',
        originalSourceUrl: existingArticle.original_source_url || '',
      });
    }
  }, [existingArticle, isEditing, hydrateFromBackend]);

  const handleDiscardDraft = () => {
    if (!confirm('Ви впевнені, що хочете очистити чернетку? Незбережені зміни будуть видалені.')) return;

    if (existingArticle && isEditing) {
      resetValue({
        titleUk: existingArticle.title_uk ?? existingArticle.title ?? '',
        descriptionUk: existingArticle.description_uk ?? existingArticle.description ?? '',
        contentUk: existingArticle.content_uk ?? existingArticle.content ?? '',
        titleEn: existingArticle.title_en ?? '',
        descriptionEn: existingArticle.description_en ?? '',
        contentEn: existingArticle.content_en ?? '',
        imageUrlUk: existingArticle.image_url_uk || getStoragePublicUrl(existingArticle.image_url) || existingArticle.image_url || '',
        imageUrlEn: existingArticle.image_url_en || '',
        categoryId: existingArticle.category_id || '',
        published: Boolean(existingArticle.published),
        showTestButton: Boolean((existingArticle as any)?.show_test_button ?? (existingArticle as any)?.showTestButton),
        tags: existingArticle.tags || [],
        canonicalUrlUk: existingArticle.canonical_url_uk ?? existingArticle.original_source_url ?? '',
        canonicalUrlEn: existingArticle.canonical_url_en ?? '',
        originalSourceUrl: existingArticle.original_source_url || '',
      });
    } else {
      resetValue(DEFAULT_ARTICLE_DRAFT);
    }
    toast.success('Чернетку очищено');
  };

  if (authLoading || (isEditing && articleLoading)) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Завантаження...</p>
        </div>
      </PageLayout>
    );
  }

  if (!isAdmin) return null;

  const validateForm = (): { isValid: boolean; firstError?: string } => {
    const resolvedImageUrlUk = getStoragePublicUrl(form.imageUrlUk || form.imageUrl || '') || form.imageUrlUk || form.imageUrl || '';
    const sanitizedImageUrlUk = sanitizeUrl(resolvedImageUrlUk);

    const resolvedImageUrlEn = getStoragePublicUrl(form.imageUrlEn || '') || form.imageUrlEn || '';
    const sanitizedImageUrlEn = sanitizeUrl(resolvedImageUrlEn);

    const sanitizedCanonicalUk = sanitizeUrl(form.canonicalUrlUk);
    const sanitizedCanonicalEn = sanitizeUrl(form.canonicalUrlEn);

    // Ukrainian is required (base language)
    const result = articleSchema.safeParse({
      title: form.titleUk.trim(),
      description: form.descriptionUk.trim(),
      content: form.contentUk,
      image_url: sanitizedImageUrlUk || undefined,
      image_url_uk: sanitizedImageUrlUk || undefined,
      image_url_en: sanitizedImageUrlEn || undefined,
      category_id: form.categoryId || null,
      published: form.published,
      show_test_button: form.showTestButton,
      showTestButton: form.showTestButton,
      canonical_url_uk: sanitizedCanonicalUk || undefined,
      canonical_url_en: sanitizedCanonicalEn || undefined,
      original_source_url: sanitizedCanonicalUk || sanitizedCanonicalEn || undefined,
    });

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      let firstMsg = '';
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        newErrors[field] = err.message;
        if (!firstMsg) firstMsg = err.message;
      });
      setErrors(newErrors);
      return { isValid: false, firstError: firstMsg };
    }

    setErrors({});
    return { isValid: true };
  };

  const handleSave = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      toast.error(validation.firstError || 'Виправте помилки у формі (заголовок статті є обов’язковим)');
      return;
    }

    setSaving(true);
    try {
      const resolvedImageUrlUk = getStoragePublicUrl(form.imageUrlUk || form.imageUrl || '') || form.imageUrlUk || form.imageUrl || '';
      const sanitizedImageUrlUk = sanitizeUrl(resolvedImageUrlUk);

      const resolvedImageUrlEn = getStoragePublicUrl(form.imageUrlEn || '') || form.imageUrlEn || '';
      const sanitizedImageUrlEn = sanitizeUrl(resolvedImageUrlEn);

      // Clean category_id to ensure only valid UUID strings or null are sent
      const cleanCategoryId = form.categoryId && form.categoryId.trim() && isValidUUID(form.categoryId.trim())
        ? form.categoryId.trim()
        : null;

      // Construct pure article payload conforming strictly to Supabase public.articles table
      const articleData: Record<string, any> = {
        title_uk: form.titleUk.trim(),
        description_uk: form.descriptionUk.trim(),
        content_uk: sanitizeHtml(form.contentUk),
        title_en: form.titleEn.trim() || null,
        description_en: form.descriptionEn.trim() || null,
        content_en: form.contentEn.trim() ? sanitizeHtml(form.contentEn) : null,
        image_url_uk: sanitizedImageUrlUk || null,
        image_url_en: sanitizedImageUrlEn || null,
        category_id: cleanCategoryId,
        published: Boolean(form.published),
        tags: Array.isArray(form.tags) ? form.tags : [],
        reads: existingArticle?.reads || 0,
        likes: existingArticle?.likes || 0,
        impressions: existingArticle?.impressions || 0,
        share_count: existingArticle?.share_count || 0,
      };

      // Crucially remove legacy un-suffixed base keys to prevent PGRST204 column errors in Supabase
      delete articleData.title;
      delete articleData.description;
      delete articleData.content;
      delete articleData.image_url;

      console.log('[ArticleEditor] Saving article data:', articleData);

      if (isEditing && id) {
        await updateArticle.mutateAsync({ id, ...articleData });
        clearDraft();
        toast.success('Статтю успішно оновлено');
      } else {
        await createArticle.mutateAsync(articleData);
        clearDraft();
        toast.success('Статтю успішно створено');
        navigate(getAdminRoute());
      }
    } catch (err: any) {
      console.error('[ArticleEditor] Save failed:', err);
      toast.error(err?.message || 'Помилка збереження статті. Перевірте зʼєднання та заповнення полів.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Ви впевнені, що хочете видалити цю статтю?')) return;

    try {
      await deleteArticle.mutateAsync(id!);
      clearDraft();
      toast.success('Статтю видалено');
      navigate(getAdminRoute());
    } catch (err: any) {
      console.error('[ArticleEditor] Delete failed:', err);
      toast.error(err?.message || 'Помилка видалення статті');
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate(getAdminRoute())}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            {savedAt && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md border border-border/40">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Автозбережено: {formatSavedTime()}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(savedAt || hasDraft) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscardDraft}
                className="text-xs text-muted-foreground hover:text-destructive hover:border-destructive/50"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Очистити чернетку
              </Button>
            )}
            {isEditing && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Видалити
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Збереження...' : 'Зберегти'}
            </Button>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>{isEditing ? 'Редагування статті' : 'Нова стаття'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇺🇦</span>
                <h3 className="text-lg font-semibold">Українська (обов’язково)</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title-uk">Заголовок (UA)</Label>
                <Input
                  id="title-uk"
                  value={form.titleUk}
                  onChange={(e) => {
                    setField('titleUk', e.target.value);
                    if (errors.title) setErrors({ ...errors, title: '' });
                  }}
                  placeholder="Введіть заголовок статті"
                  maxLength={200}
                  className={`bg-background border-border ${errors.title ? 'border-destructive' : ''}`}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description-uk">Короткий опис (UA)</Label>
                <Textarea
                  id="description-uk"
                  value={form.descriptionUk}
                  onChange={(e) => {
                    setField('descriptionUk', e.target.value);
                    if (errors.description) setErrors({ ...errors, description: '' });
                  }}
                  placeholder="Короткий опис для картки статті"
                  maxLength={500}
                  className={`bg-background border-border ${errors.description ? 'border-destructive' : ''}`}
                  rows={2}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                <p className="text-xs text-muted-foreground">{form.descriptionUk.length}/500</p>
              </div>

              <div className="space-y-2">
                <Label>Вміст статті (UA)</Label>
                <RichTextEditor
                  key="content-uk-editor"
                  value={form.contentUk}
                  onChange={handleContentUkChange}
                  maxLength={50000}
                />
              </div>
            </section>

            <Separator />

            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇬🇧</span>
                <h3 className="text-lg font-semibold">English (optional)</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title-en">Title (EN)</Label>
                <Input
                  id="title-en"
                  value={form.titleEn}
                  onChange={(e) => setField('titleEn', e.target.value)}
                  placeholder="Enter English title"
                  maxLength={200}
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description-en">Short description (EN)</Label>
                <Textarea
                  id="description-en"
                  value={form.descriptionEn}
                  onChange={(e) => setField('descriptionEn', e.target.value)}
                  placeholder="Card description in English"
                  maxLength={500}
                  className="bg-background border-border"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">{form.descriptionEn.length}/500</p>
              </div>

              <div className="space-y-2">
                <Label>Article content (EN)</Label>
                <RichTextEditor
                  key="content-en-editor"
                  value={form.contentEn}
                  onChange={handleContentEnChange}
                  maxLength={50000}
                />
                <p className="text-xs text-muted-foreground">
                  If left blank, Ukrainian text will be shown to English visitors.
                </p>
              </div>
            </section>

            <Separator />

            {/* Dual Localized Image Upload Zones */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Preview Image (Ukrainian) */}
                <div className="space-y-2">
                  <Label className="font-medium text-sm flex items-center justify-between">
                    <span>Preview Image (Ukrainian)</span>
                    <span className="text-xs text-muted-foreground">Прев'ю (Українська)</span>
                  </Label>
                  <ImageDropzone
                    value={form.imageUrlUk || form.imageUrl || ''}
                    onChange={(url) => {
                      setField('imageUrlUk', url);
                      if (errors.image_url_uk) setErrors({ ...errors, image_url_uk: '' });
                      if (errors.image_url) setErrors({ ...errors, image_url: '' });
                    }}
                  />
                  {errors.image_url_uk && <p className="text-sm text-destructive">{errors.image_url_uk}</p>}
                  {errors.image_url && !errors.image_url_uk && <p className="text-sm text-destructive">{errors.image_url}</p>}
                </div>

                {/* Preview Image (English) */}
                <div className="space-y-2">
                  <Label className="font-medium text-sm flex items-center justify-between">
                    <span>Preview Image (English)</span>
                    <span className="text-xs text-muted-foreground">Прев'ю (English)</span>
                  </Label>
                  <ImageDropzone
                    value={form.imageUrlEn || ''}
                    onChange={(url) => {
                      setField('imageUrlEn', url);
                      if (errors.image_url_en) setErrors({ ...errors, image_url_en: '' });
                    }}
                  />
                  {errors.image_url_en && <p className="text-sm text-destructive">{errors.image_url_en}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Розділ (Головна категорія)</Label>
              <Select value={form.categoryId} onValueChange={(cat) => setField('categoryId', cat)}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Оберіть розділ" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name} {cat.name_en ? `(${cat.name_en})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick subcategories badges */}
            {availableSubcategories.length > 0 && (
              <div className="space-y-1.5 p-3 rounded-lg bg-muted/20 border border-border">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Підкатегорії (клікніть, щоб додати у теги):
                </Label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {availableSubcategories.map((sub) => {
                    const isSelected = form.tags.includes(sub.name);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setField('tags', form.tags.filter((t) => t !== sub.name));
                          } else {
                            setField('tags', [...form.tags, sub.name]);
                          }
                        }}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:bg-muted text-foreground border-border'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {sub.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Теги</Label>
              <TagInput tags={form.tags} onChange={(t) => setField('tags', t)} placeholder="Введіть теги..." />
            </div>

            <Separator />

            {/* SEO & Canonical URLs */}
            <section className="space-y-4">
              <h3 className="text-base font-semibold">SEO та Канонічні URL (Canonical Links)</h3>
              <p className="text-xs text-muted-foreground">
                Вкажіть канонічні посилання для уникнення дублювання контенту в пошукових системах Google.
              </p>

              <div className="space-y-2">
                <Label htmlFor="canonical-uk">Канонічний URL (UA)</Label>
                <Input
                  id="canonical-uk"
                  value={form.canonicalUrlUk}
                  onChange={(e) => {
                    setField('canonicalUrlUk', e.target.value);
                    if (errors.canonical_url_uk) setErrors({ ...errors, canonical_url_uk: '' });
                  }}
                  placeholder="https://example.com/original-article-ua"
                  className={`bg-background border-border ${errors.canonical_url_uk ? 'border-destructive' : ''}`}
                />
                {errors.canonical_url_uk && (
                  <p className="text-sm text-destructive">{errors.canonical_url_uk}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="canonical-en">Canonical URL (EN)</Label>
                <Input
                  id="canonical-en"
                  value={form.canonicalUrlEn}
                  onChange={(e) => {
                    setField('canonicalUrlEn', e.target.value);
                    if (errors.canonical_url_en) setErrors({ ...errors, canonical_url_en: '' });
                  }}
                  placeholder="https://example.com/original-article-en"
                  className={`bg-background border-border ${errors.canonical_url_en ? 'border-destructive' : ''}`}
                />
                {errors.canonical_url_en && (
                  <p className="text-sm text-destructive">{errors.canonical_url_en}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="source-url">Першоджерело / Оригінальне посилання (Source URL)</Label>
                <Input
                  id="source-url"
                  value={form.originalSourceUrl}
                  onChange={(e) => {
                    setField('originalSourceUrl', e.target.value);
                    if (errors.original_source_url) setErrors({ ...errors, original_source_url: '' });
                  }}
                  placeholder="https://original-publisher.com/story-123"
                  className={`bg-background border-border ${errors.original_source_url ? 'border-destructive' : ''}`}
                />
                {errors.original_source_url && (
                  <p className="text-sm text-destructive">{errors.original_source_url}</p>
                )}
              </div>
            </section>

            <Separator />

            {/* Test button feature toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40 border border-border">
              <div className="space-y-0.5">
                <Label htmlFor="show-test-button" className="text-base font-semibold cursor-pointer">
                  Кнопка &quot;Пройти тест&quot; (Interactive Test)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Відображати інтерактивну кнопку для перевірки знань наприкінці статті
                </p>
              </div>
              <Switch
                id="show-test-button"
                checked={form.showTestButton}
                onCheckedChange={(checked) => setField('showTestButton', checked)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={form.published}
                onCheckedChange={(checked) => setField('published', checked)}
              />
              <Label htmlFor="published">Опублікувати статтю</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate(getAdminRoute())}>
                Скасувати
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Збереження...' : 'Зберегти'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ArticleEditor;
