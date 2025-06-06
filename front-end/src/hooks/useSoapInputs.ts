import { useQuery } from "@tanstack/react-query";

const SOAP_URL = "http://localhost:3000/soap/getData";

const transformSoapToStructuredXml = async (
  soapXml: string
): Promise<string> => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(soapXml, "text/xml");

  const records = xmlDoc.getElementsByTagName("records");
  if (!records || records.length === 0) {
    return ""; 
  }

  const root = document.implementation.createDocument("", "root", null);
  let hasAtLeastOneEntry = false;

  Array.from(records).forEach((record) => {
    const entry = root.createElement("entry");

    const fields = [
      "country_name",
      "country_code",
      "year",
      "crime_rate",
      "unemployment_rate",
    ];

    let hasData = false;
    fields.forEach((tag) => {
      const el = record.getElementsByTagName(tag)[0];
      if (el) {
        hasData = true;
        const child = root.createElement(tag);
        child.textContent = el.textContent;
        entry.appendChild(child);
      }
    });

    if (hasData) {
      root.documentElement.appendChild(entry);
      hasAtLeastOneEntry = true;
    }
  });

  if (!hasAtLeastOneEntry) {
    return ""; 
  }

  const serializer = new XMLSerializer();
  const xmlContent = serializer.serializeToString(root);

  return `<?xml version="1.0"?>\n${xmlContent}`;
};

const buildEnvelope = (
  method: "getCrimeData" | "getUnemploymentData",
  token: string
): string =>
  `
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                    xmlns:tns="http://example.com/getData">
    <soapenv:Header/>
    <soapenv:Body>
      <tns:${method}>
        <token>${token}</token>
      </tns:${method}>
    </soapenv:Body>
  </soapenv:Envelope>
`.trim();

const fetchSoapData = async (
  method: "getCrimeData" | "getUnemploymentData"
): Promise<string> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token not found");

  const response = await fetch(SOAP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml;charset=UTF-8",
      SOAPAction: method,
    },
    body: buildEnvelope(method, token),
  });

  if (!response.ok) throw new Error(`Failed to fetch ${method}`);

  return await response.text(); // return raw XML
};

export const useSoapInputs = () => {
  const crimeQuery = useQuery({
    queryKey: ["soap", "crime"],
    queryFn: async () => {
      const rawXml = await fetchSoapData("getCrimeData");
      return transformSoapToStructuredXml(rawXml); // Transformed XML
    },
  });

  const unemploymentQuery = useQuery({
    queryKey: ["soap", "unemployment"],
    queryFn: async () => {
      const rawXml = await fetchSoapData("getUnemploymentData");
      return transformSoapToStructuredXml(rawXml);
    },
  });

  return {
    crimeContent: crimeQuery.data,
    unemploymentContent: unemploymentQuery.data,
    isLoading: crimeQuery.isLoading || unemploymentQuery.isLoading,
    error: crimeQuery.error || unemploymentQuery.error,
  };
};
