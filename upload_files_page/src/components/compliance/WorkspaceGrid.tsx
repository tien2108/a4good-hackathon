import { IngestionPanel } from "./IngestionPanel";
import { ReferenceSidebar } from "./ReferenceSidebar";
import { useApp } from "./AppContext";

export function Workspace() {
  const { status } = useApp();
  const hasReport = status !== "idle";

  return (
    <section id="workspace" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        <div className="lg:col-span-3">
          <IngestionPanel compact={hasReport} />
        </div>
        <div className="lg:col-span-2">
          <ReferenceSidebar />
        </div>
      </div>
    </section>
  );
}
