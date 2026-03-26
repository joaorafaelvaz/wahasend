"use client";

interface DataTableProps {
  headers: string[];
  rows: Record<string, string>[];
  maxRows?: number;
}

export default function DataTable({ headers, rows, maxRows }: DataTableProps) {
  const displayRows = maxRows ? rows.slice(0, maxRows) : rows;

  return (
    <div className="overflow-x-auto rounded-lg border border-border-subtle">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface">
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 text-left font-medium text-text-muted border-b border-border-subtle"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-border-subtle last:border-b-0 hover:bg-surface/50"
            >
              {headers.map((h) => (
                <td key={h} className="px-4 py-2 text-text-primary">
                  {row[h] || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {maxRows && rows.length > maxRows && (
        <div className="px-4 py-2 text-xs text-text-muted bg-surface border-t border-border-subtle">
          Mostrando {maxRows} de {rows.length} linhas
        </div>
      )}
    </div>
  );
}
