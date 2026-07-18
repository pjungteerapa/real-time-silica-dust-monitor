// Your web app's Firebase configuration
import {initializeApp} from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCH2ShglhWUCLoxEMhMV8rdw_GHc7_z17c",
  authDomain: "real-time-silica-dust-monitor.firebaseapp.com",
  databaseURL: "https://real-time-silica-dust-monitor-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "real-time-silica-dust-monitor",
  storageBucket: "real-time-silica-dust-monitor.firebasestorage.app",
  messagingSenderId: "972708961896",
  appId: "1:972708961896:web:6aef6fe9334a5a18d8a5dd",
  measurementId: "G-WVEEPJ1FTC"
};

// Initialize Firebase
import {
    getAuth,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    updateProfile,
    signOut,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";

import { getFirestore, doc, setDoc, getDoc, collection, query, onSnapshot } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

///////////////////////////////////////////////////////////////////////////////////
//////////////Check Login
var user_info = {}

onAuthStateChanged(auth, (user) => {
    // console.log(user)
    if (user){
        // document.getElementById("logout").innerHTML = "Logout as " + uid;
        
        const docRef = doc(db, "users", user.uid);
        // console.log(docRef)
        getDoc(docRef).then(docSnap => {
          // console.log(docSnap.data());
          if (docSnap.exists()) {
              // console.log(docSnap.data());
              user_info["name"] = docSnap.data().name;
              user_info["uid"] = docSnap.data().uid;

              document.getElementById("logout").innerHTML = "Logout as " + user_info.name;

              document.getElementById("login").style.display = "none";

              if(document.getElementById("login_btn")){
                  document.getElementById("login_btn").innerHTML = "Welcome " + user_info.name;
                  document.getElementById("login_btn").href = "/";
              }                
          } else {
              console.log("No such document!");
          }
        })

        const urlParams = new URLSearchParams(window.location.search);
        const sensor_id = urlParams.get('id');
        const sensor_docRef = doc(db, "sensor", sensor_id);
        // console.log(sensor_id);
        const unsub = onSnapshot(sensor_docRef, (docSnap) => {
          // console.log(docSnap.data());
          var sensor_id = docSnap.data().id;
          var sensor_name = docSnap.data().name;
          //info
          var sensor_type = docSnap.data().type;
          var sensor_loc = docSnap.data().loc;
          var sensor_loc_long = docSnap.data().loc_long;
          var sensor_measure_range = docSnap.data().measure_range;
          // dust data
          var late_pm25 = docSnap.data().dust.pm2_5.dust_data.pop();
          var late_pm25_time = docSnap.data().dust.pm2_5.timestamp.pop();
          var late_pm10 = docSnap.data().dust.pm10.dust_data.pop();
          var late_pm10_time = docSnap.data().dust.pm10.timestamp.pop();
          var late_si = docSnap.data().dust.si.dust_data.pop();
          var late_si_time = docSnap.data().dust.si.timestamp.pop();
          var date_format = formatTimestamp(late_si_time);

          //Data
          document.querySelectorAll(".sensor_id").forEach(el => el.textContent = sensor_id);
          document.getElementById("sensor_name").innerHTML = sensor_name;
          document.getElementById("loc").innerHTML = sensor_loc;
          document.getElementById("loc_long").innerHTML = sensor_loc_long;
          document.getElementById("sensor_type").innerHTML = sensor_type;
          document.getElementById("sensor_measure_range").innerHTML = sensor_measure_range;
          document.getElementById("dust_value").innerHTML = late_si + " µg/m³";
          document.getElementById("late_pm25").innerHTML = late_pm25;
          document.getElementById("late_pm10").innerHTML = late_pm10;
          document.getElementById("late_time").innerHTML = date_format;
          
          // cheak Status
          const diff = late_si - 0.05;
          if(diff <= 0){
              //Safe
              document.getElementById("dust_value").style.color = "#1f9d55";
              document.getElementById("dust_status").innerHTML = "Safe";
              document.getElementById("dust_status").className = "badge safe";
          }else if(diff <= 0.03){
              //Warning
              document.getElementById("dust_value").style.color = "#d97706";
              document.getElementById("dust_status").innerHTML = "Warning";
              document.getElementById("dust_status").className = "badge warning"
          }
          else{
              //Danger
              document.getElementById("dust_value").style.color = "#dc2626";
              document.getElementById("dust_status").innerHTML = "Danger";
              document.getElementById("dust_status").className = "badge danger"
          }

          // Chart Update
          const chart_data = docSnap.data().dust.si;
          createOrUpdateChart(chart_data);
          

        });
      
    }else{
        document.getElementById("logout").style.display = "none";
    }
})

////////////////////////////////////////////////////////////////////////////////
//////////////Log out
document.getElementById('logout').addEventListener('click', (e) => {
    e.preventDefault();
    signOut(auth)
        .then(() => {
            window.location.href = "/";
        })
        .catch((err) => {
            console.log(err.message)
        })
})

// Chart Create
let dustChart = null;
let currentRange = "10min";
let currentRawChartData = null;

const standardValue = 0.05;
const ctx = document.getElementById("dustChart");
const chartSubtitle = document.getElementById("chartSubtitle");

function createOrUpdateChart(rawData) {
  currentRawChartData = rawData;

  const selectedData = createTimeSeriesData(
    rawData,
    currentRange,
    standardValue
  );

  if (!dustChart) {
    dustChart = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Silica Dust mg/m³",
            data: selectedData.dust,
            borderWidth: 3,
            tension: 0.25,
            pointRadius: 3,

            // สำคัญ: ถ้าข้อมูลขาดนานเกิน 10 นาที จะไม่ลากเส้นต่อ
            spanGaps: 10 * 60 * 1000
          },
          {
            label: "Standard Value",
            data: selectedData.threshold,
            borderWidth: 2,
            borderDash: [8, 6],
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        parsing: false,
        scales: {
          x: {
            type: "time",
            time: {
              tooltipFormat: "dd/MM/yyyy HH:mm:ss",
              displayFormats: {
                minute: "dd/MM HH:mm",
                hour: "dd/MM HH:mm",
                day: "dd/MM/yyyy"
              }
            },
            title: {
              display: true,
              text: "Date and Time"
            },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 8,
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Silica Dust mg/m³"
            }
          }
        },
        plugins: {
          legend: {
            position: "bottom"
          },
          tooltip: {
            callbacks: {
              title: function(context) {
                const timestamp = context[0].parsed.x;
                return formatDateTime(timestamp);
              }
            }
          }
        }
      }
    });
  } else {
    dustChart.data.datasets[0].data = selectedData.dust;
    dustChart.data.datasets[1].data = selectedData.threshold;
    dustChart.update();
  }

  chartSubtitle.textContent = getRangeText(currentRange);
}

