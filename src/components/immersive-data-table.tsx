"use client";

import type {
  ChangeEvent,
  DragEvent,
  MouseEvent as ReactMouseEvent,
} from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, GripVertical, Search, Settings2 } from "lucide-react";

type Column = {
  id: string;
  label: string;
  width: number;
  visible: boolean;
  accessor: keyof DataRow;
};

type DataRow = {
  id: string;
  batchId: string;
  partName: string;
  material: string;
  processType: string;
  techSpec: string;
  labelLeft: string;
  labelRight: string;
};

type DragState = {
  draggedColumn: string | null;
  draggedOverColumn: string | null;
  resizingColumn: string | null;
  startX: number;
  startWidth: number;
};

type ImmersiveDataTableProps = {
  className?: string;
};

const initialData: DataRow[] = [
  {
    id: "1",
    batchId: "MFG-006",
    partName: "Aero Wing Rib",
    material: "Al-7075",
    processType: "Anodizing (Type II)",
    techSpec: "Oxide Layer 15μm",
    labelLeft: "Raw Aluminum",
    labelRight: "Anodized Black",
  },
  {
    id: "2",
    batchId: "MFG-007",
    partName: "Hip Implant",
    material: "Ti-6Al-4V",
    processType: "Passivation",
    techSpec: "Bio-Inertness Level",
    labelLeft: "Machined",
    labelRight: "Passivated",
  },
  {
    id: "3",
    batchId: "MFG-008",
    partName: "Chef Knife",
    material: "HC Steel",
    processType: "Heat Treatment",
    techSpec: "58 HRC → 62 HRC",
    labelLeft: "Annealed",
    labelRight: "Quenched/Tempered",
  },
  {
    id: "4",
    batchId: "MFG-009",
    partName: "Heat Sink",
    material: "Copper",
    processType: "Skiving Fin",
    techSpec: "Thermal Diss. +20%",
    labelLeft: "Extruded Block",
    labelRight: "Skived Fins",
  },
  {
    id: "5",
    batchId: "MFG-010",
    partName: "Optical Lens",
    material: "Polycarbonate",
    processType: "AR Coating",
    techSpec: "Transm. 92% → 99%",
    labelLeft: "Uncoated",
    labelRight: "AR Coated",
  },
  {
    id: "6",
    batchId: "MFG-011",
    partName: "3D Print Proto",
    material: "Nylon 12 (SLS)",
    processType: "Vapor Smoothing",
    techSpec: "Porosity Seal (Water-tight)",
    labelLeft: "Sintered Raw",
    labelRight: "Vapor Fused",
  },
  {
    id: "7",
    batchId: "MFG-012",
    partName: "Brake Caliper",
    material: "Cast Aluminum",
    processType: "Powder Coating",
    techSpec: "Impact Resistance",
    labelLeft: "Sand Cast",
    labelRight: "Powder Coated Red",
  },
  {
    id: "8",
    batchId: "MFG-013",
    partName: "Injection Mold",
    material: "Tool Steel",
    processType: "EDM Texturing",
    techSpec: "VDI 3400 Ref 24",
    labelLeft: "Polished",
    labelRight: "Textured Matte",
  },
  {
    id: "9",
    batchId: "MFG-014",
    partName: "Battery Tab",
    material: "Nickel/Copper",
    processType: "Ultrasonic Welding",
    techSpec: "Shear Str. > 150N",
    labelLeft: "Loose Tabs",
    labelRight: "Welded",
  },
  {
    id: "10",
    batchId: "MFG-015",
    partName: "Drive Shaft",
    material: "Steel 4340",
    processType: "Induction Hardening",
    techSpec: "Case Depth 2.5mm",
    labelLeft: "Soft Core",
    labelRight: "Surface Hardened",
  },
  {
    id: "11",
    batchId: "MFG-016",
    partName: "Solar Panel",
    material: "Silicon Wafer",
    processType: "Anti-Reflect Etch",
    techSpec: "Absorption +6%",
    labelLeft: "Saw Cut",
    labelRight: "Texturized",
  },
  {
    id: "12",
    batchId: "MFG-017",
    partName: "Engine Piston",
    material: "Aluminum",
    processType: "Graphite Coat",
    techSpec: "Friction Coeff -0.15",
    labelLeft: "Bare Skirt",
    labelRight: "Coated Skirt",
  },
  {
    id: "13",
    batchId: "MFG-018",
    partName: "Pipe Weld",
    material: "Carbon Steel",
    processType: "X-Ray Inspection",
    techSpec: "Flaw Detection",
    labelLeft: "As Welded",
    labelRight: "NDT Verified",
  },
  {
    id: "14",
    batchId: "MFG-019",
    partName: "Jewelry Ring",
    material: "18k Gold",
    processType: "Buffing",
    techSpec: "Gloss Units > 95",
    labelLeft: "Cast/Sprue",
    labelRight: "Mirror Polish",
  },
  {
    id: "15",
    batchId: "MFG-020",
    partName: "Aircraft Window",
    material: "Acrylic",
    processType: "Micro-Polishing",
    techSpec: "Haze < 0.5%",
    labelLeft: "Scratched",
    labelRight: "Restored",
  },
  {
    id: "16",
    batchId: "MFG-021",
    partName: "Gear Tooth",
    material: "Steel",
    processType: "Carburizing",
    techSpec: "Surface C% 0.8%",
    labelLeft: "Low Carbon",
    labelRight: "Carburized",
  },
  {
    id: "17",
    batchId: "MFG-022",
    partName: "MEMS Sensor",
    material: "Silicon",
    processType: "Deep RIE Etch",
    techSpec: "Aspect Ratio 50:1",
    labelLeft: "Photoresist",
    labelRight: "Etched Trench",
  },
  {
    id: "18",
    batchId: "MFG-023",
    partName: "Med Needle",
    material: "Stainless 316",
    processType: "Electrochemical Grind",
    techSpec: "Burr Removal 100%",
    labelLeft: "Mech Cut",
    labelRight: "Burr-Free",
  },
  {
    id: "19",
    batchId: "MFG-024",
    partName: "Ship Hull",
    material: "Steel Plate",
    processType: "Primer Application",
    techSpec: "Salt Spray 500hrs",
    labelLeft: "Blasted SA 2.5",
    labelRight: "Zinc Primer",
  },
  {
    id: "20",
    batchId: "MFG-025",
    partName: "Phone Casing",
    material: "Ceramic",
    processType: "Diamond Lapping",
    techSpec: "Flatness < 1μm",
    labelLeft: "Sintered",
    labelRight: "Lapped",
  },
];

