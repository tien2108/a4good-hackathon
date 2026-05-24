import { useState, useEffect, useRef } from "react";
import { History, Folder, FolderPlus, Trash2, Edit2, Check, X, ArrowUpDown, ChevronDown, ChevronRight, Move, Landmark, RefreshCw } from "lucide-react";
import { useApp } from "./AppContext";

interface RunItem {
  id: string;
  name: string;
  timestamp: string;
  folderId: string;
  data: any;
}

interface FolderItem {
  id: string;
  name: string;
}

type SortFilter = "newest" | "oldest" | "name_az" | "name_za";

export function HistoryDropdown() {
  const {
    isViewingHistory,
    historicalRunName,
    loadHistoricalRun,
    restoreLiveSession,
    theme
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [runs, setRuns] = useState<RunItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  
  // Collapse state for folders (folderId -> expanded)
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  // Editing state
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingRunId, setEditingRunId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Sort State
  const [sortBy, setSortBy] = useState<SortFilter>("newest");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount and when dropdown opens
  const loadData = () => {
    try {
      const storedRuns = window.localStorage.getItem("compliance_runs_history");
      const runsList: RunItem[] = storedRuns ? JSON.parse(storedRuns) : [];
      setRuns(runsList);

      const storedFolders = window.localStorage.getItem("compliance_folders");
      const foldersList: FolderItem[] = storedFolders ? JSON.parse(storedFolders) : [
        { id: "medical_devices", name: "Medical Devices Audit" },
        { id: "hr_screening", name: "HR Recruitment Specs" }
      ];
      setFolders(foldersList);
      
      // Save default folders back if they weren't in localStorage
      if (!storedFolders) {
        window.localStorage.setItem("compliance_folders", JSON.stringify(foldersList));
      }
    } catch (e) {
      console.error("[HistoryDropdown] Error loading history data:", e);
    }
  };

  useEffect(() => {
    loadData();
    // Poll or listen to window focus/storage events to stay sync'd
    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Reload data whenever the dropdown is toggled open
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setEditingFolderId(null);
        setEditingRunId(null);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const saveRuns = (updatedRuns: RunItem[]) => {
    setRuns(updatedRuns);
    window.localStorage.setItem("compliance_runs_history", JSON.stringify(updatedRuns));
  };

  const saveFolders = (updatedFolders: FolderItem[]) => {
    setFolders(updatedFolders);
    window.localStorage.setItem("compliance_folders", JSON.stringify(updatedFolders));
  };

  // Create Folder
  const handleCreateFolder = () => {
    const newId = `folder-${Date.now()}`;
    const newFolder: FolderItem = {
      id: newId,
      name: `Folder ${folders.length + 1}`
    };
    const updated = [...folders, newFolder];
    saveFolders(updated);
    setEditingFolderId(newId);
    setEditText(newFolder.name);
  };

  // Delete Folder
  const handleDeleteFolder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = folders.filter(f => f.id !== id);
    saveFolders(updated);

    // Re-assign runs in this folder to unassigned
    const updatedRuns = runs.map(run => {
      if (run.folderId === id) {
        return { ...run, folderId: "unassigned" };
      }
      return run;
    });
    saveRuns(updatedRuns);
  };

  // Start renaming folder
  const startRenameFolder = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolderId(id);
    setEditText(name);
  };

  // Submit rename folder
  const submitRenameFolder = (id: string) => {
    if (!editText.trim()) return;
    const updated = folders.map(f => f.id === id ? { ...f, name: editText.trim() } : f);
    saveFolders(updated);
    setEditingFolderId(null);
  };

  // Start renaming run
  const startRenameRun = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRunId(id);
    setEditText(name);
  };

  // Submit rename run
  const submitRenameRun = (id: string) => {
    if (!editText.trim()) return;
    const updated = runs.map(r => r.id === id ? { ...r, name: editText.trim() } : r);
    saveRuns(updated);
    setEditingRunId(null);
  };

  // Delete Run
  const handleDeleteRun = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = runs.filter(r => r.id !== id);
    saveRuns(updated);
  };

  // Assign Run to Folder
  const handleMoveRun = (runId: string, folderId: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const targetFolderId = e.target.value;
    const updated = runs.map(r => r.id === runId ? { ...r, folderId: targetFolderId } : r);
    saveRuns(updated);
  };

  const toggleFolderCollapse = (folderId: string) => {
    setCollapsedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  // Sort and Filter Runs
  const getSortedRuns = () => {
    const list = [...runs];
    switch (sortBy) {
      case "oldest":
        return list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      case "name_az":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "name_za":
        return list.sort((a, b) => b.name.localeCompare(a.name));
      case "newest":
      default:
        return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  };

  const sortedRuns = getSortedRuns();

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-sm transition-all focus:outline-none ${
          isViewingHistory
            ? "border-amber-500 bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20"
            : "border-border bg-card/60 text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <History className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">
          {isViewingHistory ? "Archive Active" : "Audit Trail"}
        </span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {/* Dropdown Overlay Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] origin-top-right rounded-2xl border border-border/80 bg-card/95 shadow-elegant backdrop-blur-md focus:outline-none z-50 p-4">
          
          {/* Header Controls inside Menu */}
          <div className="mb-3 flex items-center justify-between border-b border-border/40 pb-3">
            <div>
              <h4 className="text-xs font-bold text-foreground">Compliance Generations</h4>
              <p className="text-[10px] text-muted-foreground">Auto-saved and grouped runs</p>
            </div>
            
            <button
              onClick={handleCreateFolder}
              className="inline-flex h-7 items-center gap-1 rounded bg-[color:var(--brand-via)]/10 px-2 py-1 text-[10px] font-semibold text-[color:var(--brand-via)] hover:bg-[color:var(--brand-via)]/20 transition-colors"
              title="Add New Folder"
            >
              <FolderPlus className="h-3 w-3" />
              <span>Add Folder</span>
            </button>
          </div>

          {/* Sort Filter Selector */}
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-background/50 px-2.5 py-1.5 border border-border/40">
            <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />
            <span className="text-[10px] text-muted-foreground font-medium">Sort runs:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortFilter)}
              className="ml-auto bg-transparent border-none text-[10px] font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_az">Name A-Z</option>
              <option value="name_za">Name Z-A</option>
            </select>
          </div>

          {/* Directory / Scroll List */}
          <div className="max-h-[300px] overflow-y-auto pr-1 space-y-3.5 scrollbar-thin">
            
            {/* List Folders */}
            {folders.map(folder => {
              const isCollapsed = collapsedFolders[folder.id] ?? false;
              const folderRuns = sortedRuns.filter(r => r.folderId === folder.id);

              return (
                <div key={folder.id} className="rounded-xl border border-border/30 bg-background/20 p-2">
                  <div className="flex items-center gap-1.5 cursor-pointer group mb-1" onClick={() => toggleFolderCollapse(folder.id)}>
                    <span className="text-muted-foreground/60 hover:text-foreground">
                      {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </span>
                    <Folder className="h-3.5 w-3.5 text-amber-500 fill-amber-500/10 shrink-0" />
                    
                    {editingFolderId === folder.id ? (
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={() => submitRenameFolder(folder.id)}
                        onKeyDown={(e) => e.key === "Enter" && submitRenameFolder(folder.id)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="min-w-0 flex-1 rounded border border-border bg-background px-1 py-0.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                      />
                    ) : (
                      <span className="text-[11px] font-bold text-foreground truncate flex-1 hover:text-[color:var(--brand-via)] transition-colors">
                        {folder.name}
                        <span className="ml-1.5 text-[9px] font-normal text-muted-foreground">({folderRuns.length})</span>
                      </span>
                    )}

                    {editingFolderId !== folder.id && (
                      <div className="hidden group-hover:flex items-center gap-1">
                        <button
                          onClick={(e) => startRenameFolder(folder.id, folder.name, e)}
                          className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
                        >
                          <Edit2 className="h-2.5 w-2.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteFolder(folder.id, e)}
                          className="p-1 text-red-400 hover:text-red-500 hover:bg-muted rounded"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Render Folder Runs */}
                  {!isCollapsed && (
                    <div className="pl-4 border-l border-border/30 ml-2 mt-1.5 space-y-1">
                      {folderRuns.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground/50 py-1 pl-1">Empty Folder</p>
                      ) : (
                        folderRuns.map(run => renderRunItem(run))
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Unassigned / Loose Runs Section */}
            <div className="rounded-xl border border-dashed border-border/40 p-2 bg-background/5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Landmark className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                <span className="text-[10px] font-bold text-muted-foreground">Loose Audit Runs</span>
                <span className="text-[9px] text-muted-foreground/50">({sortedRuns.filter(r => r.folderId === "unassigned" || !r.folderId).length})</span>
              </div>
              <div className="space-y-1">
                {sortedRuns.filter(r => r.folderId === "unassigned" || !r.folderId).map(run => renderRunItem(run))}
                {sortedRuns.filter(r => r.folderId === "unassigned" || !r.folderId).length === 0 && (
                  <p className="text-[10px] text-muted-foreground/40 py-1 pl-1 text-center">No loose runs</p>
                )}
              </div>
            </div>

          </div>

          {/* Active Run Status / Restoration Controls */}
          {isViewingHistory && (
            <div className="mt-3 border-t border-border/40 pt-3 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-[9px] uppercase font-bold text-amber-500 tracking-wider">Currently Viewing</p>
                <p className="text-[11px] font-semibold text-foreground truncate">{historicalRunName}</p>
              </div>
              <button
                onClick={() => {
                  restoreLiveSession();
                  setIsOpen(false);
                }}
                className="shrink-0 inline-flex items-center gap-1 rounded bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-500 hover:bg-amber-500 hover:text-white transition-all border border-amber-500/30"
              >
                <RefreshCw className="h-2.5 w-2.5 animate-spin-slow" />
                <span>Go Live</span>
              </button>
            </div>
          )}
          
        </div>
      )}
    </div>
  );

  // Helper to Render a Run Item Row
  function renderRunItem(run: RunItem) {
    const isSelected = historicalRunName === run.name && isViewingHistory;
    
    return (
      <div
        key={run.id}
        className={`group/run flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition-all text-left ${
          isSelected
            ? "bg-amber-500/15 border border-amber-500/30"
            : "hover:bg-muted/70 border border-transparent"
        }`}
      >
        <div
          onClick={() => {
            loadHistoricalRun(run);
            setIsOpen(false);
          }}
          className="flex-1 min-w-0 cursor-pointer"
        >
          {editingRunId === run.id ? (
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={() => submitRenameRun(run.id)}
              onKeyDown={(e) => e.key === "Enter" && submitRenameRun(run.id)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded border border-border bg-background px-1 py-0.5 text-[10px] text-foreground focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-via)] font-medium"
            />
          ) : (
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-foreground truncate group-hover/run:text-[color:var(--brand-via)] transition-colors">
                {run.name}
              </p>
              <p className="text-[8px] text-muted-foreground/60">
                {new Date(run.timestamp).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Options Overlay */}
        {editingRunId !== run.id && (
          <div className="flex items-center gap-1 opacity-0 group-hover/run:opacity-100 transition-opacity">
            {/* Move to Folder select Dropdown */}
            <div className="relative" title="Assign Folder">
              <select
                value={run.folderId || "unassigned"}
                onChange={(e) => handleMoveRun(run.id, run.folderId, e)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              >
                <option value="unassigned">Unassigned</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <button className="p-1 text-muted-foreground/60 hover:text-foreground hover:bg-muted rounded">
                <Move className="h-2.5 w-2.5" />
              </button>
            </div>

            <button
              onClick={(e) => startRenameRun(run.id, run.name, e)}
              className="p-1 text-muted-foreground/60 hover:text-foreground hover:bg-muted rounded"
            >
              <Edit2 className="h-2.5 w-2.5" />
            </button>
            <button
              onClick={(e) => handleDeleteRun(run.id, e)}
              className="p-1 text-red-400 hover:text-red-500 hover:bg-muted rounded"
            >
              <Trash2 className="h-2.5 w-2.5" />
            </button>
          </div>
        )}
      </div>
    );
  }
}
