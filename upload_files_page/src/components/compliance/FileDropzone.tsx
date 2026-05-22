import { useCallback, useEffect, useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  X,
  FileSpreadsheet,
  FileType2,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { useApp } from "./AppContext";

const ACCEPTED = ".pdf,.docx,.txt,.xlsx";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function iconFor(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "xlsx" || ext === "csv") return FileSpreadsheet;
  if (ext === "pdf") return FileType2;
  return FileText;
}

export function FileDropzone() {
  const { files, addFiles, removeFile, ingestionCollapsed, setIngestionCollapsed, t } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = useCallback(() => inputRef.current?.click(), []);

  useEffect(() => {
    const onDocDragOver = (e: DragEvent) => e.preventDefault();
    document.addEventListener("dragover", onDocDragOver);
    document.addEventListener("drop", onDocDragOver);
    return () => {
      document.removeEventListener("dragover", onDocDragOver);
      document.removeEventListener("drop", onDocDragOver);
    };
  }, []);

  const hasFiles = files.length > 0;
  const collapsed = hasFiles && ingestionCollapsed;

  return (
    <div>
      <input
        id="file-input"
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED}
        className="sr-only"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {collapsed ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-brand text-white shadow-glow">
              <UploadCloud className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {files.length} {t("ingest.staged")}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {files.map((f) => f.name).join(" · ")}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={onPick}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-card px-2.5 text-[11px] font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Plus className="h-3 w-3" /> {t("ingest.addMore")}
            </button>
            <button
              type="button"
              onClick={() => setIngestionCollapsed(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted"
              aria-label={t("ingest.expand")}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <label
            htmlFor="file-input"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
            }}
            className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all ${
              dragOver
                ? "border-[color:var(--brand-via)] bg-[color:var(--brand-via)]/5"
                : "border-border bg-muted/30 hover:border-[color:var(--brand-via)]/50 hover:bg-muted/50"
            }`}
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand shadow-glow">
              <UploadCloud className="h-6 w-6 text-white" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              {t("drop.title")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("drop.or")}{" "}
              <span className="font-medium text-[color:var(--brand-via)]">{t("drop.browse")}</span>{" "}
              · {t("drop.formats")}
            </p>
          </label>

          {hasFiles && (
            <>
              <ul className="mt-4 space-y-2">
                {files.map((f) => {
                  const Icon = iconFor(f.name);
                  return (
                    <li
                      key={f.id}
                      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm"
                    >
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-medium text-foreground">{f.name}</p>
                          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                            {formatSize(f.size)}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-gradient-brand transition-[width] duration-700 ease-out"
                            style={{ width: `${f.progress}%` }}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(f.id)}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Remove ${f.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={() => setIngestionCollapsed(true)}
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronUp className="h-3 w-3" /> {t("ingest.collapse")}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
