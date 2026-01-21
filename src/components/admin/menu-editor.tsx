
'use client';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Trash2, GripVertical, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

const menuItemSchema = z.object({
  name: z.string().min(1, 'Numele preparatului este obligatoriu.'),
  price: z.string().min(1, 'Prețul este obligatoriu.'),
  description: z.string().optional(),
  imageUrl: z.union([z.string().url({ message: "URL-ul imaginii nu este valid." }), z.literal('')]).optional(),
}).transform((data) => ({
    ...data,
    description: data.description ?? '',
    imageUrl: data.imageUrl ?? '',
}));

const menuPageSchema = z.object({
  title: z.string().min(1, 'Titlul paginii este obligatoriu.'),
  items: z.array(menuItemSchema),
});

const menuSchema = z.object({
  pages: z.array(menuPageSchema),
});

type MenuFormData = z.infer<typeof menuSchema>;
interface MenuEditorProps {
  menuId: string;
}

export default function MenuEditor({ menuId }: MenuEditorProps) {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const menuRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'menus', menuId);
  }, [db, menuId]);

  const { data: menuData, isLoading: isLoadingMenu } = useDoc<MenuFormData>(menuRef);

  const form = useForm<MenuFormData>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      pages: [],
    },
  });

  const { fields: pageFields, append: appendPage, remove: removePage, move: movePage } = useFieldArray({
    control: form.control,
    name: 'pages',
  });

  useEffect(() => {
    if (menuData) {
      form.reset({ pages: menuData.pages || [] });
    }
  }, [menuData, form]);

  const onSubmit = async (data: MenuFormData) => {
    if (!db) {
      toast({ variant: 'destructive', title: 'Eroare', description: 'Baza de date nu este disponibilă.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await setDoc(menuRef, data, { merge: true });
      toast({ title: 'Succes!', description: 'Meniul a fost actualizat.' });
    } catch (error: any) {
      console.error('Failed to save menu:', error);
      toast({ variant: 'destructive', title: 'Eroare la salvare', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingMenu) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-full mt-4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editor Meniu Restaurant</CardTitle>
        <CardDescription>Adaugă, editează sau reordonează paginile și preparatele din meniu.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Accordion type="multiple" className="w-full space-y-4">
              {pageFields.map((pageField, pageIndex) => (
                <PageEditor
                  key={pageField.id}
                  pageIndex={pageIndex}
                  removePage={removePage}
                  form={form}
                />
              ))}
            </Accordion>

            <Button type="button" variant="outline" onClick={() => appendPage({ title: '', items: [] })} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Adaugă Pagină Nouă
            </Button>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Se salvează...' : 'Salvează Meniul'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Sub-component for a single page
const PageEditor = ({ pageIndex, removePage, form }) => {
  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: `pages.${pageIndex}.items`,
  });

  return (
    <AccordionItem value={`page-${pageIndex}`} className="border rounded-lg bg-background p-0">
      <AccordionTrigger className="px-4 py-3 text-lg hover:no-underline">
        <div className="flex items-center w-full">
            <GripVertical className="h-5 w-5 text-muted-foreground mr-2" />
            <FormField
                control={form.control}
                name={`pages.${pageIndex}.title`}
                render={({ field }) => (
                <Input
                    {...field}
                    placeholder="Titlu Pagina (ex. Aperitive)"
                    className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 p-0 h-auto"
                    onClick={(e) => e.stopPropagation()} // Prevent accordion from toggling
                />
                )}
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                    e.stopPropagation();
                    removePage(pageIndex);
                }}
                className="ml-auto"
                >
                <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4">
          {itemFields.map((itemField, itemIndex) => (
            <div key={itemField.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start border-t pt-4">
               <div className="md:col-span-1 space-y-2">
                 <FormField
                    control={form.control}
                    name={`pages.${pageIndex}.items.${itemIndex}.name`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nume Preparat</FormLabel>
                            <FormControl><Input placeholder="Bruschete cu roșii" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                 <FormField
                    control={form.control}
                    name={`pages.${pageIndex}.items.${itemIndex}.price`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Preț</FormLabel>
                            <FormControl><Input placeholder="35 RON" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
              <div className="md:col-span-2 space-y-2">
                <FormField
                  control={form.control}
                  name={`pages.${pageIndex}.items.${itemIndex}.description`}
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>Descriere</FormLabel>
                        <FormControl><Textarea placeholder="Descriere scurtă..." {...field} rows={2} /></FormControl>
                        <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name={`pages.${pageIndex}.items.${itemIndex}.imageUrl`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL Imagine (Opțional)</FormLabel>
                            <FormControl><Input placeholder="https://example.com/imagine.jpg" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(itemIndex)} className="text-red-500">
                  <Trash2 className="mr-2 h-4 w-4" /> Șterge Preparat
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() => appendItem({ name: '', price: '', description: '', imageUrl: '' })}
            className="w-full mt-4"
          >
             <PlusCircle className="mr-2 h-4 w-4" /> Adaugă Preparat
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
