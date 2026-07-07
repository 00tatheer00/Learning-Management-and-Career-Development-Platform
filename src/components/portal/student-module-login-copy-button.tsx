"use client";

import { Copy } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { toast } from "@/lib/ui/toast";

interface StudentModuleLoginCopyButtonProps {
  moduleName: string;
  loginId: string;
  password: string;
  loginUrl: string;
}

export function StudentModuleLoginCopyButton({
  moduleName,
  loginId,
  password,
  loginUrl,
}: StudentModuleLoginCopyButtonProps) {
  const handleCopy = async () => {
    const copied = await copyToClipboard(
      `${moduleName} Login\nLogin ID: ${loginId}\nPassword: ${password}\nPortal: ${loginUrl}`
    );
    if (copied) {
      toast.success(`${moduleName} login copied`);
    } else {
      toast.error("Could not copy");
    }
  };

  return (
    <Button type="button" size="sm" variant="secondary" className="gap-2" onClick={() => void handleCopy()}>
      <Copy size={16} />
      Copy login details
    </Button>
  );
}
