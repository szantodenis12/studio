'use client';

import { useMemo, useState } from 'react';
import { collection, documentId, query, where } from 'firebase/firestore';
import { format, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { normalizeRoom, sortRooms } from '@/lib/rooms/normalize';
import { addDaysIso, blockedCount, bookedCount, freeRooms, todayIso, type AvailabilityDoc } from '@/lib/rooms/pricing';
import { dateRange, recalculateAvailability, setBlockedRooms } from '@/services/booking-service';

interface CellTarget {
  date: string;
  roomType: string;
  title: string;
  total: number;
  booked: number;
  blocked: number;
}

export default function AvailabilityGrid() {
  const db = useFirestore();
  const { toast } = useToast();
  const [start, setStart] = useState(() => todayIso());
  const [days, setDays] = useState<14 | 30>(14);
  const [target, setTarget] = useState<CellTarget | null>(null);
  const [blockedInput, setBlockedInput] = useState('0');
  const [isSaving, setIsSaving] = useState(false);
  const [confirmRecalc, setConfirmRecalc] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const dates = useMemo(() => dateRange(start, days), [start, days]);
  const end = dates[dates.length - 1];

  const roomsQuery = useMemoFirebase(() => (db ? collection(db, 'rooms') : null), [db]);
  const { data: roomDocs, isLoading: roomsLoading } = useCollection<Record<string, unknown>>(roomsQuery);
  const rooms = useMemo(() => sortRooms((roomDocs || []).map((d) => normalizeRoom(d.id, d))), [roomDocs]);

  const availQuery = useMemoFirebase(
    () =>
      db
        ? query(collection(db, 'availability'), where(documentId(), '>=', start), where(documentId(), '<=', end))
        : null,
    [db, start, end],
  );
  const { data: availDocs, isLoading: availLoading } = useCollection<AvailabilityDoc>(availQuery);
  const byDate = useMemo(() => {
    const map: Record<string, AvailabilityDoc> = {};
    (availDocs || []).forEach((d) => {
      map[d.id] = d;
    });
    return map;
  }, [availDocs]);

  const openCell = (c: CellTarget) => {
    setTarget(c);
    setBlockedInput(String(c.blocked));
  };

  const saveBlocked = async () => {
    if (!target) return;
    const value = Number(blockedInput);
    if (!Number.isInteger(value) || value < 0) {
      toast({ variant: 'destructive', title: 'Valoare invalidă', description: 'Introduceți un număr întreg ≥ 0.' });
      return;
    }
    setIsSaving(true);
    try {
      await setBlockedRooms(db, target.date, target.roomType, value);
      toast({ title: 'Salvat', description: `${target.title}: ${value} camere blocate pe ${format(parseISO(target.date), 'PPP', { locale: ro })}.` });
      setTarget(null);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Nu s-a putut salva', description: (err as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  const runRecalc = async () => {
    setIsRecalculating(true);
    try {
      const n = await recalculateAvailability(db);
      toast({ title: 'Disponibilitate recalculată', description: n ? `${n} zile au fost corectate.` : 'Totul era deja corect.' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Recalcularea a eșuat', description: (err as Error).message });
    } finally {
      setIsRecalculating(false);
      setConfirmRecalc(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar disponibilitate</CardTitle>
        <CardDescription className="space-y-1">
          <span className="block">
            Fiecare celulă arată <strong>camere libere / total</strong> pentru o noapte. Camerele ocupate vin automat din
            rezervări (site + rezervări manuale); o rezervare anulată eliberează camera. Numărul total de camere al
            fiecărui tip se setează în pagina <em>Camere</em>.
          </span>
          <span className="block">
            Click pe o celulă pentru a <strong>bloca</strong> manual camere în acea noapte (ex. renovare, rezervări
            primite pe altă cale fără detalii). Camerele blocate nu pot fi rezervate pe site.
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Perioada anterioară" onClick={() => setStart(addDaysIso(start, -days))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setStart(todayIso())}>Azi</Button>
          <Button variant="outline" size="icon" aria-label="Perioada următoare" onClick={() => setStart(addDaysIso(start, days))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Input type="date" className="w-[170px]" value={start} aria-label="Data de început"
            onChange={(e) => e.target.value && setStart(e.target.value)} />
          <div className="flex gap-1">
            {[14, 30].map((n) => (
              <Button key={n} variant={days === n ? 'default' : 'outline'} size="sm" onClick={() => setDays(n as 14 | 30)}>
                {n} zile
              </Button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-green-200 border border-green-500" /> liber</span>
            <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-200 border border-amber-500" /> aproape plin</span>
            <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-200 border border-red-500" /> plin</span>
            {(roomsLoading || availLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        </div>

        {rooms.length === 0 && !roomsLoading ? (
          <p className="text-sm text-muted-foreground">
            Nu există camere în baza de date. Importați-le din pagina <em>Camere</em>.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border" data-testid="availability-grid">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="sticky left-0 z-10 bg-muted p-2 text-left font-medium min-w-[160px]">Tip cameră</th>
                  {dates.map((d) => {
                    const dt = parseISO(d);
                    const weekend = dt.getDay() === 5 || dt.getDay() === 6;
                    return (
                      <th key={d} className={cn('p-1 text-center font-medium min-w-[56px]', weekend && 'bg-muted')}>
                        <div className="capitalize">{format(dt, 'EEE', { locale: ro })}</div>
                        <div>{format(dt, 'd MMM', { locale: ro })}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.type} className="border-t">
                    <th className="sticky left-0 z-10 bg-background p-2 text-left font-medium">
                      <div>{room.details.ro.title || room.type}</div>
                      <div className="text-[11px] font-normal text-muted-foreground">
                        {room.totalRooms} camere{room.active ? '' : ' · inactivă'}
                      </div>
                    </th>
                    {dates.map((d) => {
                      const doc = byDate[d];
                      const booked = bookedCount(doc, room.type);
                      const blocked = blockedCount(doc, room.type);
                      const free = freeRooms(doc, room.type, room.totalRooms);
                      const ratio = room.totalRooms ? free / room.totalRooms : 0;
                      return (
                        <td key={d} className="p-0.5">
                          <button
                            type="button"
                            data-testid={`cell-${room.type}-${d}`}
                            onClick={() => openCell({ date: d, roomType: room.type, title: room.details.ro.title || room.type, total: room.totalRooms, booked, blocked })}
                            className={cn(
                              'w-full rounded border px-1 py-1 text-center leading-tight transition hover:ring-2 hover:ring-primary',
                              free === 0
                                ? 'bg-red-100 border-red-400 text-red-900 dark:bg-red-900/40 dark:text-red-100'
                                : ratio <= 0.25
                                  ? 'bg-amber-100 border-amber-400 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100'
                                  : 'bg-green-50 border-green-300 text-green-900 dark:bg-green-900/30 dark:text-green-100',
                            )}
                            title={`${booked} rezervate, ${blocked} blocate, ${free} libere din ${room.totalRooms}`}
                          >
                            <div className="text-sm font-semibold">{free}/{room.totalRooms}</div>
                            <div className="text-[10px] opacity-80">
                              {booked > 0 ? `${booked} rez.` : ' '}
                              {blocked > 0 ? ` · ${blocked} bl.` : ''}
                            </div>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t pt-4">
          <Button variant="outline" size="sm" onClick={() => setConfirmRecalc(true)} disabled={isRecalculating}>
            <RefreshCw className={cn('mr-2 h-4 w-4', isRecalculating && 'animate-spin')} />
            Recalculează din rezervări
          </Button>
          <span className="text-xs text-muted-foreground max-w-2xl">
            Reface numărul de camere ocupate (de azi înainte) pe baza rezervărilor existente, păstrând blocările manuale.
            Util o singură dată după actualizare: versiunea veche a site-ului nu elibera camerele la anulare.
          </span>
        </div>
      </CardContent>

      <Dialog open={!!target} onOpenChange={(open) => !open && !isSaving && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{target?.title}</DialogTitle>
            <DialogDescription>
              {target && format(parseISO(target.date), 'EEEE, d MMMM yyyy', { locale: ro })} — {target?.booked} rezervate
              din {target?.total}. Se pot bloca cel mult {target ? Math.max(0, target.total - target.booked) : 0} camere.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="blocked">Camere blocate manual</Label>
            <Input id="blocked" type="number" min={0} max={target ? Math.max(0, target.total - target.booked) : 0}
              value={blockedInput} onChange={(e) => setBlockedInput(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTarget(null)} disabled={isSaving}>Renunță</Button>
            <Button onClick={saveBlocked} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvează
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmRecalc} onOpenChange={(o) => !isRecalculating && setConfirmRecalc(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Recalculați disponibilitatea?</AlertDialogTitle>
            <AlertDialogDescription>
              Numărul de camere ocupate pentru fiecare zi, de azi înainte, va fi refăcut din rezervările care nu sunt
              anulate. Blocările manuale rămân neschimbate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRecalculating}>Înapoi</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); runRecalc(); }} disabled={isRecalculating}>
              {isRecalculating ? 'Se recalculează...' : 'Da, recalculează'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
