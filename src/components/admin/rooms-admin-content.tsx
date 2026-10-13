'use client';

import { useMemo, useState } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { normalizeRoom, sortRooms } from '@/lib/rooms/normalize';
import { importStaticRooms, revalidateSite } from '@/services/rooms-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import RoomEditor from './room-editor';
import { roomWarnings } from './room-warnings';

export default function RoomsAdminContent() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const roomsQuery = useMemoFirebase(() => (db ? collection(db, 'rooms') : null), [db]);
  const { data, isLoading, error } = useCollection<Record<string, unknown>>(roomsQuery);

  const rooms = useMemo(
    () => sortRooms((data || []).map((d) => normalizeRoom(d.id, d))),
    [data],
  );
  const selected = rooms.find((r) => r.type === selectedType) ?? rooms[0] ?? null;

  const handleImport = async () => {
    if (!db) return;
    setIsImporting(true);
    try {
      const count = await importStaticRooms(db);
      toast({ title: 'Import reușit', description: `${count} tipuri de camere au fost importate.` });
      try {
        await revalidateSite(user);
        toast({ title: 'Site actualizat', description: 'Paginile publice au fost regenerate.' });
      } catch (err) {
        toast({ variant: 'destructive', title: 'Site-ul nu a putut fi actualizat', description: (err as Error).message });
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Importul a eșuat', description: (err as Error).message });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Camere</h2>
      </div>
      <p className="text-sm text-muted-foreground max-w-3xl">
        Aici editați tot ce apare pe site despre camere: texte (RO/EN), dotări, fotografii, numărul de camere de
        fiecare tip și prețurile (preț de bază + prețuri speciale pe perioade). După salvare, paginile publice
        (Acasă, Camere, Tarife, Rezervare) se actualizează automat.
      </p>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}
      {error && <p className="text-red-500">Eroare la încărcarea camerelor: {error.message}</p>}

      {!isLoading && !error && rooms.length === 0 && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Nu există încă nicio cameră în baza de date</CardTitle>
            <CardDescription>
              Site-ul afișează momentan datele scrise în cod. Importați-le o singură dată pentru a le putea edita de aici:
              texte, dotări, fotografii, prețuri și numărul de camere din fiecare tip.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Importă datele actuale ale site-ului
            </Button>
          </CardContent>
        </Card>
      )}

      {rooms.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <nav className="space-y-1" aria-label="Tipuri de camere">
            {rooms.map((room) => {
              const warnings = roomWarnings(room);
              return (
                <button
                  key={room.type}
                  type="button"
                  onClick={() => setSelectedType(room.type)}
                  className={cn(
                    'w-full text-left rounded-md border px-3 py-2 text-sm transition-colors',
                    selected?.type === room.type ? 'bg-accent border-primary' : 'hover:bg-accent/50',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{room.details.ro.title || room.type}</span>
                    {warnings.length > 0 && <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={room.active ? 'default' : 'outline'}>{room.active ? 'Activă' : 'Inactivă'}</Badge>
                    <span>{room.totalRooms} camere</span>
                    <span>{room.basePrice} RON</span>
                  </div>
                </button>
              );
            })}
          </nav>

          <div>
            {selected && (
              <>
                {roomWarnings(selected).length > 0 && (
                  <Alert className="mb-4 border-amber-500">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Atenție</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-4">
                        {roomWarnings(selected).map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                <RoomEditor key={selected.type + String(selected.updatedAt ?? '')} room={selected} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
