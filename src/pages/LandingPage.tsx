import { useState } from "react";
import Terms from "../components/Terms"; 
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { auth, db } from "../firebaseConfig.ts"; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app"; 


export default function LandingPage() {

    const [expandedCard, setExpandedCard] = useState<"login" | "signup" | null>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [acknowledgementAccepted, setAcknowledgementAccepted] = useState(false);
    const [activeModal, setActiveModal] = useState<"terms" | "privacy" | "acknowledgement" | null>(null);

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [phoneError, setPhoneError] = useState("");

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const navigate = useNavigate();

  const handleToggle = (card: "login" | "signup") => {
    setExpandedCard(expandedCard === card ? null : card);
  };

  const handleOpenModal = (type: "terms"  | "privacy"  | "acknowledgement") => {
        setActiveModal(type);
  };

  const handleAcceptModal = () => {
    if (activeModal === "terms") setTermsAccepted(true);
    if (activeModal === "privacy") setPrivacyAccepted(true);
    if (activeModal === "acknowledgement") setAcknowledgementAccepted(true);
    setActiveModal(null);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const isValidPassword = (password: string) => {
    return password.length >= 8; // Firebase requires at least 8 characters
  };
  
  const isValidPhone = (phone: string) => {
    return /^\d{10}$/.test(phone); // Checks for exactly 10 digits
  };
  

  const handleSignUp = async () => {
    setEmailError(!isValidEmail(email) ? "Invalid email format" : "");
    setPasswordError(!isValidPassword(password) ? "Password must be at least 8 characters" : "");
    setPhoneError(!isValidPhone(phone) ? "Phone number must be exactly 10 digits" : "");

  
    if (!termsAccepted || !privacyAccepted || !acknowledgementAccepted) {
        alert("You must accept all terms before signing up.");
        return;
      }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      //generate id numbers
      const profileId = uuidv4();
      const jobId = uuidv4();
      const messageId = uuidv4();
    
      await setDoc(doc(collection(db, "users"), user.uid), {
        uid: user.uid,
        profileId,
        jobId,
        messageId,
        firstName,
        lastName,
        email,
        phone,
        createdAt: new Date(),
      });
  
      console.log("User registered successfully!");
      navigate("/home");

    } catch (error) {
        if (error instanceof FirebaseError) {
            setEmailError(`Error: ${error.message}`); 
          }
        else {
        console.error("Unexpected error:", (error as Error).message);
      }
    }
  };
  
  const handleLogin = async () => {
    setLoginError(""); // Clear previous errors
  
    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter both email and password.");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      console.log("User logged in successfully:", userCredential.user);
      navigate("/home");
    } catch (error) {
      if (error instanceof FirebaseError) {
        setLoginError(error.message);
      } else {
        setLoginError("Unexpected error occurred.");
      }
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6 text-black">Welcome to Bulletin Board</h1>
      <p className="mb-6 text-black">Find or post jobs locally with ease.</p>

      <div className="flex space-x-6">
        {/* Login Card */}
        <div className={`bg-white p-8 rounded-2xl shadow-lg w-96 flex flex-col items-center transition-all duration-300 ${expandedCard === "login" ? "h-auto" : "h-40"}`}>
          <h2 className="text-2xl font-semibold mb-4 text-black">Login</h2>
          <button
            onClick={() => handleToggle("login")}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-xl hover:bg-blue-600"
          >
            {expandedCard === "login" ? "Close" : "Login"}
          </button>

          {expandedCard === "login" && (
            <div className="w-full mt-4">
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full p-2 mb-2 border rounded text-black"
            />
          
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full p-2 mb-4 border rounded text-black"
            />
          
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
          
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
          
          )}
        </div>

        {/* Sign Up Card */}
        <div className={`bg-white p-8 rounded-2xl shadow-lg w-96 flex flex-col items-center transition-all duration-300 ${expandedCard === "signup" ? "h-auto" : "h-40"}`}>
          <h2 className="text-2xl font-semibold mb-4 text-black">Sign Up</h2>
          <button
            onClick={() => handleToggle("signup")}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-xl hover:bg-green-600"
          >
            {expandedCard === "signup" ? "Close" : "Sign Up"}
          </button>

          {expandedCard === "signup" && (
            <div className="w-full mt-4">
              <input
                type="text"
                placeholder="First Name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-2 mb-2 border rounded text-black"
                />

                <input
                type="text"
                placeholder="Last Name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-2 mb-2 border rounded text-black"
                />

                <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(isValidEmail(e.target.value) ? "" : "Invalid email format");
                }}
                className="w-full p-2 mb-2 border rounded text-black"
                />
                {emailError && <p className="text-red-500 text-sm">{emailError}</p>}


                <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(isValidPassword(e.target.value) ? "" : "Password must be at least 8 characters");
                }}
                className="w-full p-2 mb-2 border rounded text-black"
                />
                {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}


                <input
                type="tel"
                placeholder="Phone"
                required
                value={phone}
                onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneError(isValidPhone(e.target.value) ? "" : "Phone number must be exactly 10 digits");
                }}
                className="w-full p-2 mb-4 border rounded text-black"
                />
                {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}


              {/* Terms and Privacy Checkboxes */}
              <div className="flex flex-col items-start w-full text-black text-sm">
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    required
                    onChange={() => handleOpenModal("terms")}
                    className="mr-2 cursor-pointer"
                  />
                  I accept the{" "}
                  <span className="text-blue-500 hover:underline cursor-pointer" onClick={() => handleOpenModal("terms")}>
                    Terms of Service
                  </span>
                </label>
                
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    required
                    onChange={() => handleOpenModal("privacy")}
                    className="mr-2 cursor-pointer"
                  />
                   I accept the{" "}
                  <span className="text-blue-500 hover:underline cursor-pointer" onClick={() => handleOpenModal("privacy")}>
                    Privacy Policy
                  </span>
                </label>

                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={acknowledgementAccepted}
                    required
                    onChange={() => handleOpenModal("acknowledgement")}
                    className="mr-2 cursor-pointer"
                  />
                  I acknowledge the{" "}
                  <span className="text-blue-500 hover:underline cursor-pointer" onClick={() => handleOpenModal("acknowledgement")}>
                    Acknowledgement of Service
                  </span>
                </label>
              </div>

            <button
                className={`w-full py-2 px-4 rounded-xl text-white ${
                    firstName && lastName && isValidEmail(email) && isValidPassword(password) && isValidPhone(phone)
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                disabled={!firstName || !lastName || !isValidEmail(email) || !isValidPassword(password) || !isValidPhone(phone)}
                onClick={handleSignUp}
                >
                Submit
            </button>

            </div>
          )}
        </div>
      </div>

        {/* Show Modal When Needed */}
      {activeModal && (
        <Terms
          onClose={() => setActiveModal(null)}
          onAccept={handleAcceptModal}
          modalType={activeModal} // Passes which modal is open
        />
      )}
    </div>
  );
}


