export default function InfoCard({
  type,
  children,
}: {
  type: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-l-4 border-blue-500 bg-blue-50 p-4 my-4">
      <div className="font-bold">{type.toUpperCase()}</div>
      {children}
    </div>
  );
}
