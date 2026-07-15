"use client";

import { useState } from "react";
import { Button } from "@/common/atoms/ui/button";
import { Input } from "@/common/atoms/ui/input";
import { DepartmentPresetPicker } from "@/knowledge/molecules/DepartmentPresetPicker";
import { useUpdateDocumentAccessMutation } from "@/common/api/endpoints/knowledge.api";
import type { DocumentRecord } from "@/common/types";
import { parseScope } from "@/knowledge/utils/parseScope";
import { toast } from "@/common/lib/toast";

function formatScope(values: string[] | null | undefined): string {
  return values?.length ? values.join(", ") : "";
}

export function DocumentAccessEditor({
  document,
  onSaved,
}: {
  document: DocumentRecord;
  onSaved?: () => void;
}) {
  const [depts, setDepts] = useState(formatScope(document.allowed_departments));
  const [roles, setRoles] = useState(formatScope(document.allowed_roles));
  const [updateDocumentAccess, { isLoading }] =
    useUpdateDocumentAccessMutation();

  const save = async () => {
    try {
      await updateDocumentAccess({
        documentId: document.id,
        allowedDepartments: parseScope(depts),
        allowedRoles: parseScope(roles),
      }).unwrap();
      onSaved?.();
    } catch (error) {
      console.error("Unable to update document access.", error)
      toast.error("Unable to update document access.");
    }
  };

  return (
    <div className="mt-2 space-y-2 rounded-lg border border-border bg-muted/30 p-3">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Department presets
        </p>
        <DepartmentPresetPicker value={depts} onChange={setDepts} />
      </div>
      <Input
        label="Departments"
        value={depts}
        onChange={(e) => setDepts(e.target.value)}
        placeholder="Leave empty for all departments"
      />
      <Input
        label="Roles"
        value={roles}
        onChange={(e) => setRoles(e.target.value)}
        placeholder="Leave empty for all roles"
      />
      <Button size="sm" disabled={isLoading} onClick={() => void save()}>
        {isLoading ? "Saving…" : "Save access"}
      </Button>
    </div>
  );
}