const timeRangeSelect = document.getElementById("timeRange");
timeRangeSelect.addEventListener("change", () => {
  currentRange = timeRangeSelect.value;

  if (!currentRawChartData) return;

  createOrUpdateChart(currentRawChartData);
});


///////////////////////////////////////////////////////////////////////////////
//function
function formatTimestamp(timestamp) {
  const date = new Date(Number(timestamp));

  const pad = value => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatDateTime(timestamp) {
  const date = new Date(timestamp);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
}

function createTimeSeriesData(rawData, rangeType, standardValue) {
  const timestamps = rawData.timestamp || [];
  const dustValues = rawData.dust_data || [];

  const points = timestamps
    .map((time, index) => ({
      x: Number(time),
      y: Number(dustValues[index])
    }))
    .filter(point => !Number.isNaN(point.x) && !Number.isNaN(point.y))
    .sort((a, b) => a.x - b.x);

  if (points.length === 0) {
    return {
      dust: [],
      threshold: []
    };
  }

  // ใช้เวลาล่าสุดจากข้อมูลจริงเป็นจุดอ้างอิง
  const latestTime = points[points.length - 1].x;

  const rangeMs = getRangeMs(rangeType);
  const startTime = latestTime - rangeMs;

  const filteredPoints = points.filter(point => {
    return point.x >= startTime && point.x <= latestTime;
  });

  if (filteredPoints.length === 0) {
    return {
      dust: [],
      threshold: []
    };
  }

  return {
    dust: filteredPoints,
    threshold: [
      { x: startTime, y: standardValue },
      { x: latestTime, y: standardValue }
    ]
  };
}

function getRangeText(rangeType) {
  const rangeText = {
    "10min": "Showing data from the last 10 minutes",
    "30min": "Showing data from the last 30 minutes",
    "1hour": "Showing data from the last 1 hour",
    "3hour": "Showing data from the last 3 hours",
    "6hour": "Showing data from the last 6 hours",
    "12hour": "Showing data from the last 12 hours",
    day: "Showing data from the last 24 hours",
    week: "Showing data from the last 7 days",
    month: "Showing data from the last 30 days"
  };

  return rangeText[rangeType] || "Showing selected time range";
}

function getRangeMs(rangeType) {
  const ranges = {
    "10min": 10 * 60 * 1000,
    "30min": 30 * 60 * 1000,
    "1hour": 1 * 60 * 60 * 1000,
    "3hour": 3 * 60 * 60 * 1000,
    "6hour": 6 * 60 * 60 * 1000,
    "12hour": 12 * 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000
  };

  return ranges[rangeType] || ranges.day;
}