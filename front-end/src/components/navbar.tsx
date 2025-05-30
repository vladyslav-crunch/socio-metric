import { useLogout, useUser } from "../hooks/useUser";

export default function Navbar() {
  const { data: user, isLoading, isError } = useUser();
  const { mutate: logout } = useLogout();
  if (isLoading) return <div>Loading user...</div>;
  if (isError || !user) return <div>Error loading user info.</div>;

  return (
    <div className="flex justify-between items-center   px-6 py-4">
      <h1 className="text-xl font-bold text-gray-700 flex items-center">
        <img width={"60px"} src="/images/logo.png" alt="logo" />
        Socio Metric
      </h1>
      {isLoading ? (
        <p>Loading user...</p>
      ) : isError || !user ? (
        <p className="text-red-600">Error loading user info.</p>
      ) : (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">Welcome, {user.name}!</span>
          <button
            onClick={() => {
              logout();
            }}
            className="text-sm text-white bg-red-400 hover:bg-red-600 px-4 py-1 rounded cursor-pointer"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
