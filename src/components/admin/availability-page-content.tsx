'use client';
import ManualAvailabilityForm from '@/components/admin/manual-availability-form';
import AvailabilityGrid from '@/components/admin/availability-grid';

export default function AvailabilityPageContent() {
  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Disponibilitate</h2>
      </div>
      <AvailabilityGrid />
      <div className="max-w-4xl">
        <ManualAvailabilityForm onUpdate={() => undefined} />
      </div>
    </div>
  );
}
