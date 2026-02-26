'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <h2 className="mb-4 text-2xl font-bold text-primary">Ceva nu a funcționat corect!</h2>
      <p className="mb-8 text-muted-foreground max-w-md">
        Ne cerem scuze pentru inconvenient. O eroare neașteptată a împiedicat încărcarea paginii.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="default">
          Încearcă din nou
        </Button>
        <Button onClick={() => window.location.href = '/'} variant="outline">
          Pagina Principală
        </Button>
      </div>
    </div>
  );
}
