import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useArticles, useArticleUniqueViews } from '@/hooks/useArticles';
import { use24hAnalytics } from '@/hooks/useAnalytics24h';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Eye,
  Heart,
  Plus,
  Pencil,
  FileText,
  BarChart3,
  Users,
  Share2,
  ChevronDown,
  Newspaper,
  Palette,
  BookOpen,
  BookMarked,
  Layers,
  Code,
  Settings,
  FolderTree,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sparkles } from 'lucide-react';
import SocialLinksManager from '@/components/SocialLinksManager';
import ModeEntriesManager from '@/components/ModeEntriesManager';
import CategoryManager from '@/components/CategoryManager';
import TwoFactorAuthSettings from '@/components/TwoFactorAuthSettings';

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { data: articles = [] } = useArticles(false);
  const { data: analytics24h, isLoading: loadingAnalytics } = use24hAnalytics();
  const [statsArticleId, setStatsArticleId] = useState<string | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<string>('categories');

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
  const statsArticle = articles.find((a) => a.id === statsArticleId);

  return (
    <PageLayout>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Адмін-панель</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Керування публікаціями, категоріями всіх розділів та налаштуваннями сайту
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Створити матеріал
                <ChevronDown className="w-4 h-4 ml-2 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border">
              <DropdownMenuItem asChild>
                <Link to="/admin/editor" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="w-4 h-4 text-[#A07DFA]" />
                  <span>Стаття (Статті)</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/entry/news" className="flex items-center gap-2 cursor-pointer">
                  <Newspaper className="w-4 h-4 text-[#A4B885]" />
                  <span>Новина (Новини)</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/entry/palette" className="flex items-center gap-2 cursor-pointer">
                  <Palette className="w-4 h-4 text-[#8ABEB9]" />
                  <span>Палітра (Палітри)</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/entry/resource" className="flex items-center gap-2 cursor-pointer">
                  <BookOpen className="w-4 h-4 text-[#5DA7DB]" />
                  <span>Ресурс (Ресурси)</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/entry/component" className="flex items-center gap-2 cursor-pointer">
                  <Layers className="w-4 h-4 text-[#F1F5F9]" />
                  <span>Компонент (Компоненти)</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/entry/template" className="flex items-center gap-2 cursor-pointer">
                  <Code className="w-4 h-4 text-[#C562AF]" />
                  <span>Сніпет коду (Сніпети)</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/entry/research" className="flex items-center gap-2 cursor-pointer">
                  <BarChart3 className="w-4 h-4 text-[#F78D60]" />
                  <span>Дослідження (Research)</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/dictionary" className="flex items-center gap-2 cursor-pointer">
                  <BookMarked className="w-4 h-4 text-[#F3CD97]" />
                  <span>Термін (Словник)</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/entry/design" className="flex items-center gap-2 cursor-pointer">
                  <Sparkles className="w-4 h-4 text-[#FFBCBC]" />
                  <span>Дизайн (UI & Градієнти)</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/admin/editor">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Нова стаття
            </Button>
          </Link>
        </div>
      </div>

      {/* 24-Hour Real-time Analytics Section */}
      <div className="mb-8 space-y-3" id="admin-24h-analytics-section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold tracking-tight">Статистика за 24 години</h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-3 py-1 rounded-full border border-border/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Оновлюється автоматично</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Views (24h) */}
          <Card className="bg-card border-border shadow-xs hover:border-primary/40 transition-colors" id="admin-card-views-24h">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Перегляди (24 год)</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Eye className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              {loadingAnalytics ? (
                <Skeleton className="h-8 w-24 rounded" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    {(analytics24h?.views_24h ?? 0).toLocaleString()}
                  </p>
                  <span className="text-xs text-muted-foreground">переглядів</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Likes (24h) */}
          <Card className="bg-card border-border shadow-xs hover:border-rose-500/40 transition-colors" id="admin-card-likes-24h">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Вподобання (24 год)</CardTitle>
              <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                <Heart className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              {loadingAnalytics ? (
                <Skeleton className="h-8 w-24 rounded" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    {(analytics24h?.likes_24h ?? 0).toLocaleString()}
                  </p>
                  <span className="text-xs text-muted-foreground">вподобань</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Shares (24h) */}
          <Card className="bg-card border-border shadow-xs hover:border-blue-500/40 transition-colors" id="admin-card-shares-24h">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Поширення (24 год)</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <Share2 className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              {loadingAnalytics ? (
                <Skeleton className="h-8 w-24 rounded" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    {(analytics24h?.shares_24h ?? 0).toLocaleString()}
                  </p>
                  <span className="text-xs text-muted-foreground">поширень</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Summary (All Time) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      {/* Main Admin Section Tabs */}
      <Tabs value={activeAdminTab} onValueChange={setActiveAdminTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1.5 bg-muted/40 rounded-xl border border-border">
          <TabsTrigger
            value="categories"
            className="flex items-center gap-2 py-2.5 font-semibold data-[state=active]:bg-card"
          >
            <FolderTree className="w-4 h-4 text-primary" />
            <span>Категорії (Categories)</span>
          </TabsTrigger>
          <TabsTrigger
            value="entries"
            className="flex items-center gap-2 py-2.5 font-semibold data-[state=active]:bg-card"
          >
            <Layers className="w-4 h-4 text-[#5DA7DB]" />
            <span>Ресурси, Новини, Код</span>
          </TabsTrigger>
          <TabsTrigger
            value="articles"
            className="flex items-center gap-2 py-2.5 font-semibold data-[state=active]:bg-card"
          >
            <FileText className="w-4 h-4 text-[#A07DFA]" />
            <span>Список статей</span>
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="flex items-center gap-2 py-2.5 font-semibold data-[state=active]:bg-card"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span>Налаштування сайту</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Categories & Subcategories Manager */}
        <TabsContent value="categories" className="space-y-6">
          <CategoryManager />
        </TabsContent>

        {/* Tab 2: Mode Entries Manager */}
        <TabsContent value="entries" className="space-y-6">
          <ModeEntriesManager />
        </TabsContent>

        {/* Tab 3: Articles Table */}
        <TabsContent value="articles" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Статті блогу ({articles.length})</CardTitle>
              <Link to="/admin/editor">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Додати статтю
                </Button>
              </Link>
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
                      <TableCell className="font-medium max-w-[220px] truncate">
                        {article.title}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            article.published
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-yellow-500/20 text-yellow-500'
                          }`}
                        >
                          {article.published ? 'Опубліковано' : 'Чернетка'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {(article.impressions || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {article.reads.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {article.likes.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {(((article as any).share_count) || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setStatsArticleId(article.id)}
                            title="Статистика"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                          <Link to={`/admin/editor/${article.id}`}>
                            <Button size="sm" variant="ghost" title="Редагувати">
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
        </TabsContent>

        {/* Tab 4: Site Settings */}
        <TabsContent value="settings" className="space-y-6">
          <TwoFactorAuthSettings />
          <SocialLinksManager />
        </TabsContent>
      </Tabs>

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
const ArticleStatsDialog = ({
  article,
  open,
  onClose,
}: {
  article: {
    id: string;
    title: string;
    impressions: number;
    reads: number;
    likes: number;
    share_count?: number;
  } | null;
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
