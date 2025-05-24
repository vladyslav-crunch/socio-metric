import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const data = [
  { country: "USA", unemployment: 6.0, crime: 47.7 },
  { country: "Canada", unemployment: 5.2, crime: 39.1 },
  { country: "Germany", unemployment: 4.5, crime: 34.2 },
  { country: "UK", unemployment: 4.8, crime: 40.3 },
  { country: "France", unemployment: 7.1, crime: 36.5 },
  { country: "Japan", unemployment: 2.9, crime: 21.8 },
  { country: "India", unemployment: 7.2, crime: 44.6 },
  { country: "Brazil", unemployment: 8.9, crime: 60.3 },
  { country: "Australia", unemployment: 4.2, crime: 37.8 },
  { country: "South Africa", unemployment: 9.0, crime: 75.5 },
];

export default function UnemploymentCrimeChart() {
  return (
    <ResponsiveContainer width="80%" height={500}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid />
        <XAxis type="number" dataKey="crime" name="Crime Rate" unit="" />
        <YAxis
          type="number"
          dataKey="unemployment"
          name="Unemployment Rate"
          unit="%"
        />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Scatter name="Countries" data={data} fill="#8884d8">
          <LabelList dataKey="country" position="top" />
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
