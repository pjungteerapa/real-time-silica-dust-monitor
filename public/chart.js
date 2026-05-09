const ctx = document.getElementById('dustChart');
const chartSubtitle = document.getElementById('chartSubtitle');

//Data
const chartDataByRange = {
  5: {
    labels: ['10:00', '10:01', '10:02', '10:03', '10:04'],
    pm10: [32, 38, 45, 52, 48],
    threshold: [50, 50, 50, 50, 50]
  },

  10: {
    labels: ['09:55', '09:56', '09:57', '09:58', '09:59', '10:00', '10:01', '10:02', '10:03', '10:04'],
    pm10: [28, 31, 35, 42, 48, 55, 62, 58, 72, 85],
    threshold: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50]
  },

  15: {
    labels: ['09:50', '09:51', '09:52', '09:53', '09:54', '09:55', '09:56', '09:57', '09:58', '09:59', '10:00', '10:01', '10:02', '10:03', '10:04'],
    pm10: [22, 25, 27, 30, 29, 34, 38, 43, 47, 51, 56, 60, 66, 73, 85],
    threshold: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50]
  },

  30: {
    labels: [
      '09:35', '09:36', '09:37', '09:38', '09:39',
      '09:40', '09:41', '09:42', '09:43', '09:44',
      '09:45', '09:46', '09:47', '09:48', '09:49',
      '09:50', '09:51', '09:52', '09:53', '09:54',
      '09:55', '09:56', '09:57', '09:58', '09:59',
      '10:00', '10:01', '10:02', '10:03', '10:04'
    ],
    pm10: [
      20, 21, 24, 26, 25,
      28, 30, 29, 31, 35,
      38, 37, 40, 44, 42,
      46, 49, 53, 57, 55,
      60, 64, 68, 72, 70,
      76, 80, 78, 82, 85
    ],
    threshold: [
      50, 50, 50, 50, 50,
      50, 50, 50, 50, 50,
      50, 50, 50, 50, 50,
      50, 50, 50, 50, 50,
      50, 50, 50, 50, 50,
      50, 50, 50, 50, 50
    ]
  }
};


//chart setting
const dustChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: chartDataByRange[10].labels,
    datasets: [
      {
        label: 'PM10 µg/m³',
        data: chartDataByRange[10].pm10,
        borderWidth: 3,
        tension: 0.35,
        pointRadius: 4
      },
      {
        label: 'Safety Threshold',
        data: chartDataByRange[10].threshold,
        borderWidth: 2,
        borderDash: [8, 6],
        pointRadius: 0
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Dust Concentration µg/m³'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      }
    }
  }
});


//time range
const timeRangeSelect = document.getElementById('timeRange');
timeRangeSelect.addEventListener('change', () => {
  const range = timeRangeSelect.value;
  const selectedData = chartDataByRange[range];

  dustChart.data.labels = selectedData.labels;
  dustChart.data.datasets[0].data = selectedData.pm10;
  dustChart.data.datasets[1].data = selectedData.threshold;

  dustChart.update();

  chartSubtitle.textContent = `PM10 readings from the last ${range} minutes`;
});