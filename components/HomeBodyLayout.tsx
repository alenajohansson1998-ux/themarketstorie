import React from 'react';

export default function HomeBodyLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex-1 min-w-0">{children}</div>
      {sidebar && (
        <aside className="w-full md:w-80 lg:w-96 shrink-0">{sidebar}</aside>
      )}
    </div>
  );
}
