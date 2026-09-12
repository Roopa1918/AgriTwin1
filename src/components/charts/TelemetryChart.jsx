// AgriTwin — Reusable Telemetry Time-Series Chart with Chart.js
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TelemetryChart({
  title,
  labels = [],
  datasets = [],
  yAxisLabel = '%',
  min = undefined,
  max = undefined,
  height = 240
}) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { family: "'Inter', sans-serif", size: 11, weight: '500' },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 14
        }
      },
      title: {
        display: !!title,
        text: title,
        color: '#f8fafc',
        font: { family: "'Outfit', sans-serif", size: 14, weight: '700' },
        padding: { bottom: 12 }
      },
      tooltip: {
        backgroundColor: '#0c1813',
        borderColor: 'rgba(16, 185, 129, 0.4)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        padding: 10,
        boxPadding: 4,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#64748b',
          font: { family: "'JetBrains Mono', monospace", size: 10 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8
        }
      },
      y: {
        min,
        max,
        grid: {
          color: 'rgba(255, 255, 255, 0.06)',
          drawBorder: false
        },
        ticks: {
          color: '#94a3b8',
          font: { family: "'Inter', sans-serif", size: 11 },
          callback: (value) => `${value} ${yAxisLabel}`
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };

  const chartData = {
    labels: labels.length > 0 ? labels : ['0s', '3s', '6s', '9s', '12s'],
    datasets
  };

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
