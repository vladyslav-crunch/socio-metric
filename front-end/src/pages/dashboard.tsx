import FileUpload from "../components/file-upload";
import Navbar from "../components/navbar";

export default function Dashboard() {
  return (
    <div className="p-4">
      <Navbar />
      <FileUpload />
    </div>
  );
}
