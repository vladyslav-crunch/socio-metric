import { useState, type ChangeEvent, type JSX, useEffect } from "react";
import { parseData } from "../utility/parseData";
import { useMergeData } from "../hooks/useMergeData";
import { toast, ToastContainer } from "react-toastify";
import { useSoapInputs } from "../hooks/useSoapInputs";
import "react-toastify/dist/ReactToastify.css";

export default function FileUpload(): JSX.Element {
  const [crimeInput, setCrimeInput] = useState<string>("");
  const [unemploymentInput, setUnemploymentInput] = useState<string>("");

  const { crimeContent, unemploymentContent, isLoading, error } =
    useSoapInputs();
  const { mutate, isPending } = useMergeData();

  useEffect(() => {
    if (crimeContent) setCrimeInput(crimeContent);
  }, [crimeContent]);

  useEffect(() => {
    if (unemploymentContent) setUnemploymentInput(unemploymentContent);
  }, [unemploymentContent]);

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
    if (!crimeInput.trim() || !unemploymentInput.trim()) {
      toast.error("Both Crime and Unemployment data must be provided.");
      return;
    }

    const crime = parseData(crimeInput);
    const unemployment = parseData(unemploymentInput);

    if (!crime.records?.length || !unemployment.records?.length) {
      toast.error(
        "Parsed data is invalid or empty. Please check input formats."
      );
      return;
    }

    mutate(
      { crime, unemployment },
      {
        onSuccess: () => toast.success("Data merged successfully!"),
        onError: () =>
          toast.error("Failed to merge data. Please check the input."),
      }
    );
  };

  return (
    <div className="bg-gray-100 p-6">
      <ToastContainer position="bottom-left" />

      {isLoading && (
        <p className="text-center text-gray-600 mb-4">Fetching SOAP data...</p>
      )}
      {error && (
        <p className="text-center text-red-500 mb-4">
          Failed to fetch data from SOAP API
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white shadow p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Crime Rate</h2>
          <p className="text-sm text-gray-500 mb-2">
            Paste JSON or XML data in the box below, or import a file.
          </p>

          <textarea
            className="w-full h-32 p-2 border rounded mb-4"
            value={crimeInput}
            onChange={(e) => setCrimeInput(e.target.value)}
            placeholder="Paste or auto-filled crime data"
          />
          <label className="block cursor-pointer bg-gray-200 text-center py-2 rounded hover:bg-gray-300">
            Choose Crime File (JSON or XML)
            <input
              type="file"
              accept=".json,.xml"
              onChange={(e) => handleFileChange(e, setCrimeInput)}
              className="hidden"
            />
          </label>
        </div>

        <div className="bg-white shadow p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Unemployment Rate</h2>
          <p className="text-sm text-gray-500 mb-2">
            Paste JSON or XML data in the box below, or import a file.
          </p>
          <textarea
            className="w-full h-32 p-2 border rounded mb-4"
            value={unemploymentInput}
            onChange={(e) => setUnemploymentInput(e.target.value)}
            placeholder="Paste or auto-filled unemployment data"
          />
          <label className="block cursor-pointer bg-gray-200 text-center py-2 rounded hover:bg-gray-300">
            Choose Unemployment File (JSON or XML)
            <input
              type="file"
              accept=".json,.xml"
              onChange={(e) => handleFileChange(e, setUnemploymentInput)}
              className="hidden"
            />
          </label>
        </div>
      </div>

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
