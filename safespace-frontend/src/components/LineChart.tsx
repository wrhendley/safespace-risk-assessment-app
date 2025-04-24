import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const option1Colors = [
    '#6fb3d4', // Primary - blue
    '#6f7ec3', // Secondary - periwinkle
    '#367c74', // Deep teal
    '#c97a41', // Coral
    '#B46FC3', // Lavender
    '#5a90a4', // Slate blue
    '#a33f3f', // Deep plum
    '#8799a0', // Light gray
];



const data = {
labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
datasets: [
    {
    label: "Series 1",
    data: [3, 4, 3.5, 4.5, 5, 4.8, 4.9],
    fill: false,
    borderColor: option1Colors[0],
    backgroundColor: option1Colors[0],
    tension: 0.4,
    },
    {
    label: "Series 2",
    data: [2.5, 3, 3.5, 3, 4, 4.2, 4.5],
    fill: false,
    borderColor: option1Colors[1], 
    backgroundColor: option1Colors[1],
    tension: 0.4,
    },
    {
    label: "Series 3",
    data: [3, 3.2, 3.8, 4.1, 3.9, 4.3, 4.6],
    fill: false,
    borderColor: option1Colors[2],
    backgroundColor: option1Colors[2],
    tension: 0.4,
    },
    {
    label: "Series 4",
    data: [1.5, 2, 2.5, 3.5, 4.5, 4.8, 4.9],
    fill: false,
    borderColor: option1Colors[3],
    backgroundColor: option1Colors[3],
    tension: 0.4,
    },
    {
    label: "Series 5",
    data: [2.9, 1, 1.5, 2, 1.5, 5.2, 3.5],
    fill: false,
    borderColor: option1Colors[4], 
    backgroundColor: option1Colors[4],
    tension: 0.4,
    },
    {
    label: "Series 6",
    data: [.5, 1.2, 2.8, 3.1, 2.9, 1.3, 1.6],
    fill: false,
    borderColor: option1Colors[5],
    backgroundColor: option1Colors[5],
    tension: 0.4,
    },
    {
    label: "Series 7",
    data: [.3, .32, .38, .41, .39, .43, .46],
    fill: false,
    borderColor: option1Colors[6],
    backgroundColor: option1Colors[6],
    tension: 0.4,
    },
],
};

const options = {
responsive: true,
plugins: {
    legend: {
    labels: {
        color: option1Colors[7], 
    },
    },
},
scales: {
    x: {
    ticks: { color: option1Colors[7]},
    grid: { color: "#e8e8e8" },
    },
    y: {
    ticks: { color: option1Colors[7]},
    grid: { color: "#e8e8e8" },
    suggestedMin: 0,
    suggestedMax: 5.5,
    },
},
};

export default function LineChartOption2() {
    return <Line data={data} options={options} />;
}