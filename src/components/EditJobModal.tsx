import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig.ts";
import { JobPost } from "../types";


interface EditJobModalProps {
    job: JobPost | null;
    onClose: () => void;
    onSave: (updatedJob: JobPost) => void; 
  }

const EditJobModal: React.FC<EditJobModalProps> = ({ job, onClose, onSave }) => {
  const [formData, setFormData] = useState<JobPost>(
    job
      ? {
          ...job,
          jobId: job.jobId || "", // Ensure jobId is retained
          profileId: job.profileId || "", // Ensure profileId is retained
          requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills : [],
          category: job.category || "",
        }
      : {
          id: "",
          jobId: "", 
          profileId: "", 
          jobTitle: "",
          companyName: "",
          jobDescription: "",
          responsibilities: "",
          salary: "",
          hourly: "",
          employmentType: "",
          jobLocation: "",
          requiredSkills: [],
          companyBenefits: "",
          category: "",
        }
  );
  
      

  const [newSkill, setNewSkill] = useState("");

  if (!job) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setFormData((prev) => ({
        ...prev,
        requiredSkills: [...(Array.isArray(prev.requiredSkills) ? prev.requiredSkills : []), newSkill],
      }));
      setNewSkill("");
    }
  };
  
  const handleSave = async () => {
    try {
      const jobRef = doc(db, "jobCards", formData.id);
  
      // Always include salary/hourly, even if set to "0"
      const updatedData: Partial<JobPost> = {
        jobId: formData.jobId, 
        profileId: formData.profileId,
        jobTitle: formData.jobTitle,
        companyName: formData.companyName,
        jobDescription: formData.jobDescription,
        responsibilities: formData.responsibilities,
        employmentType: formData.employmentType,
        jobLocation: formData.jobLocation,
        requiredSkills: formData.requiredSkills,
        companyBenefits: formData.companyBenefits,
        salary: formData.salary !== "" ? formData.salary : "0", 
        hourly: formData.hourly !== "" ? formData.hourly : "0",
      };
  
      await updateDoc(jobRef, updatedData);
  
      onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };  

  return (
    <div className="fixed inset-0 bg-opacity-80 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-300 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Job Posting</h2>

        <label className="block">Job Title</label>
        <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="w-full p-2 border rounded" />

        <label className="block mt-2">Company Name</label>
        <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full p-2 border rounded" />

        {/* Salary or Hourly Wage Section */}
        <div className="mt-4">
            <h3 className="text-lg font-bold text-gray-800">Compensation</h3>

            {/* Salary Input (Always Show) */}
            <label className="block">
                Salary:
                <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    placeholder="Enter salary amount"
                />
            </label>

            {/* Hourly Input (Always Show) */}
            <label className="block mt-2">
                Hourly:
                <input
                    type="text"
                    name="hourly"
                    value={formData.hourly}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    placeholder="Enter hourly rate"
                />
            </label>
        </div>


        <label className="block mt-2">Employment Type</label>
        <select name="employmentType" value={formData.employmentType} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Temporary">Temporary</option>
        </select>

        <label className="block mt-2">Job Location</label>
        <input type="text" name="jobLocation" value={formData.jobLocation} onChange={handleChange} className="w-full p-2 border rounded" />

        
        <label className="block mt-2">Job Description</label>
        <textarea name="jobDescription" value={formData.jobDescription} onChange={handleChange} className="w-full p-2 border rounded h-50" />

        <label className="block mt-2">Company Benefits</label>
        <textarea name="companyBenefits" value={formData.companyBenefits} onChange={handleChange} className="w-full p-2 border rounded h-50" />

        <label className="block mt-2">Required Skills</label>
        <div className="flex gap-2">
          <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} className="w-full p-2 border rounded" />
          <button onClick={handleAddSkill} className="bg-blue-500 text-white px-4 py-2 rounded">Add</button>
        </div>
        <ul className="mt-2 text-gray-600">
        {(formData.requiredSkills ?? []).map((skill, index) => (
            <li key={index}>- {skill}</li>
        ))}
        </ul>

        {/* Close Card */}
        <button 
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-all"
            onClick={onClose}
        >
            Close Card
        </button>

        {/* Save Changes */}
        <button 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-all"
            onClick={handleSave}
        >
            Save Changes
        </button>
    </div>

      </div>
  );
};

export default EditJobModal;
