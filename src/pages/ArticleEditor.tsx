import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useArticle, useCreateArticle, useUpdateArticle, useDeleteArticle } from '@/hooks/useArticles';
import { useCategories } from '@/hooks/useCategories';
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
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { articleSchema, sanitizeUrl, sanitizeHtml } from '@/lib/validation';

const ArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { data: existingArticle, isLoading: articleLoading } = useArticle(id || '');
  const { data: categories = [] } = useCategories('articles');
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();

  // Selected Category subcategories
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const availableSubcategories = selectedCategory?.subcategories || [];

  // Ukrainian (base) fields
  const [titleUk, setTitleUk] = useState('');
  const [descriptionUk, setDescriptionUk] = useState('');
  const [contentUk, setContentUk] = useState('');
  // English fields
  const [titleEn, setTitleEn] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [contentEn, setContentEn] = useState('');

  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [published, setPublished] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [canonicalUrlUk, setCanonicalUrlUk] = useState('');
  const [canonicalUrlEn, setCanonicalUrlEn] = useState('');
  const [originalSourceUrl, setOriginalSourceUrl] = useState('');
  const [showTestButton, setShowTestButton] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!id;

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (existingArticle) {
      setTitleUk(existingArticle.title_uk ?? existingArticle.title ?? '');
      setDescriptionUk(existingArticle.description_uk ?? existingArticle.description ?? '');
      setContentUk(existingArticle.content_uk ?? existingArticle.content ?? '');
      setTitleEn(existingArticle.title_en ?? '');
      setDescriptionEn(existingArticle.description_en ?? '');
      setContentEn(existingArticle.content_en ?? '');
      setImageUrl(existingArticle.image_url);
      setCategoryId(existingArticle.category_id || '');
      setPublished(existingArticle.published);
      setShowTestButton(Boolean((existingArticle as any)?.show_test_button ?? (existingArticle as any)?.showTestButton));
      setTags(existingArticle.tags || []);
      setCanonicalUrlUk(existingArticle.canonical_url_uk ?? existingArticle.original_source_url ?? '');
      setCanonicalUrlEn(existingArticle.canonical_url_en ?? '');
      setOriginalSourceUrl(existingArticle.original_source_url || '');
    }
  }, [existingArticle]);

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
    const sanitizedImageUrl = sanitizeUrl(imageUrl);
    const sanitizedCanonicalUk = sanitizeUrl(canonicalUrlUk);
    const sanitizedCanonicalEn = sanitizeUrl(canonicalUrlEn);

    // Ukrainian is required (base language)
    const result = articleSchema.safeParse({
      title: titleUk.trim(),
      description: descriptionUk.trim(),
      content: contentUk,
      image_url: sanitizedImageUrl || undefined,
      category_id: categoryId || null,
      published,
      show_test_button: showTestButton,
      showTestButton,
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
      const sanitizedImageUrl = sanitizeUrl(imageUrl);
      const sanitizedCanonicalUk = sanitizeUrl(canonicalUrlUk);
      const sanitizedCanonicalEn = sanitizeUrl(canonicalUrlEn);

      const articleData = {
        // Legacy columns kept in sync with Ukrainian (base) content
        title: titleUk.trim(),
        description: descriptionUk.trim(),
        content: sanitizeHtml(contentUk),
        // Per-language fields
        title_uk: titleUk.trim(),
        description_uk: descriptionUk.trim(),
        content_uk: sanitizeHtml(contentUk),
        title_en: titleEn.trim() || null,
        description_en: descriptionEn.trim() || null,
        content_en: contentEn.trim() ? sanitizeHtml(contentEn) : null,
        image_url: sanitizedImageUrl || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
        category_id: categoryId || null,
        published,
        show_test_button: showTestButton,
        showTestButton: showTestButton,
        tags,
        canonical_url_uk: sanitizedCanonicalUk || null,
        canonical_url_en: sanitizedCanonicalEn || null,
        original_source_url: sanitizedCanonicalUk || sanitizedCanonicalEn || originalSourceUrl.trim() || null,
        reads: existingArticle?.reads || 0,
        likes: existingArticle?.likes || 0,
        impressions: existingArticle?.impressions || 0,
        share_count: existingArticle?.share_count || 0,
      };

      if (isEditing) {
        await updateArticle.mutateAsync({ id, ...articleData });
        toast.success('Статтю оновлено');
      } else {
        await createArticle.mutateAsync(articleData);
        toast.success('Статтю створено');
        navigate('/admin');
      }
    } catch {
      toast.error('Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Ви впевнені, що хочете видалити цю статтю?')) return;

    try {
      await deleteArticle.mutateAsync(id!);
      toast.success('Статтю видалено');
      navigate('/admin');
    } catch {
      toast.error('Помилка видалення');
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <div className="flex gap-2">
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
                  value={titleUk}
                  onChange={(e) => {
                    setTitleUk(e.target.value);
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
                  value={descriptionUk}
                  onChange={(e) => {
                    setDescriptionUk(e.target.value);
                    if (errors.description) setErrors({ ...errors, description: '' });
                  }}
                  placeholder="Короткий опис для картки статті"
                  maxLength={500}
                  className={`bg-background border-border ${errors.description ? 'border-destructive' : ''}`}
                  rows={2}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                <p className="text-xs text-muted-foreground">{descriptionUk.length}/500</p>
              </div>

              <div className="space-y-2">
                <Label>Вміст статті (UA)</Label>
                <RichTextEditor value={contentUk} onChange={setContentUk} maxLength={50000} />
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
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="Enter English title"
                  maxLength={200}
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description-en">Short description (EN)</Label>
                <Textarea
                  id="description-en"
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder="Card description in English"
                  maxLength={500}
                  className="bg-background border-border"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">{descriptionEn.length}/500</p>
              </div>

              <div className="space-y-2">
                <Label>Article content (EN)</Label>
                <RichTextEditor value={contentEn} onChange={setContentEn} maxLength={50000} />
                <p className="text-xs text-muted-foreground">
                  If left blank, Ukrainian text will be shown to English visitors.
                </p>
              </div>
            </section>

            <Separator />

            <div className="space-y-2">
              <Label>Зображення статті</Label>
              <ImageDropzone
                value={imageUrl}
                onChange={(url) => {
                  setImageUrl(url);
                  if (errors.image_url) setErrors({ ...errors, image_url: '' });
                }}
              />
              {errors.image_url && <p className="text-sm text-destructive">{errors.image_url}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Розділ (Головна категорія)</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
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
                  Швидкі підкатегорії розділу (клікніть, щоб додати у теги):
                </Label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {availableSubcategories.map((sub) => {
                    const isSelected = tags.includes(sub.name);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setTags(tags.filter((t) => t !== sub.name));
                          } else {
                            if (tags.length < 5) {
                              setTags([...tags, sub.name]);
                            } else {
                              toast.info('Максимум 5 тегів');
                            }
                          }
                        }}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          isSelected
                            ? 'bg-[#A07DFA] text-white border-[#A07DFA] font-semibold'
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
              <Label>Теги (підтеми)</Label>
              <TagInput
                value={tags}
                onChange={setTags}
                maxTags={5}
                maxTagsHelperText="Maximum 5 tags allowed"
                placeholder="Введіть тег та натисніть Enter"
              />
            </div>

            <Separator />

            {/* SEO Settings */}
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-semibold text-foreground">SEO Налаштування / SEO Settings</h4>
                <p className="text-xs text-muted-foreground">
                  Вкажіть канонічні посилання для української та англійської версій статті
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="canonical-url-uk">Canonical URL (UA)</Label>
                  <Input
                    id="canonical-url-uk"
                    type="url"
                    value={canonicalUrlUk}
                    onChange={(e) => {
                      setCanonicalUrlUk(e.target.value);
                      if (errors.canonical_url_uk) setErrors({ ...errors, canonical_url_uk: '' });
                    }}
                    placeholder="https://example.com/ua/article-slug"
                    className={`bg-background border-border ${errors.canonical_url_uk ? 'border-destructive' : ''}`}
                  />
                  {errors.canonical_url_uk && <p className="text-sm text-destructive">{errors.canonical_url_uk}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canonical-url-en">Canonical URL (EN)</Label>
                  <Input
                    id="canonical-url-en"
                    type="url"
                    value={canonicalUrlEn}
                    onChange={(e) => {
                      setCanonicalUrlEn(e.target.value);
                      if (errors.canonical_url_en) setErrors({ ...errors, canonical_url_en: '' });
                    }}
                    placeholder="https://example.com/en/article-slug"
                    className={`bg-background border-border ${errors.canonical_url_en ? 'border-destructive' : ''}`}
                  />
                  {errors.canonical_url_en && <p className="text-sm text-destructive">{errors.canonical_url_en}</p>}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border">
                <div className="space-y-0.5 pr-4">
                  <Label htmlFor="show-test-button" className="text-base font-semibold cursor-pointer">
                    Додати кнопку &quot;Тестувати&quot;
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Відображає кнопку &quot;Тестувати&quot; поруч із кнопкою &quot;Поділитися&quot; внизу статті для швидкого переходу до інтерактивного онлайн-редактора коду.
                  </p>
                </div>
                <Switch
                  id="show-test-button"
                  checked={showTestButton}
                  onCheckedChange={setShowTestButton}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                />
                <Label htmlFor="published" className="cursor-pointer font-medium">Опублікувати статтю</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ArticleEditor;
