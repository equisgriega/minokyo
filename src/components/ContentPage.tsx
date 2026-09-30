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
      <h1 className="font-display text-3xl font-bold text-[#5c4230] mb-2">{title}</h1>
      {updated && <p className="text-sm text-[#6b5c51] mb-8">Son güncelleme: {updated}</p>}
      <div className="prose-mnk space-y-4 text-[#3b2f28] leading-relaxed">{children}</div>
    </div>
  );
}
