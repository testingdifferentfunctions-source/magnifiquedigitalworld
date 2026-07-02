import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useArticles, useArticleUniqueViews } from '@/hooks/useArticles';
import { useCategories, useUpdateCategory, useCreateCategory, useDeleteCategory } from '@/hooks/useCategories';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Heart, Plus, Pencil, Trash2, FileText, Upload, BarChart3, Users, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { categorySchema } from '@/lib/validation';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TagInput from '@/components/TagInput';
import SocialLinksManager from '@/components/SocialLinksManager';

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { data: articles = [] } = useArticles(false);
  const { data: categories = [] } = useCategories();
  const updateCategory = useUpdateCategory();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSubTopics, setEditSubTopics] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');
  const [newCategorySubTopics, setNewCategorySubTopics] = useState<string[]>([]);
  const [isUploadingCategoryImage, setIsUploadingCategoryImage] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; image_url?: string }>({});
  const [statsArticleId, setStatsArticleId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Завантаження...</p>
        </div>
      </PageLayout>
    );
  }

  if (!isAdmin) return null;

  const totalReads = articles.reduce((sum, a) => sum + a.reads, 0);
  const totalLikes = articles.reduce((sum, a) => sum + a.likes, 0);
  const totalImpressions = articles.reduce((sum, a) => sum + (a.impressions || 0), 0);
  const statsArticle = articles.find(a => a.id === statsArticleId);

  const handleCategoryImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Дозволені лише зображення');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Максимальний розмір — 5 МБ');
      return;
    }
    setIsUploadingCategoryImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `categories/${crypto.randomUUID()}.${fileExt}`;
      const { error } = await supabase.storage.from('article-images').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('article-images').getPublicUrl(fileName);
      setNewCategoryImage(publicUrl);
      toast.success('Зображення завантажено');
    } catch {
      toast.error('Помилка завантаження');
    } finally {
      setIsUploadingCategoryImage(false);
    }
  };

  const validateCategory = (name: string, imageUrl: string): boolean => {
    const result = categorySchema.safeParse({
      name: name.trim(),
      image_url: imageUrl || undefined,
    });

    if (!result.success) {
      const newErrors: { name?: string; image_url?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as 'name' | 'image_url';
        newErrors[field] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editName.trim()) {
      toast.error('Назва не може бути порожньою');
      return;
    }
    if (editName.trim().length > 100) {
      toast.error('Назва занадто довга');
      return;
    }
    try {
      await updateCategory.mutateAsync({ id, name: editName.trim(), sub_topics: editSubTopics });
      setEditingCategory(null);
      setEditName('');
      setEditSubTopics([]);
      toast.success('Розділ оновлено');
    } catch (error: any) {
      console.error('Admin Action Error [updateCategory]:', error, { id });
      toast.error(`Помилка оновлення: ${error?.message ?? 'невідома помилка'}`);
    }
  };

  const handleCreateCategory = async () => {
    if (!validateCategory(newCategoryName, newCategoryImage)) return;
    try {
      await createCategory.mutateAsync({
        name: newCategoryName.trim(),
        image_url: newCategoryImage || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&h=200&fit=crop',
        sub_topics: newCategorySubTopics,
      });
      setNewCategoryName('');
      setNewCategoryImage('');
      setNewCategorySubTopics([]);
      setErrors({});
      toast.success('Розділ створено');
    } catch (error: any) {
      console.error('Admin Action Error [createCategory]:', error);
      toast.error(`Помилка створення: ${error?.message ?? 'невідома помилка'}`);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Видалити цей розділ?')) return;
    try {
      await deleteCategory.mutateAsync(id);
      toast.success('Розділ видалено');
    } catch (error: any) {
      console.error('Admin Action Error [deleteCategory]:', error, { id });
      toast.error(`Помилка видалення: ${error?.message ?? 'невідома помилка'}`);
    }
  };

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Адмін-панель</h1>
        <Link to="/admin/editor">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Нова стаття
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Всього статей</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              {articles.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Охоплення у стрічці</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              {totalImpressions.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Загальні перегляди</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary" />
              {totalReads.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Загальні вподобання</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              {totalLikes.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Management */}
      <Card className="bg-card border-border mb-8">
        <CardHeader>
          <CardTitle>Управління розділами</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            <div className="flex gap-2">
              <Input
                placeholder="Назва нового розділу"
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                maxLength={100}
                className={`bg-background border-border ${errors.name ? 'border-destructive' : ''}`}
              />
              <div className="flex items-center gap-2">
                {newCategoryImage ? (
                  <div className="flex items-center gap-2">
                    <img src={newCategoryImage} alt="Preview" className="w-8 h-8 rounded-full object-cover" />
                    <Button type="button" variant="ghost" size="sm" onClick={() => setNewCategoryImage('')}>✕</Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isUploadingCategoryImage}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleCategoryImageUpload(file);
                      };
                      input.click();
                    }}
                    className="shrink-0"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    {isUploadingCategoryImage ? 'Завантаження...' : 'Фото'}
                  </Button>
                )}
              </div>
              <Button onClick={handleCreateCategory}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            {errors.image_url && <p className="text-sm text-destructive">{errors.image_url}</p>}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Підтеми (теги)</p>
              <TagInput
                value={newCategorySubTopics}
                onChange={setNewCategorySubTopics}
                placeholder="Напр.: Цикли — Enter, щоб додати"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Назва</TableHead>
                <TableHead>Підтеми</TableHead>
                <TableHead className="w-[100px]">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="align-top">
                    {editingCategory === cat.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        maxLength={100}
                        className="bg-background border-border"
                      />
                    ) : (
                      cat.name
                    )}
                  </TableCell>
                  <TableCell className="align-top">
                    {editingCategory === cat.id ? (
                      <TagInput
                        value={editSubTopics}
                        onChange={setEditSubTopics}
                        placeholder="Додати підтему та Enter"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {(cat.sub_topics ?? []).length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          cat.sub_topics.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-full text-xs bg-[#A67DE8]/15 border border-[#A67DE8]/50"
                            >
                              {t}
                            </span>
                          ))
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex gap-1">
                      {editingCategory === cat.id ? (
                        <Button size="sm" variant="ghost" onClick={() => handleUpdateCategory(cat.id)}>
                          ✓
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCategory(cat.id);
                            setEditName(cat.name);
                            setEditSubTopics(cat.sub_topics ?? []);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDeleteCategory(cat.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Site Settings — Social Links */}
      <SocialLinksManager />

      {/* Articles List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Статті</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Назва</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Охоплення</TableHead>
                <TableHead className="text-right">Перегляди</TableHead>
                <TableHead className="text-right">Вподобань</TableHead>
                <TableHead className="text-right">Поширень</TableHead>
                <TableHead className="w-[120px]">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {article.title}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      article.published 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {article.published ? 'Опубліковано' : 'Чернетка'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{(article.impressions || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right">{article.reads.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{article.likes.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{(((article as any).share_count) || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setStatsArticleId(article.id)} title="Статистика">
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <Link to={`/admin/editor/${article.id}`}>
                        <Button size="sm" variant="ghost">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Article Stats Dialog */}
      <ArticleStatsDialog 
        article={statsArticle || null}
        open={!!statsArticleId}
        onClose={() => setStatsArticleId(null)}
      />
    </PageLayout>
  );
};

// Stats dialog component
const ArticleStatsDialog = ({ article, open, onClose }: { 
  article: { id: string; title: string; impressions: number; reads: number; likes: number; share_count?: number } | null;
  open: boolean;
  onClose: () => void;
}) => {
  const { data: uniqueViews = 0 } = useArticleUniqueViews(article?.id || '');

  if (!article) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-lg truncate">{article.title}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Card className="bg-secondary border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Users className="w-4 h-4" />
                Охоплення у стрічці
              </div>
              <p className="text-2xl font-bold">{(article.impressions || 0).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-secondary border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Eye className="w-4 h-4" />
                Перегляди
              </div>
              <p className="text-2xl font-bold">{article.reads.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-secondary border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <BarChart3 className="w-4 h-4" />
                Унікальні перегляди
              </div>
              <p className="text-2xl font-bold">{uniqueViews.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-secondary border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Heart className="w-4 h-4" />
                Вподобання
              </div>
              <p className="text-2xl font-bold">{article.likes.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-secondary border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Share2 className="w-4 h-4" />
                Поширення
              </div>
              <p className="text-2xl font-bold">{(article.share_count || 0).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Admin;
