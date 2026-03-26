import * as XLSX from "xlsx";
import type { SpreadsheetData } from "@/types";

export function parseSpreadsheet(file: File): Promise<SpreadsheetData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
          defval: "",
          raw: false,
        });

        if (jsonData.length === 0) {
          reject(new Error("A planilha está vazia"));
          return;
        }

        const headers = Object.keys(jsonData[0]);

        resolve({
          headers,
          rows: jsonData,
          fileName: file.name,
        });
      } catch {
        reject(new Error("Erro ao ler a planilha. Verifique o formato do arquivo."));
      }
    };
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo"));
    reader.readAsArrayBuffer(file);
  });
}

export function detectColumnRole(header: string): "nome" | "telefone" | null {
  const h = header.toLowerCase().trim();
  if (["nome", "name", "nome completo", "full name", "nome_completo"].includes(h)) {
    return "nome";
  }
  if (["telefone", "phone", "celular", "tel", "whatsapp", "numero", "número", "fone"].includes(h)) {
    return "telefone";
  }
  return null;
}
