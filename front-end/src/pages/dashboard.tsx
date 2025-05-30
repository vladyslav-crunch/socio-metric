import FileUpload from "../components/file-upload";
import Navbar from "../components/navbar";
import Statistic from "../components/statistic";

export default function Dashboard() {
  return (
    <div>
      <Navbar />
      <div className="p-4 bg-gray-100 p-6 min-h-screen">
        <FileUpload />
        <Statistic />
      </div>
    </div>
  );
}