const ImmersiveDataTable = ({ className }: ImmersiveDataTableProps) => {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: "batchId",
      label: "Batch ID",
      width: 140,
      visible: true,
      accessor: "batchId",
    },
    {
      id: "partName",
      label: "Part Name",
      width: 220,
      visible: true,
      accessor: "partName",
    },
    {
      id: "material",
      label: "Material",
      width: 160,
      visible: true,
      accessor: "material",
    },
    {
      id: "processType",
      label: "Process Type",
      width: 220,
      visible: true,
      accessor: "processType",
    },
    {
      id: "techSpec",
      label: "Tech Spec Delta",
      width: 200,
      visible: true,
      accessor: "techSpec",
    },
    {
      id: "labelLeft",
      label: "Label (Left)",
      width: 180,
      visible: true,
      accessor: "labelLeft",
    },
    {
      id: "labelRight",
      label: "Label (Right)",
      width: 180,
      visible: true,
      accessor: "labelRight",
    },
  ]);
  const [data] = useState<DataRow[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    draggedColumn: null,
    draggedOverColumn: null,
    resizingColumn: null,
    startX: 0,
    startWidth: 0,
  });

  const filteredData = useMemo(
    () =>
      data.filter((row) =>
        Object.values(row).some((value) =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      ),
    [data, searchTerm]
  );

  const visibleColumns = useMemo(
    () => columns.filter((col) => col.visible),
    [columns]
  );

  useEffect(() => {
    if (!isColumnMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsColumnMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsColumnMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isColumnMenuOpen]);

  const handleColumnDragStart = (event: DragEvent, columnId: string) => {
    setDragState((prev) => ({ ...prev, draggedColumn: columnId }));
    event.dataTransfer.effectAllowed = "move";
  };

  const handleColumnDragOver = (event: DragEvent, columnId: string) => {
    event.preventDefault();
    setDragState((prev) => ({ ...prev, draggedOverColumn: columnId }));
  };

  const handleColumnDrop = (event: DragEvent, targetColumnId: string) => {
    event.preventDefault();
    const { draggedColumn } = dragState;

    if (draggedColumn && draggedColumn !== targetColumnId) {
      const nextColumns = [...columns];
      const draggedIndex = nextColumns.findIndex(
        (col) => col.id === draggedColumn
      );
      const targetIndex = nextColumns.findIndex(
        (col) => col.id === targetColumnId
      );

      const [removed] = nextColumns.splice(draggedIndex, 1);
      nextColumns.splice(targetIndex, 0, removed);

      setColumns(nextColumns);
    }

    setDragState({
      draggedColumn: null,
      draggedOverColumn: null,
      resizingColumn: null,
      startX: 0,
      startWidth: 0,
    });
  };

  const handleResizeStart = (event: ReactMouseEvent, columnId: string) => {
    event.preventDefault();
    const column = columns.find((col) => col.id === columnId);
    if (!column) return;

    setDragState((prev) => ({
      ...prev,
      resizingColumn: columnId,
      startX: event.clientX,
      startWidth: column.width,
    }));
  };

  const handleResizeMove = useCallback(
    (event: MouseEvent) => {
      if (!dragState.resizingColumn) return;
      const diff = event.clientX - dragState.startX;
      const newWidth = Math.max(120, dragState.startWidth + diff);

      setColumns((prev) =>
        prev.map((col) =>
          col.id === dragState.resizingColumn
            ? { ...col, width: newWidth }
            : col
        )
      );
    },
    [dragState.resizingColumn, dragState.startWidth, dragState.startX]
  );

  const handleResizeEnd = useCallback(() => {
    setDragState((prev) => ({
      ...prev,
      resizingColumn: null,
      startX: 0,
      startWidth: 0,
    }));
  }, []);

  useEffect(() => {
    if (!dragState.resizingColumn) return;

    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);

    return () => {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [dragState.resizingColumn, handleResizeEnd, handleResizeMove]);

  const handleToggleColumnMenu = () => {
    setIsColumnMenuOpen((prev) => !prev);
  };

  const toggleColumnVisibility = (columnId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div
      className={`flex h-full w-full items-stretch bg-linear-to-br from-background via-background to-muted/30 p-3 sm:p-4 ${
        className ?? ""
      }`}>
      <div className="flex h-full w-full flex-col rounded-2xl border border-black/5 bg-white/95 shadow-2xl backdrop-blur">
        <div className="flex h-full flex-col gap-4 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Process Tracker
              </h2>
              <p className="mt-1 text-sm text-gray-600 sm:text-base">
                Compare legacy rows with converted specs.
              </p>
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={handleToggleColumnMenu}
                aria-expanded={isColumnMenuOpen}
                aria-label="Select visible columns"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                <Settings2 className="h-4 w-4" aria-hidden="true" />
                Columns
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
              {isColumnMenuOpen ? (
                <div className="absolute right-0 z-10 mt-2 w-52 rounded-xl border border-black/5 bg-white shadow-xl">
                  <div className="py-2">
                    {columns.map((column) => (
                      <label
                        key={column.id}
                        className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-gray-800 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={column.visible}
                          onChange={() => toggleColumnVisibility(column.id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{column.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search across all columns..."
              aria-label="Search process rows"
              value={searchTerm}
              onChange={handleSearchChange}
              className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex-1 overflow-hidden rounded-xl border border-black/5 bg-gray-50/60">
            <div className="h-full overflow-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-white">
                    {visibleColumns.map((column, index) => (
                      <th
                        key={column.id}
                        style={{
                          width: `${column.width}px`,
                          minWidth: `${column.width}px`,
                        }}
                        className={`relative border-b border-black/5 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 ${
                          dragState.draggedOverColumn === column.id
                            ? "bg-blue-50"
                            : ""
                        }`}
                        draggable
                        onDragStart={(event) =>
                          handleColumnDragStart(event, column.id)
                        }
                        onDragOver={(event) =>
                          handleColumnDragOver(event, column.id)
                        }
                        onDrop={(event) => handleColumnDrop(event, column.id)}>
                        <div className="flex items-center gap-2">
                          <GripVertical
                            className="h-4 w-4 cursor-move text-gray-400"
                            aria-hidden="true"
                          />
                          <span>{column.label}</span>
                        </div>
                        {index < visibleColumns.length - 1 ? (
                          <div
                            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-transparent hover:bg-blue-200"
                            onMouseDown={(event) =>
                              handleResizeStart(event, column.id)
                            }
                          />
                        ) : null}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={visibleColumns.length}
                        className="py-10 text-center text-gray-500">
                        No results found. Try adjusting your search.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-black/5 bg-white/70 transition hover:bg-white">
                        {visibleColumns.map((column) => (
                          <td
                            key={column.id}
                            style={{
                              width: `${column.width}px`,
                              minWidth: `${column.width}px`,
                            }}
                            className="px-4 py-3 text-sm font-medium text-gray-800">
                            <span className="text-gray-700">
                              {row[column.accessor]}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600 sm:text-sm">
            <div>
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {filteredData.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">{data.length}</span>{" "}
              results
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-500 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70">
                Previous
              </button>
              <button
                type="button"
                disabled
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-500 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImmersiveDataTable;
