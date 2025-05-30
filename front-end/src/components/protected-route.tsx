import { Navigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import type { JSX } from "react";

type Props = {
  children: JSX.Element;
};

export default function ProtectedRoute({ children }: Props) {
  const { data, isLoading, isError } = useUser();
  if (isLoading) return <div></div>;
  if (isError || !data) return <Navigate to="/sign-in" />;

  return children;
}
