'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useFirebaseApp, useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowDown, ArrowUp, ImagePlus, Loader2, PlusCircle, Save, Trash2, Undo2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ROOM_ICON_NAMES, roomIcon } from '@/lib/rooms/icons';
import { isIsoDate, overrideFor, priceCalendar, todayIso, type PriceOverride } from '@/lib/rooms/pricing';
import type { RoomDoc, RoomImage, RoomLocale } from '@/lib/rooms/types';
import { deleteRoomImageFile, revalidateSite, saveRoom, uploadRoomImage } from '@/services/rooms-service';
import { activationErrors } from './room-warnings';

function move<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

function newId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `ovr-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function IconSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[160px]" aria-label="Pictogramă">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROOM_ICON_NAMES.map((name) => {
          const I = roomIcon(name);
          return (
            <SelectItem key={name} value={name}>
              <span className="flex items-center gap-2">
                <I className="h-4 w-4" /> {name}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

const EMPTY_OVERRIDE = { startDate: '', endDate: '', price: '', label: '' };

export default function RoomEditor({ room }: { room: RoomDoc }) {
  const db = useFirestore();
  const app = useFirebaseApp();
  const { user } = useUser();
  const { toast } = useToast();

  const [draft, setDraft] = useState<RoomDoc>(room);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [pendingDeletes, setPendingDeletes] = useState<RoomImage[]>([]);
  const [overrideForm, setOverrideForm] = useState(EMPTY_OVERRIDE);
  const [editingOverrideId, setEditingOverrideId] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(room), [draft, room]);
  const update = (patch: Partial<RoomDoc>) => setDraft((d) => ({ ...d, ...patch }));
  const updateDetails = (locale: RoomLocale, patch: Partial<RoomDoc['details']['ro']>) =>
    setDraft((d) => ({ ...d, details: { ...d.details, [locale]: { ...d.details[locale], ...patch } } }));

  const today = todayIso();
  const preview = useMemo(() => priceCalendar(draft, today, 30), [draft, today]);

  // ---- validation ----------------------------------------------------------
  function validate(): string | null {
    if (!draft.details.ro.title.trim()) return 'Titlul în română este obligatoriu.';
    if (!Number.isInteger(draft.totalRooms) || draft.totalRooms < 0) return 'Numărul de camere trebuie să fie un număr întreg ≥ 0.';
    if (!Number.isInteger(draft.maxGuests) || draft.maxGuests < 1) return 'Capacitatea trebuie să fie cel puțin 1 persoană.';
    if (!(draft.basePrice >= 0)) return 'Prețul de bază nu este valid.';
    if (draft.active) {
      const missing = activationErrors(draft);
      if (missing.length) return `Camera nu poate fi activă fără: ${missing.join(', ')}.`;
    }
    for (const o of draft.priceOverrides) {
      if (!isIsoDate(o.startDate) || !isIsoDate(o.endDate) || o.startDate > o.endDate || !(o.price > 0)) {
        return 'Există o perioadă de preț invalidă.';
      }
    }
    if (draft.amenities.some((a) => !a.ro.trim())) return 'Fiecare dotare trebuie să aibă un text în română.';
    if (draft.specs.some((s) => !s.text.trim())) return 'Fiecare specificație trebuie să aibă un text.';
    return null;
  }

  async function handleSave() {
    const problem = validate();
    if (problem) {
      toast({ variant: 'destructive', title: 'Nu se poate salva', description: problem });
      return;
    }
    setIsSaving(true);
    try {
      await saveRoom(db, draft);
      // Remove photos deleted in this edit from Storage (only after the doc no
      // longer references them).
      await Promise.all(pendingDeletes.map((img) => deleteRoomImageFile(app, img).catch(() => undefined)));
      setPendingDeletes([]);
      toast({ title: 'Salvat', description: `${draft.details.ro.title} a fost actualizată.` });
      try {
        await revalidateSite(user);
        toast({ title: 'Site actualizat', description: 'Paginile publice afișează acum noile date.' });
      } catch (err) {
        toast({
          variant: 'destructive',
          title: 'Datele sunt salvate, dar site-ul nu a putut fi regenerat',
          description: `${(err as Error).message} Paginile se vor actualiza automat în cel mult o oră.`,
        });
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Eroare la salvare', description: (err as Error).message });
    } finally {
      setIsSaving(false);
    }
  }

  // ---- price overrides -------------------------------------------------------
  function submitOverride() {
    const price = Number(overrideForm.price);
    if (!isIsoDate(overrideForm.startDate) || !isIsoDate(overrideForm.endDate)) {
      toast({ variant: 'destructive', title: 'Perioadă invalidă', description: 'Alegeți data de început și de sfârșit.' });
      return;
    }
    if (overrideForm.startDate > overrideForm.endDate) {
      toast({ variant: 'destructive', title: 'Perioadă invalidă', description: 'Data de sfârșit trebuie să fie după data de început.' });
      return;
    }
    if (!(price > 0)) {
      toast({ variant: 'destructive', title: 'Preț invalid', description: 'Introduceți un preț pe noapte mai mare decât 0.' });
      return;
    }
    const base = {
      startDate: overrideForm.startDate,
      endDate: overrideForm.endDate,
      price,
      label: overrideForm.label.trim(),
    };
    if (editingOverrideId) {
      update({
        priceOverrides: draft.priceOverrides.map((o) => (o.id === editingOverrideId ? { ...o, ...base } : o)),
      });
    } else {
      const created: PriceOverride = { id: newId(), createdAt: Date.now(), ...base };
      update({ priceOverrides: [...draft.priceOverrides, created] });
    }
    setOverrideForm(EMPTY_OVERRIDE);
    setEditingOverrideId(null);
  }

  // ---- photos ----------------------------------------------------------------
  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    const list = Array.from(files);
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        const img = await uploadRoomImage(app, draft.type, file, draft.details.ro.title);
        setDraft((d) => ({ ...d, images: [...d.images, img] }));
      } catch (err) {
        toast({ variant: 'destructive', title: `Încărcarea a eșuat: ${file.name}`, description: (err as Error).message });
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (fileInput.current) fileInput.current.value = '';
  }

  function removeImage(index: number) {
    const img = draft.images[index];
    if (img?.storagePath) setPendingDeletes((p) => [...p, img]);
    update({ images: draft.images.filter((_, i) => i !== index) });
  }

  const sortedOverrides = [...draft.priceOverrides].sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>{draft.details.ro.title || draft.type}</CardTitle>
            <CardDescription>
              Cod tip cameră: <code>{draft.type}</code> (folosit de rezervări; nu se poate schimba)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="room-active" className="text-sm">Activă pe site</Label>
            <Switch id="room-active" checked={draft.active} onCheckedChange={(v) => update({ active: v })} />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <Label htmlFor="basePrice">Preț de bază (RON / noapte)</Label>
            <Input id="basePrice" type="number" min={0} step="1" value={draft.basePrice}
              onChange={(e) => update({ basePrice: Number(e.target.value) })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="totalRooms">Număr de camere de acest tip</Label>
            <Input id="totalRooms" type="number" min={0} step="1" value={draft.totalRooms}
              onChange={(e) => update({ totalRooms: Math.floor(Number(e.target.value)) })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="maxGuests">Capacitate (oaspeți)</Label>
            <Input id="maxGuests" type="number" min={1} max={10} step="1" value={draft.maxGuests}
              onChange={(e) => update({ maxGuests: Math.floor(Number(e.target.value)) })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="order">Ordine afișare</Label>
            <Input id="order" type="number" step="1" value={draft.order}
              onChange={(e) => update({ order: Math.floor(Number(e.target.value)) })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Texte</CardTitle>
          <CardDescription>
            Eticheta de preț poate rămâne goală: site-ul afișează automat „de la X RON / noapte” cu prețul de azi.
            Completați-o doar pentru un text special (ex. „de la 500-550 RON / noapte”) — atunci nu se mai
            actualizează automat când schimbați prețul.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ro">
            <TabsList>
              <TabsTrigger value="ro">Română</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
            </TabsList>
            {(['ro', 'en'] as RoomLocale[]).map((locale) => (
              <TabsContent key={locale} value={locale} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor={`title-${locale}`}>Titlu</Label>
                  <Input id={`title-${locale}`} value={draft.details[locale].title}
                    onChange={(e) => updateDetails(locale, { title: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`desc-${locale}`}>Descriere</Label>
                  <Textarea id={`desc-${locale}`} rows={4} value={draft.details[locale].description}
                    onChange={(e) => updateDetails(locale, { description: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`price-${locale}`}>Etichetă preț (opțional)</Label>
                  <Input id={`price-${locale}`} value={draft.details[locale].priceLabel}
                    placeholder={locale === 'ro' ? `de la ${draft.basePrice} RON / noapte` : `from ${draft.basePrice} RON / night`}
                    onChange={(e) => updateDetails(locale, { priceLabel: e.target.value })} />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prețuri pe perioade</CardTitle>
          <CardDescription>
            Prețul unei nopți = prețul perioadei care o include; dacă se suprapun mai multe perioade, câștigă cea mai
            scurtă (apoi cea adăugată ultima). În rest se aplică prețul de bază. Datele sunt nopți (data de început și
            de sfârșit incluse).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedOverrides.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>De la</TableHead>
                  <TableHead>Până la (inclusiv)</TableHead>
                  <TableHead>Preț / noapte</TableHead>
                  <TableHead>Etichetă</TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOverrides.map((o) => (
                  <TableRow key={o.id} className={cn(o.endDate < today && 'opacity-50')}>
                    <TableCell>{format(parseISO(o.startDate), 'd MMM yyyy', { locale: ro })}</TableCell>
                    <TableCell>{format(parseISO(o.endDate), 'd MMM yyyy', { locale: ro })}</TableCell>
                    <TableCell>{o.price} RON</TableCell>
                    <TableCell>{o.label}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button type="button" variant="outline" size="sm" onClick={() => {
                        setEditingOverrideId(o.id);
                        setOverrideForm({ startDate: o.startDate, endDate: o.endDate, price: String(o.price), label: o.label || '' });
                      }}>Editează</Button>
                      <Button type="button" variant="ghost" size="icon" aria-label="Șterge perioada"
                        onClick={() => update({ priceOverrides: draft.priceOverrides.filter((x) => x.id !== o.id) })}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="grid gap-3 sm:grid-cols-5 items-end rounded-md border p-3">
            <div className="space-y-1">
              <Label htmlFor="ovr-start">De la</Label>
              <Input id="ovr-start" type="date" value={overrideForm.startDate}
                onChange={(e) => setOverrideForm((f) => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ovr-end">Până la (inclusiv)</Label>
              <Input id="ovr-end" type="date" value={overrideForm.endDate}
                onChange={(e) => setOverrideForm((f) => ({ ...f, endDate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ovr-price">Preț / noapte (RON)</Label>
              <Input id="ovr-price" type="number" min={1} value={overrideForm.price}
                onChange={(e) => setOverrideForm((f) => ({ ...f, price: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ovr-label">Etichetă (opțional)</Label>
              <Input id="ovr-label" placeholder="ex. Revelion" value={overrideForm.label}
                onChange={(e) => setOverrideForm((f) => ({ ...f, label: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={submitOverride}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {editingOverrideId ? 'Actualizează' : 'Adaugă'}
              </Button>
              {editingOverrideId && (
                <Button type="button" variant="ghost" onClick={() => { setEditingOverrideId(null); setOverrideForm(EMPTY_OVERRIDE); }}>
                  Renunță
                </Button>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Previzualizare: prețul pe noapte în următoarele 30 de zile</p>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1" data-testid="price-preview">
              {preview.map((n) => {
                const o = overrideFor(draft, n.date);
                return (
                  <div
                    key={n.date}
                    title={o?.label ? `${o.label}: ${n.price} RON` : `${n.price} RON`}
                    className={cn(
                      'rounded border px-1 py-1 text-center text-xs',
                      o ? 'bg-amber-100 border-amber-400 dark:bg-amber-900/40' : 'bg-muted/40',
                    )}
                  >
                    <div className="text-muted-foreground">{format(parseISO(n.date), 'EEE d MMM', { locale: ro })}</div>
                    <div className="font-semibold">{n.price}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fotografii</CardTitle>
          <CardDescription>
            Prima fotografie este cea principală. Imaginile se micșorează automat la max. 2400px și se convertesc în
            WebP înainte de încărcare.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {draft.images.map((img, i) => (
              <div key={img.url + i} className="rounded-md border p-2 space-y-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded bg-muted">
                  <Image src={img.url} alt={img.alt} fill className="object-cover" sizes="300px" />
                  {i === 0 && <span className="absolute left-1 top-1 rounded bg-black/70 px-2 py-0.5 text-xs text-white">Principală</span>}
                </div>
                <Input aria-label="Text alternativ" placeholder="Text alternativ (descriere)" value={img.alt}
                  onChange={(e) => update({ images: draft.images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)) })} />
                <div className="flex justify-between">
                  <div className="space-x-1">
                    <Button type="button" variant="outline" size="icon" aria-label="Mută înainte" disabled={i === 0}
                      onClick={() => update({ images: move(draft.images, i, -1) })}><ArrowUp className="h-4 w-4" /></Button>
                    <Button type="button" variant="outline" size="icon" aria-label="Mută după" disabled={i === draft.images.length - 1}
                      onClick={() => update({ images: move(draft.images, i, 1) })}><ArrowDown className="h-4 w-4" /></Button>
                  </div>
                  <Button type="button" variant="ghost" size="icon" aria-label="Șterge fotografia" onClick={() => removeImage(i)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" data-testid="room-image-input"
            onChange={(e) => handleFiles(e.target.files)} />
          <Button type="button" variant="outline" onClick={() => fileInput.current?.click()} disabled={uploading > 0}>
            {uploading > 0 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
            {uploading > 0 ? `Se încarcă (${uploading})...` : 'Adaugă fotografii'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dotări</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {draft.amenities.map((a, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <IconSelect value={a.icon} onChange={(icon) => update({ amenities: draft.amenities.map((x, j) => (j === i ? { ...x, icon } : x)) })} />
              <Input className="flex-1 min-w-[160px]" placeholder="Text RO" value={a.ro}
                onChange={(e) => update({ amenities: draft.amenities.map((x, j) => (j === i ? { ...x, ro: e.target.value } : x)) })} />
              <Input className="flex-1 min-w-[160px]" placeholder="Text EN" value={a.en}
                onChange={(e) => update({ amenities: draft.amenities.map((x, j) => (j === i ? { ...x, en: e.target.value } : x)) })} />
              <Button type="button" variant="outline" size="icon" aria-label="Mută sus" disabled={i === 0}
                onClick={() => update({ amenities: move(draft.amenities, i, -1) })}><ArrowUp className="h-4 w-4" /></Button>
              <Button type="button" variant="outline" size="icon" aria-label="Mută jos" disabled={i === draft.amenities.length - 1}
                onClick={() => update({ amenities: move(draft.amenities, i, 1) })}><ArrowDown className="h-4 w-4" /></Button>
              <Button type="button" variant="ghost" size="icon" aria-label="Șterge dotarea"
                onClick={() => update({ amenities: draft.amenities.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4 text-red-600" /></Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => update({ amenities: [...draft.amenities, { icon: 'Check', ro: '', en: '' }] })}>
            <PlusCircle className="mr-2 h-4 w-4" /> Adaugă dotare
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Specificații</CardTitle>
          <CardDescription>Ex. suprafața („23 m²”, pictograma Square) și capacitatea („Max 2 oaspeți”, pictograma Users).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {draft.specs.map((s, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <IconSelect value={s.icon} onChange={(icon) => update({ specs: draft.specs.map((x, j) => (j === i ? { ...x, icon } : x)) })} />
              <Input className="flex-1 min-w-[160px]" value={s.text}
                onChange={(e) => update({ specs: draft.specs.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} />
              <Button type="button" variant="ghost" size="icon" aria-label="Șterge specificația"
                onClick={() => update({ specs: draft.specs.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4 text-red-600" /></Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => update({ specs: [...draft.specs, { icon: 'Check', text: '' }] })}>
            <PlusCircle className="mr-2 h-4 w-4" /> Adaugă specificație
          </Button>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur">
        {isDirty && <span className="mr-auto text-sm text-amber-600">Aveți modificări nesalvate.</span>}
        <Button type="button" variant="ghost" disabled={!isDirty || isSaving} onClick={() => { setDraft(room); setPendingDeletes([]); }}>
          <Undo2 className="mr-2 h-4 w-4" /> Renunță la modificări
        </Button>
        <Button type="button" onClick={handleSave} disabled={!isDirty || isSaving || uploading > 0}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvează
        </Button>
      </div>
    </div>
  );
}
