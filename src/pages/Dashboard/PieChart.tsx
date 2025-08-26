import * as React from "react";
import Title from "../../components/Title";
import ReactECharts from "echarts-for-react";

interface PieChartProps {
  data: {
    value: number;
    name: string;
  }[];
}

export default function PieChart({ data }: PieChartProps) {
  const option = {
    tooltip: {
      trigger: "item",
    },
    legend: {
      top: "5%",
      left: "center",
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: data, // Use the data prop here
      },
    ],
  };

  return (
    <React.Fragment>
      <Title>Guests Summary this month</Title>
      <ReactECharts option={option} />
    </React.Fragment>
  );
}