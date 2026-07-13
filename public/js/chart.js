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
          console.log(docSnap.data());
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
          }if(diff <= 0.03){
              //Warning
              document.getElementById("dust_value").style.color = "#d97706";
              document.getElementById("dust_status").innerHTML = "Warning";
              document.getElementById("dust_status").className = "badge warning"
          }
          else{
              //Danger
              document.getElementById("dust_value_"+sensor_id).style.color = "#dc2626";
              document.getElementById("dust_status_"+sensor_id).innerHTML = "Danger";
              document.getElementById("dust_status_"+sensor_id).className = "badge danger"
          }
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






//Chart
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

//function
function formatTimestamp(timestamp) {
  const date = new Date(Number(timestamp));

  const pad = value => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}