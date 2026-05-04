const ctx = document.getElementById('dustChart');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30', '10:35'],
        datasets: [
          {
            label: 'PM10 µg/m³',
            data: [88, 68, 65, 60, 59, 55, 50, 48],
            borderWidth: 3,
            tension: 0.35,
            pointRadius: 5
          },
          {
            label: 'Safety Threshold',
            data: [50, 50, 50, 50, 50, 50, 50, 50],
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