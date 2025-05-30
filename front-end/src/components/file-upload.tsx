import React, { useState, type ChangeEvent, type JSX } from "react";
import { parseData } from "../utility/parseData";
import { useMergeData } from "../hooks/useMergeData";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function FileUpload(): JSX.Element {
  const [crimeContent, setCrimeContent] = useState<string>("");
  const [unemploymentContent, setUnemploymentContent] = useState<string>("");

  const { mutate, isPending } = useMergeData();

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    setContent: (text: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setContent(event.target?.result as string);
    reader.readAsText(file);
  };

  const handleGenerateChart = () => {
    if (!crimeContent.trim() || !unemploymentContent.trim()) {
      toast.error("Both Crime and Unemployment data must be provided.");
      return;
    }

    const crime = parseData(crimeContent);
    const unemployment = parseData(unemploymentContent);
  

    if (!crime.records?.length || !unemployment.records?.length) {
      toast.error(
        "Parsed data is invalid or empty. Please check input formats."
      );
      return;
    }

    const output = { crime, unemployment };

    mutate(output, {
      onSuccess: () => toast.success("Data merged successfully!"),
      onError: () =>
        toast.error("Failed to merge data. Please check the input."),
    });

    // // Optional: Save input file
    // const blob = new Blob([JSON.stringify(output, null, 2)], {
    //   type: "application/json",
    // });
    // saveAs(blob, "merged-input-data.json");
  };

  return (
    <div className="bg-gray-100 p-6">
      <ToastContainer position="bottom-left" />
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
              onChange={(e) => handleFileChange(e, setCrimeContent)}
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
              onChange={(e) => handleFileChange(e, setUnemploymentContent)}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Generate Chart Button */}
      <div className="mt-10 flex justify-center">
        <button
          onClick={handleGenerateChart}
          disabled={isPending}
          className={`${
            isPending
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white px-6 py-3 rounded text-lg`}
        >
          {isPending ? "Processing..." : "Generate Chart"}
        </button>
      </div>
    </div>
  );
}
