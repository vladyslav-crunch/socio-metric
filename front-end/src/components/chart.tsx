import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Label,
} from "recharts";

type DataItem = {
  country: string;
  unemployment: number;
  crime: number;
};

type Props = {
  data: DataItem[];
};

export default function UnemploymentCrimeChart({ data }: Props) {
  return (
    <ResponsiveContainer width="80%" height={500}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 60 }}>
        <CartesianGrid />
        <XAxis type="number" dataKey="crime" name="Crime Rate">
          <Label
            value="Crime Rate (per 100k people)"
            position="bottom"
            offset={0}
          />
        </XAxis>
        <YAxis
          type="number"
          dataKey="unemployment"
          name="Unemployment Rate"
          unit="%"
        >
          <Label
            value="Unemployment Rate (%)"
            angle={-90}
            position="insideLeft"
            style={{ textAnchor: "middle" }}
          />
        </YAxis>
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Scatter name="Countries" data={data} fill="#8884d8">
          <LabelList dataKey="country" position="top" />
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
