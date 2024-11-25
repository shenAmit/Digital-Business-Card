// import firebaseConfig from './firebaseConfig.js';
// Firebase configuration object (use your configuration details here)
// const firebaseConfig = {
//   apiKey: process.env.FIREBASE_API_KEY,
//   authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.FIREBASE_PROJECT_ID,
//   storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.FIREBASE_APP_ID,
//   measurementId: process.env.FIREBASE_MEASUREMENT_ID
// };

firebase.initializeApp(firebaseConfig);

//Some Variable Declarations
const auth = firebase.auth();
const user = firebase.auth().currentUser;
let dbRef = firebase.database().ref();
let uid, username;


    function signIn() {
      // Check if elements exist
      const emailElement = document.getElementById('email');
      const passwordElement = document.getElementById('password');
      if (!emailElement || !passwordElement) {
        console.error('Email or Password element not found');
        return;
      }
      const email = emailElement.value;
      const password = passwordElement.value;
      // Debugging: log values to ensure they're being captured
      console.log('Email:', email);
      console.log('Password:', password);
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          // Signed in
          var user = userCredential.user;
          // ...
          console.log("signin function called");
          window.location.href = 'card-dashboard.html'; 
        })
        .catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;
        });

    }



    function signUp() {
      // Get email and password values from the form
      const username = document.getElementById('username').value;
      const signupemail = document.getElementById('signupemail').value;
      const newpassword = document.getElementById('newpassword').value;
      // Save the Binding Data
      function saveMessageBinding(uid,username, signupemail) {
        let bindingRef = firebase.database().ref('Binding');
        let userRef = bindingRef.child(uid); // Use username as the key
          userRef.set({
           username: username,
           signupemail: signupemail,
          });
      }  
      // Create a Key in the Collected Data
      function saveMessageUsername(username) {
        let firstsaveRef = firebase.database().ref('Collected Data');
        let userRef2 = firstsaveRef.child(username); // Create a new key with  username
           userRef2.set({
           signupemail: signupemail,
        });
      }
      // Create a new user with email and password
      firebase.auth().createUserWithEmailAndPassword(signupemail, newpassword)
        .then((userCredential) => {
          // User created successfully
          const user = userCredential.user;
          const uid = userCredential.uid;
          saveMessageBinding(uid,username,signupemail);
          saveMessageUsername(username);
          // Send email verification
          firebase.auth().currentUser.sendEmailVerification()
            .then(() => {
              alert('Verification email sent. Please check your inbox and verify your email.');
              // Redirect to the verification page
              window.location.href = 'email-verification.html'; // replace with your verification page URL
            })
            .catch((error) => {
              console.error('Error sending verification email:', error.message);
              alert('Error sending verification email: ' + error.message);
            });
        })
        .catch((error) => {
          // Handle signup errors
          console.error('Error during sign-up:', error.message);
          alert('Error: ' + error.message);
        });


    }


    // Sign out function
    function signOut() {
       auth.signOut().then(() => {
         window.location.href = 'login.html'; // Redirect to login page after sign-out
       }).catch(error => {
         console.error('Sign out error:', error);
      });
    }

    //Precheck function which checks if user is having all the neccessary conditions to access Card Dashboard page as well fetching data from db based on username and then populating them on form
    function preChecks(){
        //Check if email ID is verified. If not, then send to email Verification page
        firebase.auth().onAuthStateChanged(user => {
        
        if (!user) {
            window.location.href = 'index.html'; // Redirect to login page if not authenticated
        }

        else if (user) {
          const userEmail = user.email;
          console.log("User's email:", userEmail);
  
          if (user.emailVerified) {
            console.log("Email is verified");
          } else {
            console.log("Email is not verified");
            window.location.href = 'email-verification.html';
          }
          uid = user.uid;
          console.log("User's UID:", uid);
  
          dbRef.child(`Binding/${uid}/username`).once('value')
            .then(snapshot => {
              if (snapshot.exists()) {
                username = snapshot.val(); // Get the username
  
                // Now use the username to fetch data from Collected Data
                return dbRef.child(`Collected Data/${username}`).once('value');
                console.log(username);
              } else {
                console.error("No username found for this UID in Binding.");
                return null;
              }
            })
            .then(userDataSnapshot => {
              if (userDataSnapshot && userDataSnapshot.exists()) {
                const userData = userDataSnapshot.val();
                populateFormFields(userData); // Function to populate fields with fetched data
              } else if (userDataSnapshot === null) {
                // Handle case when username is not found under the UID
                console.log("No data found for this user.");
              }
            })
            .catch(error => {
              console.error("Error fetching data:", error);
            });
        }
      });
  
    }
    
    //Function to populate data from db into the Form
    function populateFormFields(data){
        console.log("Fetched data:", data);
            companyLogo.value = data.companyLogo || "Not Provided";
            companyName.value = data.companyName || "Not Provided";
            companyTagline.value = data.companyTagline || "Not Provided";
            qrcodelink.value = data.qrcodelink || "Not Provided";
            companyBanner.value = data.companyBanner || "Not Provided";
            representativeName.value = data.representativeName || "Not Provided";
            representativePicture.value = data.representativePicture || "Not Provided";
            representativeDesignation.value = data.representativeDesignation || "Not Provided";
            repPhoneNumber.value = data.repPhoneNumber || "Not Provided";
            repWhatsappNumber.value = data.repWhatsappNumber || "Not Provided";
            email.value = data.email || "Not Provided";
            about.value = data.about || "Not Provided";
            legalInfo.value = data.legalInfo || "Not Provided";
            catalog.value = data.catalog || "Not Provided";
            services.value = data.services || "Not Provided";
            address.value = data.address || "Not Provided";
            website.value = data.website || "Not Provided";
            facebook.value = data.facebook || "Not Provided";
            instagram.value = data.instagram || "Not Provided";
            youtube.value = data.youtube || "Not Provided";
            twitter.value = data.twitter || "Not Provided";
            linkedin.value = data.linkedin || "Not Provided";
            getDirections.value = data.getDirections || "Not Provided";
            toggleViewMode(true); // Start in view mode

      }

    //Function that is called on the click of save button. Accessing DOM elements value and passing it into saveMessage function
    function submitForm() {
        // DOM elements
        let companyLogo = document.getElementById('companyLogo').value;
        let companyName = document.getElementById('companyName').value;
        let companyTagline = document.getElementById('companyTagline').value;
        let qrcodelink = document.getElementById('qrcodelink').value;
        let companyBanner = document.getElementById('companyBanner').value;
        let representativePicture = document.getElementById('representativePicture').value;
        let representativeName = document.getElementById('representativeName').value;
        let representativeDesignation = document.getElementById('representativeDesignation').value;
        let repPhoneNumber = document.getElementById('repPhoneNumber').value;
        let repWhatsappNumber = document.getElementById('repWhatsappNumber').value;
        let email = document.getElementById('email').value;
        let about = document.getElementById('about').value;
        let legalInfo = document.getElementById('legalInfo').value;
        let catalog = document.getElementById('catalog').value;
        let services = document.getElementById('services').value;
        let address = document.getElementById('address').value;
        let website = document.getElementById('website').value;
        let facebook = document.getElementById('facebook').value;
        let instagram = document.getElementById('instagram').value;
        let youtube = document.getElementById('youtube').value;
        let twitter = document.getElementById('twitter').value;
        let linkedin = document.getElementById('linkedin').value;
        let getDirections = document.getElementById('getDirections').value;
        let editBtn = document.getElementById('editBtn').value;
        let saveBtn = document.getElementById('saveBtn').value;
        saveMessage(companyLogo, companyName,companyTagline,qrcodelink, companyBanner, representativeName, representativePicture, representativeDesignation, repPhoneNumber, repWhatsappNumber, email, about, legalInfo, catalog, services, address, website, facebook, instagram, youtube, twitter, linkedin,getDirections);
      }
      

      // Function to update Data on Card Dashboard Page &if saved successfully, toggle the save button back to edit
      function saveMessage(companyLogo, companyName,companyTagline, qrcodelink, companyBanner, representativeName, representativePicture, representativeDesignation, repPhoneNumber, repWhatsappNumber, email, about, legalInfo, catalog, services, address, website, facebook, instagram, youtube, twitter, linkedin, getDirections) {
        let userRef = dbRef.child(`Collected Data/${username}`);
        userRef.set({
        companyLogo: companyLogo,
        companyName: companyName,
        companyTagline: companyTagline,
        qrcodelink: qrcodelink,
        companyBanner: companyBanner,
        representativeName: representativeName,
        representativePicture: representativePicture,
        representativeDesignation: representativeDesignation,
        repPhoneNumber: repPhoneNumber,
        repWhatsappNumber: repWhatsappNumber,
        email: email,
        about: about,
        legalInfo: legalInfo,
        catalog: catalog,
        services: services,
        address: address,
        website: website,
        facebook: facebook,
        instagram: instagram,
        youtube: youtube,
        twitter: twitter,
        linkedin: linkedin,
        getDirections: getDirections,
       });

        dbRef.set(userRef).then(() => {
         alert("Data saved successfully!");
         toggleViewMode(true);
       }).catch((error) => {
         console.error("Error saving data:", error);
       });
};

     
    
    //Function to toggle between Edit mode and View mode
    function toggleViewMode(isViewMode) {
        companyLogo.readOnly = isViewMode;
        companyName.readOnly = isViewMode;
        companyTagline.readOnly = isViewMode;
        qrcodelink.readOnly = isViewMode;
        companyBanner.readOnly = isViewMode;
        representativeName.readOnly = isViewMode;
        representativePicture.readOnly = isViewMode;
        representativeDesignation.readOnly = isViewMode;
        repPhoneNumber.readOnly = isViewMode;
        repWhatsappNumber.readOnly = isViewMode;
        email.readOnly = isViewMode;
        about.readOnly = isViewMode;
        legalInfo.readOnly = isViewMode;
        catalog.readOnly = isViewMode;
        services.readOnly = isViewMode;
        address.readOnly = isViewMode;
        website.readOnly = isViewMode;
        facebook.readOnly = isViewMode;
        instagram.readOnly = isViewMode;
        youtube.readOnly = isViewMode;
        twitter.readOnly = isViewMode;
        linkedin.readOnly = isViewMode;
        getDirections.readOnly = isViewMode;
        // Set other fields to readonly in view mode
        editBtn.style.display = isViewMode ? "inline" : "none";
        saveBtn.style.display = isViewMode ? "none" : "inline";
      }

      


    // Helper function to sanitize usernames
    function sanitizeUsername(username) {
        return username.replace(/[.#$[\]]/g, '_');
    }
    //ravishh
    function injectCSS() {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = './css/user-card.css';  
      document.head.appendChild(link);

      const faLink = document.createElement('link');
      faLink.rel = 'stylesheet';
      faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';  // Font Awesome CDN
      document.head.appendChild(faLink);
    }
    
    
// you can remove this code if you have new syle 
    function fetchUserData() {
      injectCSS();
      const pathSegments = window.location.pathname.split('/');
      let username = pathSegments[pathSegments.length - 1];
      username = sanitizeUsername(username);
  
      let userRef = dbRef.child(`Collected Data/${username}`);
      userRef.once('value', (snapshot) => {
          const userDataContainer = document.getElementById('userDataContainer');
          const loadingMessage = document.getElementById('loading');
  
          if (snapshot.exists()) {
              const data = snapshot.val();
  
              // Dynamically create the HTML structure
              // confusion in company details
              const htmlContent = `
                  <div id="main-look">
                      <div id="logo-container">
                          <img src="${data.companyLogo || 'default-logo.png'}" id="companyLogo" alt="Company Logo">
                          <div class="logo-text">
                              <h2 id="companyName">${data.companyName || 'Company Name'}</h2>
                              <p>${data.companyTagline || 'Not Provided'}</p>
                          </div>
                      </div>
  
                      <div id="banner">
                          <img src="${data.companyBanner || 'default-banner.png'}" id="companyBanner" alt="Company Banner">
                      </div>
  
                      <div class="intro">
                          <div class="wave-container">
                              <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 209 33">
                                  <path fill="white" d="..."></path>
                              </svg>
                          </div>
  
                          <div class="profile-section">
                              <div class="side-buttons">
                                  <div class="Enquiry">
                                      <i class="fas fa-qrcode" id= "qr-icon"></i>
                                  </div>
                              </div>
  
                              <div class="profile-image">
                                  <img src="${data.representativePicture || 'default-profile.png'}" id="representativePicture" alt="Representative Image">
                                  <h2 id="repsentativeName">${data.representativeName || 'Representative Name'}</h2>
                                  <p id="representativeDesignation">${data.representativeDesignation || 'Designation'}</p>
                              </div>
  
                              <div class="side-buttons">
                                  <div class="Share">
                                      <i class="fa-solid fa-share-nodes"></i>
                                  </div>
                              </div>
                          </div>
  
                          <div class="contact-icons">
                              <div class="icon">
                                  <i class="fas fa-phone"></i>
                                  <p id="repPhoneNumber">${data.repPhoneNumber || 'Phone'}</p>
                              </div>
                              <div class="icon">
                                  <i class="fab fa-whatsapp"></i>
                                  <p id="repWhatsappNumber">${data.repWhatsappNumber || 'WhatsApp'}</p>
                              </div>
                              <div class="icon">
                                  <i class="fas fa-envelope"></i>
                                  <p id="email">${data.email || 'Email'}</p>
                              </div>
                          </div>
  
                          <div class="section">
                              <div class="line-container">
                                  <hr class="line-left">
                                  <span class="line-text">Company Details</span>
                                  <hr class="line-right">
                              </div>                                                    <!---need to work here --->

                                <div class="icon-row">
                                    <div class="icon" >
                                      <i class="fa-solid fa-handshake" id="abouticon" ></i>
                                      <p>About</p>
                                  </div>
                                  <div class="icon">
                                      <i class="fas fa-book" id="catalogicon" onclick="window.open('${data.catalog}', '_blank')"></i>
                                      <p>Catalog</p>
                                  </div>
                                  
                                  <div class="icon">
                                      <i class="fas fa-info-circle" id="legal-icon"></i>
                                      <p>Legal Info</p>
                                  </div>
                                </div>

                                <div class="modal" id="myModal">
                                    <div class="modal-content">
                                    <p id="modalText">This is a modal box!</p>
                                    </div>
                                </div>

                          </div>

                          <div class="section">
                               <div class="line-container">
                                    <hr class="line-left">
                                    <span class="line-text">Services/Products</span>
                                     <hr class="line-right">
                              </div>
                               <p class="Bio"><p id="services">${data.services || 'Services/Products'}</p></p>
                            </div>
  
                          <div class="section">
                              <div class="line-container">
                                  <hr class="line-left">
                                  <span class="line-text">Contact</span>
                                  <hr class="line-right">
                              </div>
                              <div class="icon-row">
                                  <div class="icon">
                                      <i class="fa-brands fa-facebook" onclick="window.open('${data.facebook}', '_blank')"></i>
                                  </div>
                                  <div class="icon">
                                     <i class="fab fa-instagram" onclick="window.open('${data.instagram}', '_blank')"></i>
                                  </div>
                                  <div class="icon">
                                      <i class="fa-brands fa-youtube" onclick="window.open('${data.youtube}', '_blank')"></i>
                                  </div>
                                  <div class="icon">
                                      <i class="fas fa-globe" onclick="window.open('${data.website}', '_blank')"></i>
                                  </div>
                              </div>
                              <div class="address">
                                  <p id="address">${data.address || 'Company Address'}</p>
                                  <button onclick="window.open('${data.getDirections}', '_blank')">Get Directions</button>
                              </div>
                          </div>
                      </div>
                  </div>`;
                
  
              // Insert the created HTML into the container
              userDataContainer.innerHTML = htmlContent;


              

                //modal box opening 
                 var modal = document.getElementById("myModal");
                 var modalText = document.getElementById("modalText");
         
                 // Get the icons
                 var icon1 = document.getElementById("qr-icon");
                 var icon2 = document.getElementById("about-icon");
                 var icon3 = document.getElementById("legal-icon");
         
              
                abouticon.onclick = function(){ 
                  modal.style.display = "flex";
               modalText.textContent = `${data.about || 'About the company'}`;
              }

              
              icon1.onclick = function() {
                modal.style.display = "flex";
                modalText.innerHTML = `<img src="${data.qrcodelink || 'QR Code'}">`;
              }


              icon3.onclick = function() {
                modal.style.display = "flex";
                modalText.textContent = `${data.legalInfo || 'Legal Information'}`;
              }

    
               // Close the modal when clicking anywhere outside the modal content
                window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
              }  
  
              // Hide the loading message
              if (loadingMessage) loadingMessage.style.display = "none";
          } else {
              loadingMessage.textContent = "User not found.";
          }
      });
      
  }

    
    //Function to Fetch User Data from db
    // function fetchUserData() {
    //   // Extract username from the URL path
    //   const pathSegments = window.location.pathname.split('/');
    //   let username = pathSegments[pathSegments.length - 1]; // Last segment
    //   username = sanitizeUsername(username); // Sanitize username if needed

    //   // const database = firebase.database();
    //     let userRef = dbRef.child(`Collected Data/${username}`);
    //     userRef.once('value', (snapshot) => {
    //       const userDataContainer = document.getElementById('userDataContainer');
    //       const loadingMessage = document.getElementById('loading');
  
    //       if (snapshot.exists()) {
    //         const data = snapshot.val();
    //         const companyLogo = data.companyLogo || "Not provided";
    //         const companyName = data.companyName || "Not provided";
    //         const companyBanner = data.companyBanner|| "Not provided";
    //         const repsentativeName = data.repsentativeName || "Not provided";
    //         const representativePicture = data.representativePicture || "Not provided";
    //         const representativeDesignation = data.representativeDesignation || "Not provided";
    //         const repPhoneNumber = data.repPhoneNumber || "Not provided";
    //         const repWhatsappNumber = data.repWhatsappNumber || "Not provided";
    //         const email = data.email || "Not provided";
    //         const about = data.about || "Not provided";
    //         const legalInfo = data.legalInfo || "Not provided";
    //         const catalog = data.catalog || "Not provided";
    //         const services = data.services || "Not provided";
    //         const address = data.address || "Not provided";
    //         const website = data.website || "Not provided";
    //         const facebook = data.facebook || "Not provided";
    //         const instagram = data.instagram || "Not provided";
    //         const youtube = data.youtube || "Not provided";
    //         const twitter = data.twitter || "Not provided";
    //         const linkedin = data.linkedin || "Not provided";
  
    //         loadingMessage.style.display = "none";
    //         userDataContainer.innerHTML = `
    //         <h2>User Profile for ${username}</h2>
    //         <p><strong>Username:</strong> ${username}</p>
    //         <img src="${companyLogo}">
    //         <p><strong>Company Name:</strong> ${companyName}</p>
    //         <img src="${companyBanner}">
    //         <p><strong>Representative Name:</strong> ${repsentativeName}</p>
    //         <img src="${representativePicture}">
    //         <p><strong>Representative Designation:</strong> ${representativeDesignation}</p>
    //         <p><strong>Representative Phone Number:</strong> ${repPhoneNumber}</p>
    //         <p><strong>Representative Whatsapp Number:</strong> ${repWhatsappNumber}</p>
    //         <p><strong>Email:</strong> ${email}</p>
    //         <p><strong>About:</strong> ${about}</p>
    //         <p><strong>Legal Info:</strong> ${legalInfo}</p>
    //         <p><strong>Catalog:</strong> ${catalog}</p>
    //         <p><strong>Serives:</strong> ${services}</p>
    //         <p><strong>address:</strong> ${address}</p>
    //         <p><strong>Website:</strong> ${website}</p>
    //         <p><strong>Facebook:</strong> ${facebook}</p>
    //         <p><strong>Instagram:</strong> ${instagram}</p>
    //         <p><strong>Youtube:</strong> ${youtube}</p>
    //         <p><strong>Twitter:</strong> ${twitter}</p>
    //         <p><strong>Linkedin:</strong> ${linkedin}</p>
    //     `;
    //       } else {
    //         loadingMessage.textContent = "User not found.";
    //       }
    //     });
    //   }

//Function to Save Newsletter Subscriptions
function newsLetter(){
  let newsletteremail = document.getElementById('newsletteremail').value;
  let userRef = dbRef.child(`Newsletter`);
  let newMessageRef = userRef.push();
  newMessageRef.set({
    email: newsletteremail
  })
  .then(() => {
    // Display success message
    alert("Thank you for subscribing to our newsletter!");
    document.getElementById('newsletteremail').value = ""; // Clear the input field
  })
  .catch((error) => {
    // Handle errors here
    console.error("Error saving newsletter email:", error);
    alert("Something went wrong. Please try again.");
  });

}

//Function to Save Contact Form Submissions
function contactForm(){
  let contactname = document.getElementById('contactname').value;
  let contactemail = document.getElementById('contactemail').value;
  let contactsubject = document.getElementById('contactsubject').value;
  let contactmessage = document.getElementById('contactmessage').value;
  let userRef = dbRef.child(`Contact`);
  let newMessageRef = userRef.push();
  newMessageRef.set({
    Name: contactname,
    Email: contactemail,
    Subject: contactsubject,
    Message: contactmessage, 
  })
  .then(() => {
      // Display success message
      alert("We have received your message!");
      document.getElementById('newsletteremail').value = ""; // Clear the input field
  })
  .catch((error) => {
      // Handle errors here
      console.error("Error", error);
      alert("Something went wrong. Please try again.");
  });

}
