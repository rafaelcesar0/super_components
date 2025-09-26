"use client";

export const dynamic = "force-dynamic"; // evitar cache em dev
import * as React from "react";
import { ApiSmartTable } from "@/components/api-smart-table";

async function fetchPayload(signal?: AbortSignal) {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
    cache: "no-store",
    signal,
  });
  return response.json();
}

export default function Page() {
  const [payload, setPayload] = React.useState<unknown>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    fetchPayload(controller.signal)
      .then((data) => setPayload(data))
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Não foi possível carregar os dados.");
          console.error("Erro ao buscar JSONPlaceholder:", err);
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="p-6 space-y-3 w-full min-w-0">
      <div className="space-y-3 min-w-0">
        <h1 className="text-xl font-semibold">JSONPlaceholder /posts</h1>
        <p className="text-sm text-muted-foreground">Array na raiz com 100 posts (id, userId, title, body)</p>
        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {!payload && !error ? (
          <div className="text-sm text-muted-foreground">Carregando dados...</div>
        ) : null}
      </div>
      {payload ? (
        <div className="w-full min-w-0">
          <ApiSmartTable
            tableId="demo-jsonplaceholder-posts"
            payload={payload}
            options={{ maxDepth: 2, arrayStrategy: "join", maxColumns: 20 }}
            rowContextMenu={{
              enabled: true,
              onEdit: () => alert("Editar"),
              onDelete: () => alert("Deletar"),
              onCreate: () => alert("Criar"),
            }}
          />
          <br />
          <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
            <div className="mb-1 font-medium text-foreground">Payload recebido</div>
            <pre className="max-h-72 overflow-auto rounded bg-background p-3">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
