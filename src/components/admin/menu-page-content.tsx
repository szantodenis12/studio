
'use client';
import MenuEditor from '@/components/admin/menu-editor';

export default function MenuPageContent() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Editor Meniu</h2>
        </div>
        <div className="max-w-4xl mx-auto">
            <MenuEditor menuId="main-menu" />
        </div>
    </div>
  );
}
