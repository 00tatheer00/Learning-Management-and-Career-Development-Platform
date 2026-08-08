import { ModuleDataLoadingModal } from "@/components/portal/module-data-loading-modal";

export default function Loading() {
  return (
    <ModuleDataLoadingModal
      isLoading={true}
      title="Loading Website..."
      subtitle="Fetching latest course records and portal data"
    />
  );
}

