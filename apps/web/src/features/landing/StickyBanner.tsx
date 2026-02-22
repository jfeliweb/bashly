export const StickyBanner = (props: { children: React.ReactNode }) => (
  <div className="sticky top-0 z-50 bg-cerulean-950 p-4 text-center text-lg font-semibold text-white [&_a:hover]:text-fern-300 [&_a]:text-fern-400">
    {props.children}
  </div>
);
