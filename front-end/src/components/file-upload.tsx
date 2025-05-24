import React, { useState, ChangeEvent } from "react";
import UnemploymentCrimeChart from "./chart";

export default function FileUpload(): JSX.Element {
  const [crimeFile, setCrimeFile] = useState<File | null>(null);
  const [unemploymentFile, setUnemploymentFile] = useState<File | null>(null);
  const [crimeContent, setCrimeContent] = useState<string>("");
  const [unemploymentContent, setUnemploymentContent] = useState<string>("");

  const handleCrimeFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCrimeFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setCrimeContent(event.target?.result as string);
    reader.readAsText(file);
  };

  const handleUnemploymentFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUnemploymentFile(file);
    const reader = new FileReader();
    reader.onload = (event) =>
      setUnemploymentContent(event.target?.result as string);
    reader.readAsText(file);
  };

  const handleGenerateChart = () => {
    console.log("Generating chart...");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Crime Rate Section */}
        <div className="bg-white shadow p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Crime Rate</h2>
          <p className="text-sm text-gray-500 mb-2">
            Paste JSON or XML data in the box below, or import a file.
          </p>
          <textarea
            className="w-full h-32 p-2 border rounded mb-4"
            placeholder="Paste JSON or XML data here..."
            value={crimeContent}
            onChange={(e) => setCrimeContent(e.target.value)}
          />
          <label className="block w-full cursor-pointer bg-gray-200 text-center py-2 rounded hover:bg-gray-300">
            Choose Crime File (JSON or XML)
            <input
              type="file"
              accept=".json,.xml"
              onChange={handleCrimeFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Unemployment Rate Section */}
        <div className="bg-white shadow p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Unemployment Rate</h2>
          <p className="text-sm text-gray-500 mb-2">
            Paste JSON or XML data in the box below, or import a file.
          </p>
          <textarea
            className="w-full h-32 p-2 border rounded mb-4"
            placeholder="Paste JSON or XML data here..."
            value={unemploymentContent}
            onChange={(e) => setUnemploymentContent(e.target.value)}
          />
          <label className="block w-full cursor-pointer bg-gray-200 text-center py-2 rounded hover:bg-gray-300">
            Choose Unemployment File (JSON or XML)
            <input
              type="file"
              accept=".json,.xml"
              onChange={handleUnemploymentFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Generate Chart Button */}
      <div className="mt-10 flex justify-center">
        <button
          onClick={handleGenerateChart}
          className="bg-blue-600 text-white px-6 py-3 rounded text-lg hover:bg-blue-700"
        >
          Generate Chart
        </button>
      </div>
      <UnemploymentCrimeChart />
    </div>
  );
}
