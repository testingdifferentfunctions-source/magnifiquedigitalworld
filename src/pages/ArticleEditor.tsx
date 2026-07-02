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
import TagInput from '@/components/TagInput';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { articleSchema, sanitizeUrl, sanitizeHtml } from '@/lib/validation';

const ArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { data: existingArticle, isLoading: articleLoading } = useArticle(id || '');
  const { data: categories = [] } = useCategories();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [published, setPublished] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
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
      setTitle(existingArticle.title);
      setDescription(existingArticle.description);
      setContent(existingArticle.content);
      setImageUrl(existingArticle.image_url);
      setCategoryId(existingArticle.category_id || '');
      setPublished(existingArticle.published);
      setTags(existingArticle.tags || []);
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

  const validateForm = (): boolean => {
    const sanitizedImageUrl = sanitizeUrl(imageUrl);
    
    const result = articleSchema.safeParse({
      title: title.trim(),
      description: description.trim(),
      content,
      image_url: sanitizedImageUrl || undefined,
      category_id: categoryId || null,
      published,
    });

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        newErrors[field] = err.message;
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Виправте помилки у формі');
      return;
    }

    setSaving(true);
    try {
      const sanitizedImageUrl = sanitizeUrl(imageUrl);
      
      const articleData = {
        title: title.trim(),
        description: description.trim(),
        content: sanitizeHtml(content),
        image_url: sanitizedImageUrl || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
        category_id: categoryId || null,
        published,
        tags,
        reads: existingArticle?.reads || 0,
        likes: existingArticle?.likes || 0,
        impressions: existingArticle?.impressions || 0,
        share_count: (existingArticle as any)?.share_count || 0
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
            <div className="space-y-2">
              <Label htmlFor="title">Заголовок</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                placeholder="Введіть заголовок статті"
                maxLength={200}
                className={`bg-background border-border ${errors.title ? 'border-destructive' : ''}`}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Короткий опис</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors({ ...errors, description: '' });
                }}
                placeholder="Короткий опис для картки статті"
                maxLength={500}
                className={`bg-background border-border ${errors.description ? 'border-destructive' : ''}`}
                rows={2}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              <p className="text-xs text-muted-foreground">{description.length}/500</p>
            </div>

            <div className="space-y-2">
              <Label>Вміст статті</Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                maxLength={50000}
              />
            </div>

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
              <Label htmlFor="category">Розділ</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Оберіть розділ" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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


            <div className="flex items-center gap-3">
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
              <Label htmlFor="published">Опублікувати статтю</Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ArticleEditor;
