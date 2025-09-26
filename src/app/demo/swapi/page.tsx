export const dynamic = "force-dynamic";
import { ApiSmartTable } from "@/components/api-smart-table";

async function getPayload() {
  const res = await fetch("https://swapi.dev/api/people/?page=1", { cache: "no-store" });
  return res.json(); // { count, next, previous, results: [...] }
}

export default async function Page() {
  const payload = await getPayload();
  return (
    <div className="p-6 space-y-3">
      <h1 className="text-xl font-semibold">SWAPI /people</h1>
      <p className="text-sm text-muted-foreground">Detecta `results` automaticamente</p>
      <ApiSmartTable
        tableId="demo-swapi-people"
        payload={payload}
        options={{ maxDepth: 1, arrayStrategy: "join", maxColumns: 20 }}
      />
    </div>
  );
}
