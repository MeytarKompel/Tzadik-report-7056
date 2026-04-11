import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

type ReportStatus = "reported" | "not_reported";

type SortOption =
  | ""
  | "deviceNumberAsc"
  | "deviceNumberDesc"
  | "deviceNameAsc"
  | "deviceNameDesc"
  | "reportedFirst"
  | "notReportedFirst";

type DailyReportRow = {
  inventoryItemId: string;
  sheetId: string;
  deviceNumber: string;
  deviceName: string | null;
  unit: string | null;
  status: string | null;
  assignedToUser: {
    personalNumber: string;
    fullName: string | null;
    phone: string | null;
  } | null;
  unitResponsibleUser: {
    personalNumber: string;
    fullName: string | null;
    phone: string | null;
  } | null;
  dailyReport: {
    id: string | null;
    reportDate: string;
    status: ReportStatus;
    location: string | null;
    reportedBy: string | null;
    reportedByName?: string | null;
    notes?: string | null;
  };
};

type DailyReportResponse = {
  sheet: {
    sheetName: string;
  };
  reportDate: string;
  rows: DailyReportRow[];
  availableUnits: string[];
};

function DailyReportDetailsPage(): JSX.Element {
  const { id, date } = useParams();
  const [data, setData] = useState<DailyReportResponse | null>(null);
  const [searchDeviceNumber, setSearchDeviceNumber] = useState("");
  const [filterDeviceName, setFilterDeviceName] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [primarySort, setPrimarySort] = useState<SortOption>("deviceNameAsc");
  const [secondarySort, setSecondarySort] =
    useState<SortOption>("deviceNumberDesc");
  const [thirdSort, setThirdSort] = useState<SortOption>("");
  const [pendingChanges, setPendingChanges] = useState<
    Record<string, ReportStatus>
  >({});
  const [pendingUnitChanges, setPendingUnitChanges] = useState<
    Record<string, string>
  >({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (id && date) loadData();
  }, [id, date]);

  async function loadData() {
    const res = await axios.get<DailyReportResponse>(
      `http://localhost:3001/api/inventory-sheets/${id}/full?reportDate=${date}`,
    );

    setData(res.data);
  }

  function getSavedStatus(row: DailyReportRow): ReportStatus {
    return row.dailyReport.status === "reported" ? "reported" : "not_reported";
  }

  function getRowKey(row: DailyReportRow): string {
    if (row.inventoryItemId) return String(row.inventoryItemId);
    if (row.dailyReport?.id) return String(row.dailyReport.id);

    const deviceNumber = String(row.deviceNumber ?? "").trim();
    const sheetId = String(row.sheetId ?? id ?? "").trim();
    const reportDate = String(row.dailyReport?.reportDate ?? date ?? "").trim();

    return `${sheetId}__${reportDate}__${deviceNumber}`;
  }

  function getUnitName(row: DailyReportRow): string {
    return row.unit ?? "לא משויך";
  }

  function getUnitManagerName(row: DailyReportRow): string {
    return row.unitResponsibleUser?.fullName ?? "לא ידוע";
  }

  function getAssignedToName(row: DailyReportRow): string {
    return row.assignedToUser?.fullName ?? "לא משויך";
  }

  function getLocation(row: DailyReportRow): string {
    return row.dailyReport?.location ?? "לא צוין";
  }

  function getReportedBy(row: DailyReportRow): string {
    return (
      row.dailyReport?.reportedByName ??
      row.dailyReport?.reportedBy ??
      "לא דווח"
    );
  }

  function getNotes(row: DailyReportRow): string {
    return row.dailyReport?.notes ?? "אין הערות";
  }

  function handleStatusChange(row: DailyReportRow, newStatus: ReportStatus) {
    const rowKey = getRowKey(row);

    setPendingChanges((prev) => ({
      ...prev,
      [rowKey]: newStatus,
    }));

    setSaveMessage("");
  }

  function handleUnitChange(row: DailyReportRow, newUnit: string) {
    const rowKey = getRowKey(row);

    setPendingUnitChanges((prev) => ({
      ...prev,
      [rowKey]: newUnit,
    }));

    setSaveMessage("");
  }

  async function saveChanges() {
    try {
      setSaving(true);
      setSaveMessage("");

      const rowsByKey = new Map<string, DailyReportRow>(
        rows.map((row) => [getRowKey(row), row]),
      );

      const statusEntries = Object.entries(pendingChanges);

      for (const [rowKey, status] of statusEntries) {
        const row = rowsByKey.get(rowKey);
        if (!row) continue;

        await axios.patch("http://localhost:3001/api/daily-reports/status", {
          sheetId: row.sheetId ?? id,
          reportDate: row.dailyReport?.reportDate ?? date,
          deviceNumber: row.deviceNumber,
          status,
        });
      }

      const unitEntries = Object.entries(pendingUnitChanges);

      for (const [rowKey, unit] of unitEntries) {
        const row = rowsByKey.get(rowKey);
        if (!row) continue;

        await axios.put(
          `http://localhost:3001/api/inventory-items/${row.inventoryItemId}`,
          { unit },
        );
      }

      setData((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          rows: prev.rows.map((row) => {
            const rowKey = getRowKey(row);
            const changedStatus = pendingChanges[rowKey];
            const changedUnit = pendingUnitChanges[rowKey];

            return {
              ...row,
              unit: changedUnit ?? row.unit,
              dailyReport: changedStatus
                ? {
                    ...row.dailyReport,
                    status: changedStatus,
                  }
                : row.dailyReport,
            };
          }),
        };
      });

      setPendingChanges({});
      setPendingUnitChanges({});
      setSaveMessage("השינויים נשמרו בהצלחה");
    } catch (error) {
      console.error("Failed to save changes", error);
      setSaveMessage("שמירת השינויים נכשלה");
    } finally {
      setSaving(false);
    }
  }

  const rows: DailyReportRow[] = data?.rows ?? [];

  const uniqueDeviceNames = Array.from(
    new Set(
      rows
        .map((row) => String(row.deviceName ?? "").trim())
        .filter((name) => name.length > 0),
    ),
  ) as string[];

  const uniqueUnits: string[] = Array.from(
    new Set([
      ...(data?.availableUnits ?? []),
      ...rows
        .map((row) => String(row.unit ?? "").trim())
        .filter((unit) => unit.length > 0),
    ]),
  ).sort((a, b) => a.localeCompare(b, "he"));

  function compareRowsBySortOption(
    a: DailyReportRow,
    b: DailyReportRow,
    sortOption: SortOption,
  ): number {
    if (!sortOption) return 0;

    const aDeviceNumber = Number(a.deviceNumber ?? 0);
    const bDeviceNumber = Number(b.deviceNumber ?? 0);

    const aDeviceName = String(a.deviceName ?? "").trim();
    const bDeviceName = String(b.deviceName ?? "").trim();

    const aSavedStatus = getSavedStatus(a);
    const bSavedStatus = getSavedStatus(b);

    switch (sortOption) {
      case "deviceNumberAsc":
        return aDeviceNumber - bDeviceNumber;

      case "deviceNumberDesc":
        return bDeviceNumber - aDeviceNumber;

      case "deviceNameAsc":
        return aDeviceName.localeCompare(bDeviceName, "he");

      case "deviceNameDesc":
        return bDeviceName.localeCompare(aDeviceName, "he");

      case "reportedFirst":
        if (aSavedStatus === bSavedStatus) return 0;
        return aSavedStatus === "reported" ? -1 : 1;

      case "notReportedFirst":
        if (aSavedStatus === bSavedStatus) return 0;
        return aSavedStatus === "not_reported" ? -1 : 1;

      default:
        return 0;
    }
  }

  const filteredAndSortedRows = useMemo(() => {
    const filteredRows = rows.filter((row) => {
      const rowDeviceNumber = String(row.deviceNumber ?? "").trim();
      const rowDeviceName = String(row.deviceName ?? "").trim();
      const savedStatus = getSavedStatus(row);

      const matchesDeviceNumber =
        searchDeviceNumber.trim() === "" ||
        rowDeviceNumber.includes(searchDeviceNumber.trim());

      const matchesDeviceName =
        filterDeviceName.trim() === "" ||
        rowDeviceName === filterDeviceName.trim();

      const matchesStatus =
        filterStatus === "all" || savedStatus === filterStatus;

      return matchesDeviceNumber && matchesDeviceName && matchesStatus;
    });

    const sortPriority: SortOption[] = [
      primarySort,
      secondarySort,
      thirdSort,
    ].filter(Boolean) as SortOption[];

    const sortedRows = [...filteredRows].sort((a, b) => {
      for (const sortOption of sortPriority) {
        const result = compareRowsBySortOption(a, b, sortOption);
        if (result !== 0) return result;
      }

      return 0;
    });

    return sortedRows;
  }, [
    rows,
    searchDeviceNumber,
    filterDeviceName,
    filterStatus,
    primarySort,
    secondarySort,
    thirdSort,
  ]);

  if (!data) {
    return (
      <div dir="rtl" style={{ padding: "20px" }}>
        טוען...
      </div>
    );
  }

  const hasPendingChanges =
    Object.keys(pendingChanges).length > 0 ||
    Object.keys(pendingUnitChanges).length > 0;

  return (
    <div dir="rtl" style={{ padding: "20px" }}>
      <button onClick={() => navigate(-1)}>חזור</button>

      <h1>{data.sheet.sheetName}</h1>
      <h3>📅 {data.reportDate}</h3>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="חיפוש לפי מספר מכשיר"
          value={searchDeviceNumber}
          onChange={(e) => setSearchDeviceNumber(e.target.value)}
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            minWidth: "220px",
          }}
        />

        <select
          value={filterDeviceName}
          onChange={(e) => setFilterDeviceName(e.target.value)}
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            minWidth: "220px",
          }}
        >
          <option value="">כל סוגי המכשירים</option>
          {uniqueDeviceNames.map((deviceName) => (
            <option key={deviceName} value={deviceName}>
              {deviceName}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            minWidth: "220px",
          }}
        >
          <option value="all">הכל</option>
          <option value="reported">דווח</option>
          <option value="not_reported">לא דווח</option>
        </select>

        <select
          value={primarySort}
          onChange={(e) => setPrimarySort(e.target.value as SortOption)}
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            minWidth: "220px",
          }}
        >
          <option value="">מיון ראשי</option>
          <option value="deviceNumberAsc">מספר מכשיר: מהקטן לגדול</option>
          <option value="deviceNumberDesc">מספר מכשיר: מהגדול לקטן</option>
          <option value="deviceNameAsc">שם מכשיר: א-ת</option>
          <option value="deviceNameDesc">שם מכשיר: ת-א</option>
          <option value="reportedFirst">דווח קודם</option>
          <option value="notReportedFirst">לא דווח קודם</option>
        </select>

        <select
          value={secondarySort}
          onChange={(e) => setSecondarySort(e.target.value as SortOption)}
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            minWidth: "220px",
          }}
        >
          <option value="">מיון משני</option>
          <option value="deviceNumberAsc">מספר מכשיר: מהקטן לגדול</option>
          <option value="deviceNumberDesc">מספר מכשיר: מהגדול לקטן</option>
          <option value="deviceNameAsc">שם מכשיר: א-ת</option>
          <option value="deviceNameDesc">שם מכשיר: ת-א</option>
          <option value="reportedFirst">דווח קודם</option>
          <option value="notReportedFirst">לא דווח קודם</option>
        </select>

        <select
          value={thirdSort}
          onChange={(e) => setThirdSort(e.target.value as SortOption)}
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            minWidth: "220px",
          }}
        >
          <option value="">מיון שלישי</option>
          <option value="deviceNumberAsc">מספר מכשיר: מהקטן לגדול</option>
          <option value="deviceNumberDesc">מספר מכשיר: מהגדול לקטן</option>
          <option value="deviceNameAsc">שם מכשיר: א-ת</option>
          <option value="deviceNameDesc">שם מכשיר: ת-א</option>
          <option value="reportedFirst">דווח קודם</option>
          <option value="notReportedFirst">לא דווח קודם</option>
        </select>

        <button
          type="button"
          onClick={() => {
            setSearchDeviceNumber("");
            setFilterDeviceName("");
            setFilterStatus("all");
            setPrimarySort("deviceNameAsc");
            setSecondarySort("deviceNumberDesc");
            setThirdSort("");
          }}
          style={{
            padding: "10px 16px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          נקה סינון
        </button>

        <button
          type="button"
          onClick={saveChanges}
          disabled={!hasPendingChanges || saving}
          style={{
            padding: "10px 16px",
            border: "none",
            borderRadius: "8px",
            cursor: !hasPendingChanges || saving ? "not-allowed" : "pointer",
            opacity: !hasPendingChanges || saving ? 0.6 : 1,
            fontWeight: "bold",
          }}
        >
          {saving ? "שומר..." : "שמור שינויים"}
        </button>

        {hasPendingChanges && !saving && (
          <span style={{ fontWeight: "bold" }}>יש שינויים שלא נשמרו</span>
        )}

        {saveMessage && (
          <span
            style={{
              fontWeight: "bold",
              color: saveMessage.includes("בהצלחה") ? "green" : "red",
            }}
          >
            {saveMessage}
          </span>
        )}
      </div>

      <TableContainer component={Paper} dir="rtl">
        <Table
          sx={{ minWidth: 650, tableLayout: "fixed" }}
          aria-label="daily report table"
        >
          <TableHead>
            <TableRow>
              <TableCell align="right" sx={{ fontWeight: "bold", width: 180 }}>
                מספר מכשיר
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", width: 220 }}>
                שם מכשיר
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", width: 220 }}>
                יחידה
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", width: 300 }}>
                דיווח
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredAndSortedRows.map((row) => {
              const rowKey = getRowKey(row);
              const savedStatus = getSavedStatus(row);
              const currentStatus = pendingChanges[rowKey] ?? savedStatus;
              const currentUnit = pendingUnitChanges[rowKey] ?? row.unit ?? "";
              const isChanged =
                savedStatus !== currentStatus ||
                currentUnit !== (row.unit ?? "");

              const unitName = getUnitName(row);
              const unitManagerName = getUnitManagerName(row);
              const location = getLocation(row);
              const assignedToName = getAssignedToName(row);
              const reportedBy = getReportedBy(row);
              const notes = getNotes(row);

              const tooltipContent = (
                <div dir="rtl" style={{ textAlign: "right", lineHeight: 1.8 }}>
                  <div>
                    <strong>יחידה:</strong> {currentUnit || unitName}
                  </div>
                  <div>
                    <strong>אחראי יחידה:</strong> {unitManagerName}
                  </div>
                  <div>
                    <strong>מיקום:</strong> {location}
                  </div>
                  <div>
                    <strong>משויך ל:</strong> {assignedToName}
                  </div>
                  <div>
                    <strong>דווח על ידי:</strong> {reportedBy}
                  </div>
                  <div>
                    <strong>הערות:</strong> {notes}
                  </div>
                </div>
              );

              return (
                <TableRow
                  key={rowKey}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    backgroundColor: isChanged ? "#fff8e1" : "inherit",
                  }}
                >
                  <TableCell
                    align="right"
                    component="th"
                    scope="row"
                    sx={{ direction: "ltr" }}
                  >
                    {row.deviceNumber}
                  </TableCell>

                  <TableCell align="right">{row.deviceName}</TableCell>

                  <TableCell align="right">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        alignItems: "flex-start",
                      }}
                    >
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <Select
                          value={currentUnit}
                          onChange={(e) =>
                            handleUnitChange(row, e.target.value as string)
                          }
                          displayEmpty
                          sx={{
                            borderRadius: "8px",
                            backgroundColor: "#fff",
                            height: "36px",
                            ".MuiSelect-select": {
                              py: "6px",
                              textAlign: "right",
                            },
                          }}
                        >
                          {uniqueUnits.map((unit) => (
                            <MenuItem key={unit} value={unit}>
                              {unit}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <Tooltip
                        title={tooltipContent}
                        arrow
                        placement="top"
                        slotProps={{
                          tooltip: {
                            sx: {
                              backgroundColor: "#1f2937",
                              color: "#fff",
                              fontSize: "0.9rem",
                              padding: "10px 14px",
                              borderRadius: "10px",
                              maxWidth: 360,
                            },
                          },
                        }}
                      >
                        <span
                          style={{
                            cursor: "help",
                            textDecoration: "underline dotted",
                            textUnderlineOffset: "3px",
                          }}
                        >
                          {currentUnit || unitName}
                        </span>
                      </Tooltip>
                    </div>
                  </TableCell>

                  <TableCell align="right">
                    <div
                      style={{
                        width: "226px",
                        minWidth: "226px",
                        maxWidth: "226px",
                        display: "inline-block",
                      }}
                    >
                      <ToggleButtonGroup
                        exclusive
                        value={currentStatus}
                        onChange={(_, newValue) => {
                          if (!newValue) return;
                          handleStatusChange(row, newValue as ReportStatus);
                        }}
                        size="small"
                        sx={{
                          width: "226px",
                          minWidth: "226px",
                          maxWidth: "226px",
                          height: "40px",
                          display: "flex",
                          flexDirection: "row",
                          flexWrap: "nowrap",
                          direction: "rtl",
                          verticalAlign: "middle",
                          border: "1px solid #d0d7de",
                          borderRadius: "12px",
                          overflow: "hidden",
                          backgroundColor: "#fff",
                          boxSizing: "border-box",
                          "& .MuiToggleButtonGroup-grouped": {
                            margin: 0,
                            border: 0,
                            borderRadius: "0 !important",
                          },
                        }}
                      >
                        <ToggleButton
                          value="reported"
                          disableRipple
                          sx={{
                            flex: "1 1 0",
                            minWidth: 0,
                            width: "113px",
                            height: "40px",
                            margin: 0,
                            padding: "0 12px",
                            gap: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            whiteSpace: "nowrap",
                            fontWeight: 600,
                            lineHeight: 1,
                            boxSizing: "border-box",
                            color:
                              currentStatus === "reported"
                                ? "#fff"
                                : "rgba(46, 125, 50, 0.45)",
                            backgroundColor:
                              currentStatus === "reported"
                                ? "#2e7d32"
                                : "#f5f5f5",
                            borderLeft: "1px solid #e5e7eb",
                            transform: "none",
                            opacity: currentStatus === "reported" ? 1 : 0.7,
                            "& svg": {
                              opacity: currentStatus === "reported" ? 1 : 0.55,
                            },
                            "&:hover": {
                              backgroundColor:
                                currentStatus === "reported"
                                  ? "#27662b"
                                  : "#eeeeee",
                              transform: "none",
                            },
                            "&.Mui-selected": {
                              color: "#fff",
                              backgroundColor: "#2e7d32",
                              borderLeft: "1px solid #e5e7eb",
                              opacity: 1,
                            },
                            "&.Mui-selected svg": {
                              opacity: 1,
                            },
                            "&.Mui-selected:hover": {
                              backgroundColor: "#27662b",
                            },
                            "&.Mui-focusVisible": {
                              outline: "none",
                            },
                          }}
                        >
                          <CheckCircleIcon fontSize="small" />
                          דווח
                        </ToggleButton>

                        <ToggleButton
                          value="not_reported"
                          disableRipple
                          sx={{
                            flex: "1 1 0",
                            minWidth: 0,
                            width: "113px",
                            height: "40px",
                            margin: 0,
                            padding: "0 12px",
                            gap: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            whiteSpace: "nowrap",
                            fontWeight: 600,
                            lineHeight: 1,
                            boxSizing: "border-box",
                            color:
                              currentStatus === "not_reported"
                                ? "#fff"
                                : "rgba(211, 47, 47, 0.45)",
                            backgroundColor:
                              currentStatus === "not_reported"
                                ? "#d32f2f"
                                : "#f5f5f5",
                            borderLeft: "1px solid #e5e7eb",
                            transform: "none",
                            opacity: currentStatus === "not_reported" ? 1 : 0.7,
                            "& svg": {
                              opacity:
                                currentStatus === "not_reported" ? 1 : 0.55,
                            },
                            "&:hover": {
                              backgroundColor:
                                currentStatus === "not_reported"
                                  ? "#b71c1c"
                                  : "#eeeeee",
                              transform: "none",
                            },
                            "&.Mui-selected": {
                              color: "#fff",
                              backgroundColor: "#d32f2f",
                              borderLeft: "1px solid #e5e7eb",
                              opacity: 1,
                            },
                            "&.Mui-selected svg": {
                              opacity: 1,
                            },
                            "&.Mui-selected:hover": {
                              backgroundColor: "#b71c1c",
                            },
                            "&.Mui-focusVisible": {
                              outline: "none",
                            },
                          }}
                        >
                          <CancelIcon fontSize="small" />
                          לא דווח
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default DailyReportDetailsPage;
