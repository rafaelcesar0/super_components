"use client";
import * as React from "react";
import { DataTableCore, type RowContextMenuConfig } from "./data-table-core";
import { introspectPayload, type IntrospectOptions } from "@/lib/data-introspect";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export type ApiSmartTableProps = {
  payload: unknown;
  tableId: string;
  options?: IntrospectOptions;
  className?: string;
  rowContextMenu?: RowContextMenuConfig;
};

export function ApiSmartTable({ payload, tableId, options, className, rowContextMenu }: ApiSmartTableProps) {
  const result = React.useMemo(() => introspectPayload(payload, options), [payload, options]);

  if (!result.ok) {
    return (
      <div className="p-4 border rounded-lg text-sm flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-500" />
        <div>
          <div className="font-medium">Não foi possível montar a tabela automaticamente</div>
          <div className="text-muted-foreground">Motivo: {result.reason}</div>
          <div className="text-muted-foreground mt-1">
            Dica: garanta que o payload contenha um <code>array</code> de objetos (direto ou dentro de
            <code> data </code>/<code> items </code>/<code> results </code>/<code> rows</code>).
          </div>
        </div>
      </div>
    );
  }

  const { rows, columnDefs, arrayPath } = result;

  return (
    <div className={cn("w-full max-w-full", className)}>
      <div className="text-xs text-muted-foreground mb-2">
        Fonte: <code>{arrayPath.length ? arrayPath.join(".") : "(raiz)"}</code>
      </div>
      <div className="w-full max-w-full min-w-0">
        <DataTableCore
          tableId={tableId}
          data={rows}
          columns={columnDefs}
          initialPageSize={10}
          rowContextMenu={rowContextMenu}
          className="w-full max-w-full"
        />
      </div>
    </div>
  );
}
