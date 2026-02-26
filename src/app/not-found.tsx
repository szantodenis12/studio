import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <h2 className="mb-4 text-4xl font-bold text-primary text-headline">404</h2>
      <h3 className="mb-4 text-xl font-semibold">Pagina nu a fost găsită</h3>
      <p className="mb-8 text-muted-foreground">
        Ne pare rău, dar pagina pe care o căutați nu există sau a fost mutată.
      </p>
      <Button asChild>
        <Link href="/">Înapoi la Acasă</Link>
      </Button>
    </div>
  );
}
