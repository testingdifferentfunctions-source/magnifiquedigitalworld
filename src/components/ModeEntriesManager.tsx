import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Heart, Pencil, Plus, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useAllModeEntries,
  useDeleteModeEntry,
  type ModeEntry,
  type ModeEntryType,
} from "@/hooks/useModeEntries";

const TYPES: { type: ModeEntryType; label: string }[] = [
  { type: "news", label: "Новини" },
  { type: "palette", label: "Палітри" },
  { type: "resource", label: "Ресурси" },
  { type: "component", label: "Компоненти" },
  { type: "template", label: "Шаблони коду" },
];

const ModeEntriesManager = () => {
  const { data: entries = [], isLoading } = useAllModeEntries();
  const deleteEntry = useDeleteModeEntry();

  const handleDelete = async (entry: ModeEntry) => {
    if (!confirm(`Видалити «${entry.title_uk}»?`)) return;
    try {
      await deleteEntry.mutateAsync(entry.id);
      toast.success("Запис видалено");
    } catch (error: any) {
      toast.error(error?.message || "Помилка видалення");
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Управління матеріалами режимів (Новини, Палітри, Ресурси, Компоненти, Шаблони)</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="news">
          <TabsList className="mb-4">
            {TYPES.map(({ type, label }) => (
              <TabsTrigger key={type} value={type}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TYPES.map(({ type, label }) => {
            const rows = entries.filter((e) => e.type === type);
            return (
              <TabsContent key={type} value={type} className="space-y-4">
                <Button asChild size="sm">
                  <Link to={`/admin/entry/${type}`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Додати ({label})
                  </Link>
                </Button>

                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Завантаження...</p>
                ) : rows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Ще немає записів.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Назва</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead>Блоки</TableHead>
                          <TableHead>Метрики</TableHead>
                          <TableHead className="text-right">Дії</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium">{entry.title_uk}</TableCell>
                            <TableCell>
                              <span
                                className={`text-xs rounded-full px-2 py-1 ${
                                  entry.published
                                    ? "bg-primary/15 text-primary"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {entry.published ? "Опубліковано" : "Чернетка"}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              UA {entry.blocks_uk.length} / EN {entry.blocks_en.length}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Heart className="w-3.5 h-3.5" aria-hidden="true" />
                                  {entry.likes}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                                  {entry.share_count}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button asChild variant="ghost" size="icon" aria-label="Редагувати">
                                  <Link to={`/admin/entry/${entry.type}/${entry.id}`}>
                                    <Pencil className="w-4 h-4" />
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label="Видалити"
                                  onClick={() => handleDelete(entry)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ModeEntriesManager;
