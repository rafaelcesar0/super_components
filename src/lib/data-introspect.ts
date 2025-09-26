import type { ColumnDef } from "@tanstack/react-table";

export type IntrospectOptions = {
  maxDepth?: number;
  arrayStrategy?: "join" | "count" | "first";
  maxColumns?: number;
  onlyPaths?: string[];
  omitPaths?: string[];
  headerOverrides?: Record<string, string>;
};

type RowRecord = Record<string, unknown>;
type FindResult = { path: string[]; rows: RowRecord[] } | null;

function isObject(x: unknown): x is RowRecord {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

function isIsoLike(s: string) {
  return /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(s);
}

const DEFAULT_DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "medium",
  timeZone: "UTC",
});

export function findRowsArray(payload: unknown, maxScanDepth = 4): FindResult {
  if (Array.isArray(payload) && payload.some(isObject)) {
    return { path: [], rows: payload.filter(isObject) };
  }
  if (!isObject(payload)) return null;

  const preferred = new Set(["data", "items", "results", "rows"]);
  const root = payload as RowRecord;
  const queue: Array<{ node: RowRecord; path: string[]; depth: number }> = [
    { node: root, path: [], depth: 0 },
  ];

  while (queue.length) {
    const { node, path, depth } = queue.shift()!;
    if (depth > maxScanDepth) continue;

    const keys = Object.keys(node).sort((a, b) => {
      const ap = preferred.has(a) ? -1 : 0;
      const bp = preferred.has(b) ? -1 : 0;
      return ap - bp;
    });

    for (const key of keys) {
      const value = node[key];
      if (Array.isArray(value) && value.length) {
        const objectItems = value.filter(isObject);
        if (objectItems.length) {
          return { path: [...path, key], rows: objectItems };
        }
      }
      if (isObject(value)) {
        queue.push({ node: value, path: [...path, key], depth: depth + 1 });
      }
    }
  }
  return null;
}

export function flattenObject(
  obj: RowRecord,
  opts: Required<Pick<IntrospectOptions, "maxDepth" | "arrayStrategy">>,
  prefix = "",
  depth = 0,
  out: RowRecord = {}
) {

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      if (opts.arrayStrategy === "count") {
        out[path] = value.length;
      } else if (opts.arrayStrategy === "first") {
        out[path] = value[0] ?? null;
      } else {
        if (value.every((item) => !isObject(item))) {
          out[path] = value.map((item) => String(item)).join(", ");
        } else {
          out[path] = `[${value.length} itens]`;
        }
      }
      continue;
    }

    if (isObject(value) && depth < opts.maxDepth) {
      flattenObject(value, opts, path, depth + 1, out);
      continue;
    }

    out[path] = value;
  }
  return out;
}

function humanize(path: string) {
  return path
    .split(".")
    .map((segment) =>
      segment
        .replace(/[_\-]+/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/\s+/g, " ")
        .replace(/^./, (c) => c.toUpperCase())
    )
    .join(" ");
}

function inferType(value: unknown): "number" | "boolean" | "date" | "string" {
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "string" && isIsoLike(value)) return "date";
  return "string";
}

export function buildColumnDefs(
  flattenedRows: RowRecord[],
  opts: IntrospectOptions = {}
): ColumnDef<RowRecord>[] {
  const { maxColumns = 20, onlyPaths, omitPaths = [], headerOverrides = {} } = opts;

  const keys = new Set<string>();
  for (const row of flattenedRows) Object.keys(row).forEach((key) => keys.add(key));

  let all = Array.from(keys);
  if (onlyPaths?.length) {
    const set = new Set(onlyPaths);
    all = all.filter((key) => set.has(key));
  }
  if (omitPaths?.length) {
    const omit = new Set(omitPaths);
    all = all.filter((key) => !omit.has(key));
  }

  if (all.length > maxColumns) all = all.slice(0, maxColumns);

  // Move ID column to first position if it exists
  const idIndex = all.findIndex(key => key.toLowerCase() === "id" || key.toLowerCase().endsWith(".id"));
  if (idIndex > 0) {
    const idColumn = all.splice(idIndex, 1)[0];
    all.unshift(idColumn);
  }

  return all.map((path) => {
    const sampleRow = flattenedRows.find((row) => row[path] !== undefined);
    const sample = sampleRow ? sampleRow[path] : undefined;
    const inferred = inferType(sample);

    return {
      id: path,
      accessorKey: path,
      header: headerOverrides[path] ?? humanize(path),
      cell: ({ getValue }) => {
        const value = getValue<unknown>();
        if (value == null) return "—";
        if (inferred === "date") {
          const date = new Date(value as string);
          return Number.isNaN(date.valueOf()) ? String(value) : DEFAULT_DATE_FORMATTER.format(date);
        }
        if (typeof value === "boolean") return value ? "Sim" : "Não";
        return String(value);
      },
      meta: { align: inferred === "number" ? "right" : "left", type: inferred },
      enableSorting: inferred !== "string" || typeof sample === "string",
    } satisfies ColumnDef<RowRecord>;
  });
}

export function introspectPayload(
  payload: unknown,
  options: IntrospectOptions = {}
):
  | { ok: true; rows: RowRecord[]; columnDefs: ColumnDef<RowRecord>[]; arrayPath: string[] }
  | { ok: false; reason: string } {
  const found = findRowsArray(payload);
  if (!found) return { ok: false, reason: "Nenhum array de objetos encontrado no payload." };

  const maxDepth = options.maxDepth ?? 2;
  const arrayStrategy = options.arrayStrategy ?? "join";

  const flattened = found.rows.map((row) => flattenObject(row, { maxDepth, arrayStrategy }));
  const columnDefs = buildColumnDefs(flattened, options);
  return { ok: true, rows: flattened, columnDefs, arrayPath: found.path };
}
