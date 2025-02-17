import React from "react";
import { FaMoneyBillWave, FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";
import { JobPost, UserProfileData } from "../types";
import { collection, addDoc, getDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig.ts";

interface JobDetailsModalProps {
  selectedJob: JobPost | null;
  userData?: UserProfileData | null;
  onClose: () => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ selectedJob, userData, onClose }) => {
  if (!selectedJob) return null;

  console.log("✅ JobDetailsModal Loaded - userData:", userData);

  // ✅ Improved validation and debugging
  const handleSendCard = async () => {
    console.log("🔍 Debugging userData before sending card:", userData);

    if (!userData || typeof userData !== "object" || !userData.uid) {
      console.error("🚨 Error: userData is missing or invalid:", userData);
      alert("Error: Cannot send profile card. User data is missing.");
      return;
    }

    if (!selectedJob?.id) {
      console.error("🚨 Error: Job ID is missing.");
      return;
    }

    try {
      console.log("📡 Fetching job post data...");
      const jobRef = doc(db, "jobCards", selectedJob.id);
      const jobSnap = await getDoc(jobRef);

      if (!jobSnap.exists()) {
        console.error("🚨 Error: Job post not found in Firestore.");
        return;
      }

      const jobData = jobSnap.data();
      console.log("📌 Retrieved job data:", jobData);

      const creatorId = jobData?.creatorId;
      if (!creatorId) {
        console.error("🚨 Error: Job creator ID not found.");
        return;
      }

      console.log(`📨 Sending card from ${userData.uid} to ${creatorId}`);

      await addDoc(collection(db, "messages"), {
        senderId: userData.uid,
        receiverId: creatorId,
        senderName: `${userData.firstName} ${userData.lastName}`,
        messageType: "profile_card",
        profileCardData: userData, 
        jobId: selectedJob.id,  
        jobTitle: selectedJob.jobTitle,  
        timestamp: serverTimestamp(),
      });
      

      console.log("✅ Profile card sent successfully!");
      alert("Profile card sent successfully!");
    } catch (error) {
      console.error("🚨 Error sending profile card:", error);
      alert("Error sending profile card. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition-all"
          onClick={onClose}
        >
          ✖
        </button>

        {/* Job Title & Company */}
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          {selectedJob?.jobTitle || "Untitled Job"}
        </h2>
        <p className="text-gray-700 font-semibold text-center">
          {selectedJob?.companyName || "Unknown Company"}
        </p>

        {/* Job Details Section */}
        <div className="mt-4 space-y-3">
          {/* Compensation */}
          {selectedJob?.hourly && selectedJob.hourly !== "0" ? (
            <p className="text-gray-600 flex items-center">
              <FaMoneyBillWave className="mr-2 text-yellow-500" /> Hourly: {selectedJob.hourly}/hr
            </p>
          ) : selectedJob?.salary && selectedJob.salary !== "0" ? (
            <p className="text-gray-600 flex items-center">
              <FaMoneyBillWave className="mr-2 text-yellow-500" /> Salary: ${selectedJob.salary} per year
            </p>
          ) : (
            <p className="text-gray-600 flex items-center">
              <FaMoneyBillWave className="mr-2 text-yellow-500" /> Compensation not specified
            </p>
          )}

          <p className="text-gray-600 flex items-center">
            <FaMapMarkerAlt className="mr-2 text-blue-500" /> {selectedJob?.jobLocation || "Location not provided"}
          </p>
          <p className="text-gray-600 flex items-center">
            <FaCheckCircle className="mr-2 text-green-500" /> Employment Type: {selectedJob?.employmentType || "Not specified"}
          </p>
        </div>

        {/* Required Skills */}
        <div className="mt-4">
          <h3 className="text-lg font-bold text-gray-800">Required Skills</h3>
          {selectedJob?.requiredSkills && selectedJob.requiredSkills.length > 0 ? (
            <ul className="text-gray-700 mt-2 list-disc pl-5">
              {selectedJob.requiredSkills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No specific skills listed</p>
          )}
        </div>

        {/* Job Description */}
        <div className="mt-4">
          <h3 className="text-lg font-bold text-gray-800">Job Description</h3>
          <p className="text-gray-700 mt-2">{selectedJob?.jobDescription || "No description available"}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-between mt-6 gap-2">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all"
            onClick={() => {
              console.log("🛠️ userData at button click:", userData);
              handleSendCard();
            }}
          >
            Send Card
          </button>

          <button 
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all"
            onClick={() => {
              console.log("Report Card clicked");
              onClose(); 
            }}
          >
            Report Card
          </button>

          <button 
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-all"
            onClick={onClose}
          >
            Close Card
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
