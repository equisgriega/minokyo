export default function ContentPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-ink mb-2">{title}</h1>
      {updated && <p className="text-sm text-muted mb-8">Son güncelleme: {updated}</p>}
      <div className="prose-mnk space-y-4 text-ink leading-relaxed">{children}</div>
    </div>
  );
}
