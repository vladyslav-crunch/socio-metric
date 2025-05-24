import { useUser } from "../hooks/useUser";

export default function Navbar() {
  const { data: user, isLoading, isError } = useUser();
  if (isLoading) return <div>Loading user...</div>;
  if (isError || !user) return <div>Error loading user info.</div>;

  return (
    <div className="flex justify-between items-center   px-6 py-4">
      <h1 className="text-xl font-bold text-blue-700">Socio Metric</h1>
      {isLoading ? (
        <p>Loading user...</p>
      ) : isError || !user ? (
        <p className="text-red-600">Error loading user info.</p>
      ) : (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">Welcome, {user.name}!</span>
          <button
            onClick={() => {}}
            className="text-sm text-white bg-red-500 hover:bg-red-600 px-4 py-1 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
