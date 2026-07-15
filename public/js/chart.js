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
          // Data
          var chart_data = docSnap.data().dust.si;
          const standardValue = 0.05;
          const chartDataByRange = createChartDataByRange(
            chart_data,
            [5, 10, 15, 30],
            standardValue
          );
          // console.log(chartDataByRange);
          // Chart Create
          const ctx = document.getElementById('dustChart');
          const chartSubtitle = document.getElementById('chartSubtitle');
          const dustChart = new Chart(ctx, {
            type: "line",
            data: {
              labels: chartDataByRange[5].labels,
              datasets: [
                {
                  label: "Silica Dust mg/m³",
                  data: chartDataByRange[5].si,
                  borderWidth: 3,
                  tension: 0.35,
                  pointRadius: 4
                },
                {
                  label: "Standard Value",
                  data: chartDataByRange[5].threshold,
                  borderWidth: 2,
                  borderDash: [8, 6],
                  pointRadius: 0
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false
            }
          });
          // Chart Update
          const timeRangeSelect = document.getElementById("timeRange");
          timeRangeSelect.addEventListener("change", () => {
            const range = Number(timeRangeSelect.value);
            const selectedData = chartDataByRange[range];

            dustChart.data.labels = selectedData.labels;
            dustChart.data.datasets[0].data = selectedData.si;
            dustChart.data.datasets[1].data = selectedData.threshold;

            dustChart.update();

            chartSubtitle.textContent = `Showing latest ${range} records`;
          }); 

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

///////////////////////////////////////////////////////////////////////////////
//function
function formatTimestamp(timestamp) {
  const date = new Date(Number(timestamp));

  const pad = value => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function createChartDataByRange(rawData, ranges, standardValue) {
  const chartDataByRange = {};

  ranges.forEach(range => {
    const latestTimestamps = rawData.timestamp.slice(-range);
    const latestDustData = rawData.dust_data.slice(-range);

    chartDataByRange[range] = {
      labels: latestTimestamps.map(time => formatTime(time)),
      si: latestDustData,
      threshold: latestDustData.map(() => standardValue)
    };
  });

  return chartDataByRange;
}