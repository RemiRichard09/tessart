// The legacy Hydro-Québec bill tool was designed on a light surface;
// this nested layout restores it under the dark Plant Studio shell.
export default function EconomieLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-white text-gray-900">{children}</div>
  );
}
