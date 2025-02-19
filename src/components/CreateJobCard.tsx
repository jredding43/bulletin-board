import React, { useState, useEffect } from "react";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig.ts";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import jobCategories from "../data/jobCategories.json";

const CreateJobCard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [compensationType, setCompensationType] = useState("salary"); 
  const [compensation, setCompensation] = useState(""); 
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [jobLocation, setJobLocation] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [companyBenefits, setCompanyBenefits] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobCategory, setJobCategory] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const auth = getAuth();

  // Ensure currentUser is set correctly
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

 // Compensation Input Handling
 const handleCompensationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value.replace(/[^0-9.]/g, ""); // Allow only numbers and one decimal

  // Prevent multiple decimals
  if (value.split(".").length > 2) {
    value = value.substring(0, value.lastIndexOf("."));
  }

  setCompensation(value);
};
  
const handleSaveJobCard = async () => {
  if (!currentUser) {
    setMessage("You must be logged in to create a job card.");
    return;
  }

  // Validate required fields
  const newErrors: Record<string, string> = {};
  if (!jobTitle) newErrors.jobTitle = "Job Title is required.";
  if (!companyName) newErrors.companyName = "Company Name is required.";
  if (!jobDescription) newErrors.jobDescription = "Job Description is required.";
  if (!compensation || parseFloat(compensation) <= 0) {
    newErrors.compensation = "Enter a valid Salary or Hourly Rate.";
  }
  if (!jobLocation) newErrors.jobLocation = "Job Location is required.";
  if (!jobCategory) newErrors.jobCategory = "Please select a Job Category.";

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    setMessage("Please fill out all required fields.");
    return;
  }

  setIsSubmitting(true);

  try {
    // 🔹 Fetch user document to get profileId and jobId
    const userRef = doc(db, "users", currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      setMessage("User profile not found.");
      setIsSubmitting(false);
      return;
    }

    const userData = userSnap.data();
    const profileId = userData.profileId || null;
    const jobId = userData.jobId || null;

    if (!profileId || !jobId) {
      setMessage("Error retrieving profileId or jobId. Please try again.");
      setIsSubmitting(false);
      return;
    }

    // 🔹 Save job data with profileId instead of creatorId
    const jobRef = collection(db, "jobCards");
    await addDoc(jobRef, {
      jobId, // Attach jobId from user profile
      profileId, // Use profileId instead of creatorId
      jobTitle,
      companyName,
      jobDescription,
      responsibilities,
      salary: compensationType === "salary" ? compensation : "",
      hourly: compensationType === "hourly" ? compensation : "",
      employmentType,
      jobLocation,
      requiredSkills,
      companyBenefits,
      jobCategory,
      createdAt: new Date(),
    });

    // Reset form
    setMessage("Job card created successfully!");
    setJobTitle("");
    setCompanyName("");
    setJobDescription("");
    setResponsibilities("");
    setCompensation("");
    setEmploymentType("Full-time");
    setJobLocation("");
    setRequiredSkills([]);
    setJobCategory("");
    setErrors({});
    setCompanyBenefits("");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ Error saving job card:", error);
      setMessage(`Failed to save job card: ${error.message}`);
    } else {
      console.error("An unknown error occurred:", error);
      setMessage("An unexpected error occurred.");
    }
  }

  setIsSubmitting(false);
};

 
const handleAddSkill = () => {
  if (newSkill.trim()) {
    setRequiredSkills([...requiredSkills, newSkill]);
    setNewSkill("");
  }
};
  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-300 max-w-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Create Job Posting</h2>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold">Job Category*</label>
        <select
          className={`w-full p-2 border rounded-lg focus:ring ${errors.jobCategory ? "border-red-500" : "focus:ring-blue-300"}`}
          value={jobCategory}
          onChange={(e) => setJobCategory(e.target.value)}
        >
          <option value="">Select a category</option>
          {jobCategories.map((categoryObj, index) => (
            <optgroup key={index} label={categoryObj.category}>
              {categoryObj.jobs.map((job, jIndex) => (
                <option key={jIndex} value={job}>{job}</option>
              ))}
            </optgroup>
          ))}
        </select>
        {errors.jobCategory && <p className="text-red-500 text-sm mt-1">{errors.jobCategory}</p>}
      </div>



      <div className="mb-4">
        <label className="block text-gray-700 font-semibold">Job Title*</label>
        <input
          type="text"
          className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
          placeholder="Enter job title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          onBlur={() => {
            if (!jobTitle) setErrors((prev) => ({ ...prev, jobTitle: "Job Title is required." }));
            else setErrors((prev) => ({ ...prev, jobTitle: "" }));
          }}
        />
        {errors.jobTitle && <p className="text-red-500 text-sm">{errors.jobTitle}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold">Company Name / Person Name*</label>
        <input
          type="text"
          className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
          placeholder="Enter company/person Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          onBlur={() => {
            if (!companyName) setErrors((prev) => ({ ...prev, companyName: "Job Title is required." }));
            else setErrors((prev) => ({ ...prev, companyName: "" }));
          }}
        />
        {errors.companyName && <p className="text-red-500 text-sm">{errors.companyName}</p>}
      </div>

      <div className="mb-4">
        {/* Compensation */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold">Compensation*</label>
          <div className="flex gap-2">
            <select
              className="w-1/3 p-2 border rounded-lg focus:ring focus:ring-blue-300"
              value={compensationType}
              onChange={(e) => setCompensationType(e.target.value)}
            >
              <option value="salary">Salary</option>
              <option value="hourly">Hourly</option>
            </select>
            <input
              type="text"
              className={`w-2/3 p-2 border rounded-lg ${errors.compensation ? "border-red-500" : "focus:ring focus:ring-blue-300"}`}
              placeholder={compensationType === "hourly" ? "Enter hourly rate" : "Enter salary amount"}
              value={compensation}
              onChange={handleCompensationChange}
            />
          </div>
          {errors.compensation && <p className="text-red-500 text-sm mt-1">{errors.compensation}</p>}
        </div>

          {errors.compensation && <p className="text-red-500 text-sm mt-1">{errors.compensation}</p>}

          {/* Hidden fields to store correct data */}
          <input type="hidden" name="salary" value={compensationType === "salary" ? compensation : ""} />
          <input type="hidden" name="hourly" value={compensationType === "hourly" ? compensation : ""} />
        </div>


      <div className="mb-4">
        <label className="block text-gray-700 font-semibold">Job Location*</label>
        <input
          type="text"
          className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
          placeholder="Enter job location"
          value={jobLocation}
          onChange={(e) => setJobLocation(e.target.value)}
          onBlur={() => {
            if (!jobLocation) setErrors((prev) => ({ ...prev, jobLocation: "Job Location is required." }));
            else setErrors((prev) => ({ ...prev, jobLocation: "" }));
          }}
        />
        {errors.jobLocation && <p className="text-red-500 text-sm">{errors.jobLocation}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold">Employment Type</label>
        <select
          className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
          value={employmentType}
          onChange={(e) => setEmploymentType(e.target.value)}
          onBlur={() => {
            if (!employmentType) setErrors((prev) => ({ ...prev, employmentType: "Employment Type is required." }));
            else setErrors((prev) => ({ ...prev, employmentType: "" }));
          }}
        >
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Temporary">Temporary</option>
          <option value="Weekend">Weekend</option>
          <option value="Day">Day</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold">Required Skills</label>
        <div className="flex gap-2">
          <input
            type="text"
            className="w-full p-2 border rounded-lg"
            placeholder="Add a skill"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleAddSkill}>Add</button>
        </div>
        <ul className="mt-2 text-gray-600">
          {requiredSkills.map((skill, index) => <li key={index}>- {skill}</li>)}
        </ul>
        {errors.newSkill && <p className="text-red-500 text-sm">{errors.newSkill}</p>}
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold">Job Description*</label>
        <textarea
          className="w-full h-100 p-2 border rounded-lg focus:ring focus:ring-blue-300"
          placeholder="Describe the job role"
          rows={3}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          onBlur={() => {
            if (!jobDescription) setErrors((prev) => ({ ...prev, jobDescription: "Description is required." }));
            else setErrors((prev) => ({ ...prev, jobDescription: "" }));
          }}
        ></textarea>
        {errors.jobDescription && <p className="text-red-500 text-sm">{errors.jobDescription}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold">Company Benefits*</label>
        <textarea
          className="w-full h-100 p-2 border rounded-lg focus:ring focus:ring-blue-300"
          placeholder="Describe the job role"
          rows={3}
          value={companyBenefits}
          onChange={(e) => setCompanyBenefits(e.target.value)}
          onBlur={() => {
            if (!companyBenefits) setErrors((prev) => ({ ...prev, companyBenefits: "Description is required." }));
            else setErrors((prev) => ({ ...prev, companyBenefits: "" }));
          }}
        ></textarea>
        {errors.companyBenefts && <p className="text-red-500 text-sm">{errors.companyBenefits}</p>}
      </div>

      <button
        className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        onClick={handleSaveJobCard}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : "Post Job"}
      </button>

      {message && <p className="text-center text-gray-700 mt-3">{message}</p>}
    </div>
  );
};

export default CreateJobCard;
