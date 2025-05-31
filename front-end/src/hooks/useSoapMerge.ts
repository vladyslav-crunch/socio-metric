import { useQueryClient, useMutation } from "@tanstack/react-query";
import { XMLParser } from "fast-xml-parser";

type SoapMergedRecord = {
  country: string;
  country_code: string;
  year: number;
  crime_rate: number;
  unemployment_rate: number;
};

type MergedDataByYear = {
  [year: number]: {
    country: string;
    crime: number;
    unemployment: number;
  }[];
};

export const useSoapMerge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found");

      const soapBody = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                          xmlns:tns="http://example.com/getData">
          <soapenv:Header/>
          <soapenv:Body>
            <tns:getMergedData>
              <token>${token}</token>
            </tns:getMergedData>
          </soapenv:Body>
        </soapenv:Envelope>
      `.trim();

      const response = await fetch("http://localhost:3000/soap/getData", {
        method: "POST",
        headers: {
          "Content-Type": "text/xml;charset=UTF-8",
          SOAPAction: "getMergedData",
        },
        body: soapBody,
      });

      const xml = await response.text();
      const parser = new XMLParser();
      const parsed = parser.parse(xml);

      const records =
        parsed?.["soap:Envelope"]?.["soap:Body"]?.["tns:getMergedDataResponse"]
          ?.records;

      const dataArray: SoapMergedRecord[] = Array.isArray(records)
        ? records
        : [records]; // Handle single record case

      const mergedData: MergedDataByYear = {};

      for (const rec of dataArray) {
        const year = Number(rec.year);
        if (!mergedData[year]) mergedData[year] = [];
        mergedData[year].push({
          country: rec.country,
          crime: rec.crime_rate,
          unemployment: rec.unemployment_rate,
        });
      }

      return mergedData;
    },
    onSuccess: (data) => {
      // Cache under the same key used by useMergedData
      queryClient.setQueryData(["mergedData"], data);
    },
  });
};
