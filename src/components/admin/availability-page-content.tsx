
'use client';
import ManualAvailabilityForm from '@/components/admin/manual-availability-form';
import { useState } from 'react';

export default function AvailabilityPageContent() {
  const [_, setUpdateTrigger] = useState(0);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Disponibilitate</h2>
      </div>
      <div className="max-w-4xl mx-auto">
        <ManualAvailabilityForm onUpdate={() => setUpdateTrigger(v => v + 1)} />
      </div>
    </div>
  );
}
