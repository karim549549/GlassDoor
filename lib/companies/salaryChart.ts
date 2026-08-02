import type { Role } from "./types";

export interface SalaryChartPoint {
  label: string;
  value: number;
}

export interface SalaryChartGeometry {
  width: number;
  height: number;
  padding: number;
  dataPoints: SalaryChartPoint[];
  pathD: string;
  getX: (index: number) => number;
  getY: (value: number) => number;
}

const CHART_WIDTH = 600;
const CHART_HEIGHT = 280;
const CHART_PADDING = 40;

/**
 * Derives the SVG geometry (grid coordinates + trend path) for the salary
 * benchmark line chart from a role's min/max/median figures.
 */
export function buildSalaryChartGeometry(
  role: Pick<Role, "min" | "max" | "median">
): SalaryChartGeometry {
  const minSal = role.min;
  const maxSal = role.max;
  const medianSal = role.median;

  const dataPoints: SalaryChartPoint[] = [
    { label: "2024 Q1", value: minSal + (medianSal - minSal) * 0.3 },
    { label: "2024 Q2", value: medianSal - (medianSal - minSal) * 0.1 },
    { label: "2024 Q3", value: medianSal + (maxSal - medianSal) * 0.25 },
    { label: "2024 Q4", value: maxSal },
  ];

  const minVal = minSal * 0.8;
  const maxVal = maxSal * 1.1;

  const getX = (index: number) =>
    CHART_PADDING + (index * (CHART_WIDTH - CHART_PADDING * 2)) / (dataPoints.length - 1);

  const getY = (value: number) => {
    const scale = (CHART_HEIGHT - CHART_PADDING * 2) / (maxVal - minVal);
    return CHART_HEIGHT - CHART_PADDING - (value - minVal) * scale;
  };

  const pathD = dataPoints.reduce((acc, pt, idx) => {
    const x = getX(idx);
    const y = getY(pt.value);
    return acc + `${idx === 0 ? "M" : "L"} ${x} ${y}`;
  }, "");

  return {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    padding: CHART_PADDING,
    dataPoints,
    pathD,
    getX,
    getY,
  };
}
