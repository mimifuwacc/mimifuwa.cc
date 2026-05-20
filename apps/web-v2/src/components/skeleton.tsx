export function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 h-full flex flex-col gap-3">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton h-6 w-full" />
      <div className="skeleton h-6 w-4/5" />
      <div className="skeleton h-4 w-full mt-1" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-4 w-2/3" />
      <div className="flex gap-2 mt-auto pt-2">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function BlogPostSkeleton() {
  return (
    <div className="py-12 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
      <div className="skeleton h-10 w-3/4 mx-auto" />
      <div className="skeleton h-10 w-1/2 mx-auto" />
      <div className="flex justify-center gap-4 mt-2">
        <div className="skeleton h-5 w-32" />
        <div className="skeleton h-5 w-24" />
      </div>
      <div className="mt-12 space-y-4">
        <div className="skeleton h-5 w-full" />
        <div className="skeleton h-5 w-full" />
        <div className="skeleton h-5 w-5/6" />
        <div className="skeleton h-5 w-full mt-6" />
        <div className="skeleton h-5 w-4/5" />
        <div className="skeleton h-40 w-full mt-4" />
        <div className="skeleton h-5 w-full mt-4" />
        <div className="skeleton h-5 w-3/4" />
      </div>
    </div>
  );
}
