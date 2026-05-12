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

                // docSnap.data().sensor.forEach((sensor,i) => {
                //     // console.log(sensor)
                //     const sensor_docRef = doc(db, "sensor", sensor);

                //     // Slideshow Create
                //     getDoc(sensor_docRef).then(docSnap => {
                //         if (docSnap.exists()) {
                //             // console.log("Document data:", docSnap.data());
                //                 var tank_id = docSnap.data().id;
                //                 var tank_name = docSnap.data().name;
                //                 var tank_info = docSnap.data().info;
                //                 //info
                //                 var information = docSnap.data().information;
                //                 var tank_sdate = date_format(information.start_date.seconds);
                //                 //ph
                //                 const ph = docSnap.data().ph;
                //                 var late_ph = ph.ph_data[ph.ph_data.length -1] || 0;
                //                 //specific_gravity
                //                 var specific_gravity = docSnap.data().specific_gravity;
                //                 var late_sg = specific_gravity.sg_data[specific_gravity.sg_data.length -1] || 0;
                //                 //temp
                //                 const temperature = docSnap.data().temperature;
                //                 var late_temp = temperature.temp[temperature.temp.length -1];
            
                //                 var carousel_div = `<div class="u-align-center u-container-align-center u-container-style u-list-item u-opacity u-opacity-90 u-repeater-item u-shape-rectangle u-white u-list-item-${i+1}" data-animation-name="customAnimationIn" data-animation-duration="1500">` +
                //                 `<div class="u-container-layout u-similar-container u-container-layout-1">` +
                //                 `<h3 class="u-align-center u-text u-text-default u-text-2" id="name_${tank_id}">${tank_name}</h3>` +
                //                 `<img alt="" class="u-align-center u-expanded-width-lg u-expanded-width-md u-expanded-width-sm u-expanded-width-xs u-image u-image-contain u-image-default u-image-${i+1}" data-image-width="235" data-image-height="622" src="images/fermentertank.png">` +
                //                 `<h4 class="u-align-center u-text u-text-3" id="info_${tank_id}">${tank_info}</h4>` +
                //                 `<h3 class="u-align-center u-text u-text-default u-text-4" id="late_temp_${tank_id}">${late_temp}&nbsp;°C</h3>` +
                //                 `<p class="u-align-center u-custom-font u-heading-font u-text u-text-default u-text-5"><b>Start Date: </b><span id="sdate_${tank_id}">${tank_sdate}</span><br><b> Potential of Hydrogen: </b><span id="ph_${tank_id}">${late_ph}</span><br><b>Actual Gravity: </b><span id="late_sg_${tank_id}">${late_sg}</span></p>` +
                //                 `<a href="monitor_ft.html?id=${tank_id}" class="u-active-black u-align-center u-border-none u-btn u-button-style u-hover-black u-palette-3-base u-btn-${i+1}">Temperature Control</a>` +
                //                 `<a href="qc.html?id=${tank_id}" class="u-active-black u-align-center u-border-none u-btn u-button-style u-hover-black u-palette-3-base u-btn-${i+1}">Quality Control</a>` +
                //                 `</div></div>`
            
                //                 $("#slideshow-container").append(carousel_div);
                //                 // console.log(temp_dif)          
                //         } else {
                //             console.log("No such document!");
                //         }
                //     })

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
                // })
                
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