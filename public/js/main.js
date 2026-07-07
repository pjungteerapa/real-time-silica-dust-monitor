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

                                var carousel_div = `<div class="sensor-card">
                                                        <div>
                                                            <h4>${sensor_name}</h4>
                                                            <div class="sensor-number">${sensor_id}</div>
                                
                                                            <div class="location">${sensor_loc}</div>
                                                            <div class="reading danger">${late_pm25} µg/m³</div>
                                                            <span class="badge danger">DANGER</span>

                                                            <div class="sensor-info">
                                                            <strong>Last Record</strong>${late_pm25_time}<br>
                                                            <strong>PM2.5:</strong> ${late_pm25} µg/m³<br>
                                                            <strong>PM10:</strong> ${late_pm25} µg/m³<br>
                                                            <strong>Sensor Status:</strong> Online
                                                            </div>
                                                        </div>

                                                        <div class="card-actions">
                                                            <a class="contact-button" href="moreinfo.html?${sensor_id}">MORE INFO</a>
                                                        </div>
                                                    </div>`
            
                            document.getElementById("sensor-grid").innerHTML += carousel_div;     
                        } 
                        else{console.log("No such document!");}
                    })

                //     //Change Data Capture
                //     const unsub = onSnapshot(tank_docRef, (docSnap) => {
                //         // console.log(docSnap.data());
                //         var tank_id = docSnap.data().id;
                //         var tank_name = docSnap.data().name;
                //         var tank_info = docSnap.data().info;
                //         //info
                //         var information = docSnap.data().information;
                //         var tank_sdate = date_format(information.start_date.seconds);
                //         //ph
                //         const ph = docSnap.data().ph;
                //         var late_ph = ph.ph_data[ph.ph_data.length -1];
                //         //specific_gravity
                //         var specific_gravity = docSnap.data().specific_gravity;
                //         var late_sg = specific_gravity.sg_data[specific_gravity.sg_data.length -1];
                //         //temp
                //         const temperature = docSnap.data().temperature;
                //         var late_temp = temperature.temp[temperature.temp.length -1];
                //         //Data
                //         document.getElementById("late_temp_"+tank_id).innerHTML = late_temp + "&nbsp;°C";
                //         document.getElementById("name_"+tank_id).innerHTML = tank_name;
                //         document.getElementById("info_"+tank_id).innerHTML = tank_info;
                //         document.getElementById("sdate_"+tank_id).innerHTML = tank_sdate;
                //         document.getElementById("ph_"+tank_id).innerHTML = late_ph;
                //         document.getElementById("late_sg_"+tank_id).innerHTML = late_sg;

                //         var temp_dif = late_temp - docSnap.data().control.temp_control;
                //         if(temp_dif < 0){
                //             document.getElementById("late_temp_"+tank_id).style.color = "#478ac9";
                //         }else{
                //             document.getElementById("late_temp_"+tank_id).style.color = "#db545a";
                //         }
                //     });
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