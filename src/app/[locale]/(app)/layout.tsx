import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex relative overflow-x-hidden min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen w-full">
        <Header />
        <main className="flex-1 p-6 lg:p-8 ml-[60px] lg:ml-[80px]">
          {children}
        </main>
      </div>
    </div>
  );
}
