import { useState } from 'react';
import { useSocialLinks, useCreateSocialLink, useUpdateSocialLink, useDeleteSocialLink } from '@/hooks/useSocialLinks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getSocialIcon } from '@/lib/socialIcon';

const accentRing = 'focus-visible:ring-[#A67DE8] focus-visible:ring-2 focus-visible:ring-offset-0';

const SocialLinksManager = () => {
  const { data: links = [] } = useSocialLinks();
  const createLink = useCreateSocialLink();
  const updateLink = useUpdateSocialLink();
  const deleteLink = useDeleteSocialLink();

  const [newPlatform, setNewPlatform] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPlatform, setEditPlatform] = useState('');
  const [editUrl, setEditUrl] = useState('');

  const validateUrl = (url: string) => {
    const v = url.trim();
    if (!v) return false;
    if (v.toLowerCase().startsWith('mailto:')) return /mailto:.+@.+\..+/i.test(v);
    try {
      const u = new URL(v);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleCreate = async () => {
    if (!newPlatform.trim()) return toast.error('Вкажіть назву платформи');
    if (!validateUrl(newUrl)) return toast.error('Невірний URL (має бути http(s):// або mailto:)');
    try {
      await createLink.mutateAsync({
        platform: newPlatform.trim().slice(0, 50),
        url: newUrl.trim(),
        sort_order: links.length,
      });
      setNewPlatform('');
      setNewUrl('');
      toast.success('Посилання додано');
    } catch (e: any) {
      toast.error(`Помилка: ${e?.message ?? 'не вдалося'}`);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editPlatform.trim()) return toast.error('Вкажіть назву платформи');
    if (!validateUrl(editUrl)) return toast.error('Невірний URL');
    try {
      await updateLink.mutateAsync({
        id,
        platform: editPlatform.trim().slice(0, 50),
        url: editUrl.trim(),
      });
      setEditingId(null);
      toast.success('Оновлено');
    } catch (e: any) {
      toast.error(`Помилка: ${e?.message ?? 'не вдалося'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Видалити це посилання?')) return;
    try {
      await deleteLink.mutateAsync(id);
      toast.success('Видалено');
    } catch (e: any) {
      toast.error(`Помилка: ${e?.message ?? 'не вдалося'}`);
    }
  };

  return (
    <Card className="bg-card border-border mb-8">
      <CardHeader>
        <CardTitle>Налаштування — соціальні мережі та контакти</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <Input
            placeholder="Платформа (Email, Instagram, Telegram...)"
            value={newPlatform}
            onChange={(e) => setNewPlatform(e.target.value)}
            maxLength={50}
            className={`bg-background border-border ${accentRing}`}
          />
          <Input
            placeholder="URL (https://... або mailto:...)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className={`bg-background border-border ${accentRing}`}
          />
          <Button
            onClick={handleCreate}
            className="bg-[#A67DE8] hover:bg-[#A67DE8]/90 text-white shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            Додати
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Платформа</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="w-[100px]">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => {
              const Icon = getSocialIcon(link.platform);
              const editing = editingId === link.id;
              return (
                <TableRow key={link.id}>
                  <TableCell><Icon className="w-4 h-4 text-[#A67DE8]" /></TableCell>
                  <TableCell>
                    {editing ? (
                      <Input
                        value={editPlatform}
                        onChange={(e) => setEditPlatform(e.target.value)}
                        maxLength={50}
                        className={`bg-background border-border ${accentRing}`}
                      />
                    ) : (
                      link.platform
                    )}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {editing ? (
                      <Input
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className={`bg-background border-border ${accentRing}`}
                      />
                    ) : (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-[#A67DE8] truncate inline-block max-w-full"
                      >
                        {link.url}
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {editing ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="hover:text-[#A67DE8]"
                          onClick={() => handleUpdate(link.id)}
                        >
                          ✓
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="hover:text-[#A67DE8]"
                          onClick={() => {
                            setEditingId(link.id);
                            setEditPlatform(link.platform);
                            setEditUrl(link.url);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(link.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {links.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground text-sm">
                  Поки немає посилань
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SocialLinksManager;
