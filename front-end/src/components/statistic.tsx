import React, { useEffect, useState } from "react";
import { useMergedData } from "../hooks/useMergeData";
import UnemploymentCrimeChart from "./chart";
import { XMLBuilder } from "fast-xml-parser";
import { saveAs } from "file-saver";
import { useSoapMerge } from "../hooks/useSoapMerge";

export default function Statistic() {
  const { data: mergedData } = useMergedData();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const { mutate: fetchSoapData } = useSoapMerge();

  useEffect(() => {
    fetchSoapData(); // Auto fetch on mount
  }, []);

  const availableYears = mergedData
    ? Object.keys(mergedData)
        .map(Number)
        .sort((a, b) => a - b)
    : [];

  useEffect(() => {
    if (mergedData && availableYears.length > 0) {
      setSelectedYear(availableYears[availableYears.length - 1]);
    }
  }, [mergedData]);

  const filteredData =
    selectedYear !== null && mergedData ? mergedData[selectedYear] ?? [] : [];

  const avgCrime =
    filteredData.length > 0
      ? (
          filteredData.reduce((sum, item) => sum + item.crime, 0) /
          filteredData.length
        ).toFixed(2)
      : "N/A";

  const avgUnemployment =
    filteredData.length > 0
      ? (
          filteredData.reduce((sum, item) => sum + item.unemployment, 0) /
          filteredData.length
        ).toFixed(2)
      : "N/A";

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(filteredData, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, `data-${selectedYear}.json`);
  };

  const handleExportXML = () => {
    const builder = new XMLBuilder({ format: true });
    const xml = builder.build({ record: filteredData });
    const blob = new Blob([xml], { type: "application/xml" });
    saveAs(blob, `data-${selectedYear}.xml`);
  };

  return (
    <div className="bg-white shadow m-6 p-10 rounded-xl flex flex-col items-center min-h-[500px]">
      <div className="mb-4">
        <label className="mr-2 font-medium">Select Year:</label>
        <select
          value={selectedYear ?? ""}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border p-1 rounded"
          disabled={!mergedData}
        >
          <option value="" disabled>
            {mergedData ? "Choose year" : "No data yet"}
          </option>
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {selectedYear !== null && filteredData.length > 0 ? (
        <>
          <UnemploymentCrimeChart data={filteredData} />

          <div className="w-80% grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
            {/* Summary Cards */}
            <div className="col-span-1 flex  gap-4">
              <div className="bg-blue-50 border border-blue-200 shadow-sm p-4 rounded-lg text-center">
                <h3 className="text-sm font-semibold text-blue-700 mb-1">
                  Avg. Crime Rate
                </h3>
                <p className="text-2xl font-bold text-blue-800">{avgCrime}</p>
              </div>
              <div className="bg-green-50 border border-green-200 shadow-sm p-4 rounded-lg text-center">
                <h3 className="text-sm font-semibold text-green-700 mb-1">
                  Avg. Unemployment
                </h3>
                <p className="text-2xl font-bold text-green-800">
                  {avgUnemployment}%
                </p>
              </div>
            </div>

            {/* Spacer (for layout symmetry on large screens) */}
            <div className="hidden md:block" />

            {/* Export Buttons */}
            <div className="col-span-1 flex flex-col  justify-center gap-4">
              <button
                onClick={handleExportJSON}
                className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              >
                Export as JSON
              </button>
              <button
                onClick={handleExportXML}
                className="w-full md:w-auto bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
              >
                Export as XML
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-90 text-gray-400 text-center">
          No chart available. Please upload data and generate a chart.
        </div>
      )}
    </div>
  );
}
