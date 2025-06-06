import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface RecordItem {
  country: string;
  year: number;
  value: number;
}

interface ParsedInput {
  crime: {
    format: string;
    records: RecordItem[];
  };
  unemployment: {
    format: string;
    records: RecordItem[];
  };
}

type MergedDataByYear = {
  [year: number]: {
    country: string;
    crime: number;
    unemployment: number;
  }[];
};

export const useMergeData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ParsedInput) => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/comparison/merge-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to merge data");

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["mergedData"], data);
    },
  });
};

export const useMergedData = () =>
  useQuery<MergedDataByYear>({
    queryKey: ["mergedData"],
    queryFn: () => {
      throw new Error("UseMutation sets this — no need to refetch");
    },
    enabled: false,
  });
