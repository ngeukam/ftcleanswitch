import * as React from "react";
import ReactECharts from "echarts-for-react";
import Title from "../../components/Title";

interface BarChartProps {
  data: {
    name: string;
    guests: number;
  }[];
}

export default function BarChart({ data }: BarChartProps) {
  // Extract days of the week and guest counts from the data prop
  const xAxisData = data.map((item) => item.name);
  const seriesData = data.map((item) => item.guests);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: xAxisData, // Use dynamic data for the x-axis
        axisTick: {
          alignWithLabel: true,
        },
      },
    ],
    yAxis: [
      {
        type: "value",
      },
    ],
    series: [
      {
        name: "Guests",
        type: "bar",
        barWidth: "60%",
        data: seriesData, // Use dynamic data for the series
      },
    ],
  };

  return (
    <React.Fragment>
      <Title>Guests per Day (Current Week)</Title>
      <ReactECharts option={option} />
    </React.Fragment>
  );
}