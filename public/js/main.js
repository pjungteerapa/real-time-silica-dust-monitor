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

                docSnap.data().sensor.forEach((sensor,i) => {
                    // console.log(sensor)
                    const sensor_docRef = doc(db, "sensor", sensor);

                    // Slideshow Create
                    getDoc(sensor_docRef).then(docSnap => {
                        if (docSnap.exists()) {
                            console.log("Document data:", docSnap.data());
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

                                var carousel_div = `<div class="sensor-card">
                                                        <div>
                                                            <h4 id="sensor_name_${sensor_id}">${sensor_name}</h4>
                                                            <div class="sensor-number">${sensor_id}</div>
                                
                                                            <div class="location" id="loc_${sensor_id}">${sensor_loc}</div>
                                                            <div class="reading danger" id="dust_value_${sensor_id}">${late_si} µg/m³</div>
                                                            <span class="badge danger" id="dust_status_${sensor_id}">DANGER</span>

                                                            <div class="sensor-info">
                                                            <strong>Last Record: </strong><span id="late_time_${sensor_id}">${date_format}</span><br>
                                                            <strong>PM2.5: </strong><span id="late_pm25_${sensor_id}">${late_pm25} µg/m³</span><br>
                                                            <strong>PM10: </strong><span id="late_pm10_${sensor_id}">${late_pm10} µg/m³</span><br>
                                                            </div>
                                                        </div>

                                                        <div class="card-actions">
                                                            <a class="contact-button" href="moreinfo.html?id=${sensor_id}">MORE INFO</a>
                                                        </div>
                                                    </div>`
            
                            document.getElementById("sensor-grid").innerHTML += carousel_div;     
                        } 
                        else{console.log("No such document!");}
                    })

                    //Change Data Capture
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
                        document.getElementById("sensor_name_"+sensor_id).innerHTML = sensor_name;
                        document.getElementById("loc_"+sensor_id).innerHTML = sensor_loc;
                        document.getElementById("dust_value_"+sensor_id).innerHTML = late_si;
                        document.getElementById("late_pm25_"+sensor_id).innerHTML = late_pm25;
                        document.getElementById("late_pm10_"+sensor_id).innerHTML = late_pm10;
                        document.getElementById("late_time_"+sensor_id).innerHTML = date_format;
                        
                        // cheak Status
                        const diff = late_si - 0.05;
                        if(diff <= 0){
                            //Safe
                            document.getElementById("dust_value_"+sensor_id).style.color = "#1f9d55";
                            document.getElementById("dust_status_"+sensor_id).innerHTML = "Safe";
                            document.getElementById("dust_status_"+sensor_id).className = "badge safe";
                        }if(diff <= 0.03){
                            //Warning
                            document.getElementById("dust_value_"+sensor_id).style.color = "#d97706";
                            document.getElementById("dust_status_"+sensor_id).innerHTML = "Warning";
                            document.getElementById("dust_status_"+sensor_id).className = "badge warning"
                        }
                        else{
                            //Danger
                            document.getElementById("dust_value_"+sensor_id).style.color = "#dc2626";
                            document.getElementById("dust_status_"+sensor_id).innerHTML = "Danger";
                            document.getElementById("dust_status_"+sensor_id).className = "badge danger"
                        }
                    });
                })
                
            } else {
                console.log("No such document!");
            }

        })
    }else{
        // console.log(document.getElementById("logout"))
        // document.getElementById("logout").parent().hide();
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

function formatTimestamp(timestamp) {
  const date = new Date(Number(timestamp));

  const pad = value => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}