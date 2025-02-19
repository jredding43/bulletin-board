import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig.ts";
import { getAuth, sendEmailVerification, User } from "firebase/auth";
import { FaCamera } from "react-icons/fa";

interface UserProfileData {
  uid: string;
  profileId: string;
  jobId:string;
  messageId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePic?: string;
  education?: { school: string; degree: string; degreeLevel: string; year: string }[];
  workHistory?: { company: string; position: string; startyear: string; endyear:string }[];
  skills?: string[];
  certs?: string[];
  links?: string[];
  license?: string[];
  createdAt: any;
  emailVerified?: boolean;
  bio?: string;
  companyName?: {businessName: string; businessType: string; yearsInBusiness: string; companyWebsite:string; companyDescription: string; }[];
}

const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [bio, setBio] = useState("");

  // Input states for skills, certs, links, and license
  const [newSkills, setSkills] = useState("");
  const [newCerts, setCerts] = useState("");
  const [newLinks, setLinks] = useState("");
  const [newLicense, setLicense] = useState("");

  // New input states for adding education
  const [newSchool, setNewSchool] = useState("");
  const [newDegree, setNewDegree] = useState("");
  const [newYear, setNewYear] = useState("");
  const [degreeLevel, setDegreeLevel] = useState("");
  const degrees = ["AA", "AS", "BA", "BS", "MA", "MS", "PhD", "MBA", "MD", "JD", "Other"];

  //Work History
  const [newCompany, setNewCompany] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [newStartYear, setNewStartYear] = useState("");
  const [newEndYear, setNewEndYear] = useState("");

  // Personal company 
  const [newBusinessName, setNewBusinessName] = useState("");
  const [newBusinessType, setNewBusinessType] = useState("");
  const [newYearsInBusiness, setNewYearsInBusiness] = useState("");
  const [newCompanyWebsite, setNewCompanyWebsite] = useState("");
  const [newCompanyDescription, setNewCompanyDescription] = useState("");


  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
  
        if (userSnap.exists()) {
          const data = userSnap.data();
  
          // Helper function to extract values from objects in arrays
          const normalizeArray = (field: any, key: string) => {
            if (!field) return [];
            return field.map((item: any) => (typeof item === "object" ? item[key] : item));
          };
  
          setUserData({
            uid: data.uid || "",
            profileId: data.profileId || "",
            jobId: data.jobId || "",
            messageId: data.messageId || "",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phone: data.phone || "",
            bio: data.bio || "",
            createdAt: data.createdAt || null,
            emailVerified: data.emailVerified ?? false,
            skills: normalizeArray(data.skills, "Skills"),
            certs: normalizeArray(data.certs, "Certification"),
            links: Array.isArray(data.links) ? data.links : [],
            license: Array.isArray(data.license) ? data.license : [],
            education: Array.isArray(data.education) ? data.education : [],
            workHistory: Array.isArray(data.workHistory) ? data.workHistory : [],
            companyName: Array.isArray(data.companyName) ? data.companyName : [],
            profilePic: data.profilePic || localStorage.getItem(`profilePic-${userId}`) || null,
          });
  
          //  Set bio state separately to trigger auto-save later
          setBio(data.bio || "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
      setLoading(false);
    };
  
    // Fetch data when user logs in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthUser(user);
      if (user) fetchUserData();
    });
  
    return () => unsubscribe();
  }, [userId]);
  
  // Auto-Save Bio When It Changes (After 1.5s Delay)
  useEffect(() => {
    if (!userData || bio === userData.bio) return; // Prevent unnecessary updates
  
    const timeout = setTimeout(async () => {
      try {
        await updateDoc(doc(db, "users", userId), { bio });
        console.log("Bio auto-saved:", bio);
      } catch (error) {
        console.error("Error saving bio:", error);
      }
    }, 1500); // 1.5 seconds delay
  
    return () => clearTimeout(timeout);
  }, [bio, userId, userData?.bio]);
  
  

   /** Function to Add Education */
   const addEducation = async () => {
    if (!newSchool || !newDegree || !newYear || !degreeLevel) return;
    const newEntry = { 
      school: newSchool, 
      degreeLevel: degreeLevel, 
      degree: newDegree, 
      year: newYear };

    try {
      const updatedEducation = [...(userData?.education || []), newEntry];
      await updateDoc(doc(db, "users", userId), { education: updatedEducation });

      setUserData((prev) => prev ? { ...prev, education: updatedEducation } : null);
      setNewSchool(""); setNewDegree(""); setNewDegree(""); setNewYear(""); // Reset inputs
    } catch (error) {
      console.error("Error updating education:", error);
    }
  };

  /** Function to Add Work History */
  const addWorkHistory = async () => {
    if (!newCompany || !newPosition || !newStartYear || !newEndYear) return;
    
    const newEntry = { 
      company: newCompany, 
      position: newPosition, 
      startyear: newStartYear,  
      endyear: newEndYear 
    };

      try {
        const updatedWorkHistory = [...(userData?.workHistory || []), newEntry];
        await updateDoc(doc(db, "users", userId), { workHistory: updatedWorkHistory });
    
        setUserData((prev) => prev ? { ...prev, workHistory: updatedWorkHistory } : null);
        
        // Reset input fields after adding
        setNewCompany(""); 
        setNewPosition(""); 
        setNewStartYear(""); 
        setNewEndYear(""); 

    } catch (error) {
      console.error("Error updating work history:", error);
    }
  };
  
  const sendVerificationEmail = async () => {
    if (authUser && !authUser.emailVerified) {
      try {
        await sendEmailVerification(authUser);
        setVerificationSent(true);
      } catch (error) {
        console.error("Error sending verification email:", error);
      }
    }
  };

  
  const addStringEntry = async (key: keyof UserProfileData, newValue: string, setValue: any) => {
    if (!newValue.trim()) return;
  
    try {
      const updatedEntries = [...(userData?.[key] || []), String(newValue)]; // Ensure it's a string
  
      // Save to Firestore
      await updateDoc(doc(db, "users", userId), { [key]: updatedEntries });
  
      // Update React state immediately
      setUserData((prev) => prev ? { ...prev, [key]: updatedEntries } : null);
      setValue(""); // Reset input field
  
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
    }
  };

  const removeEntry = async (key: keyof UserProfileData, index: number) => {
    const updatedEntries = [...(userData?.[key] || [])];
    updatedEntries.splice(index, 1);

    setUserData((prev) => ({ ...prev!, [key]: updatedEntries }));

    await updateDoc(doc(db, "users", userId), { [key]: updatedEntries });
  };

  if (loading) return <p>Loading user data...</p>;
  if (!userData) return <p>User not found</p>;

  const renderStringSection = (title: string, key: keyof UserProfileData, newValue: string, setNewValue: any) => {
    let items = userData?.[key];
  
    //  Ensure it's an array before rendering
    if (!Array.isArray(items)) {
      console.warn(`Invalid data type for ${key}. Expected array, got:`, items);
      items = [];
    }
  
    return (
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
  
        {/* Render Existing Entries */}
        {items.length > 0 ? (
          <ul className="list-disc ml-5 text-gray-700">
            {items.map((item: string, index: number) => (
              <li key={index} className="flex justify-between items-center">
                {item}
                <button onClick={() => removeEntry(key, index)} className="text-red-500 text-sm">✖</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No {title.toLowerCase()} added yet.</p>
        )}
  
        {/* Input Field for New Entry */}
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder={`New ${title}`}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="p-2 border rounded w-full"
          />
          <button
            onClick={() => addStringEntry(key, newValue, setNewValue)}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Add
          </button>
        </div>
      </div>
    );
  };

  const removeEducation = async (index: number) => {
    if (!userData || !userData.education) return;
  
    const updatedEducation = [...userData.education];
    updatedEducation.splice(index, 1); // Remove selected entry
  
    try {
      await updateDoc(doc(db, "users", userId), { education: updatedEducation });
      setUserData((prev) => prev ? { ...prev, education: updatedEducation } : null);
    } catch (error) {
      console.error("Error removing education entry:", error);
    }
  };

  const removeWorkHistory = async (index: number) => {
    if (!userData || !userData.workHistory) return;
  
    const updatedWorkHistory = [...userData.workHistory];
    updatedWorkHistory.splice(index, 1); // Remove selected entry
  
    try {
      await updateDoc(doc(db, "users", userId), { workHistory: updatedWorkHistory });
      setUserData((prev) => prev ? { ...prev, workHistory: updatedWorkHistory } : null);
    } catch (error) {
      console.error("Error removing work history entry:", error);
    }
  };
  
  /** Handle Local Image Upload */
  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];

    // Convert file to Data URL (base64) for Local Storage
    const reader = new FileReader();
    reader.onload = () => {
      const localURL = reader.result as string;
      setProfilePic(localURL);
      localStorage.setItem(`profilePic-${userId}`, localURL); //Save image permanently
    };
    reader.readAsDataURL(file);
  };

  const addCompanyInfo = async () => {
    if (!userData) return;
  
    const newCompany = {
      businessName: newBusinessName,
      businessType: newBusinessType,
      yearsInBusiness: newYearsInBusiness,
      companyWebsite: newCompanyWebsite,
      companyDescription: newCompanyDescription,
    };
  
    try {
      const userRef = doc(db, "users", userData.uid);
      const updatedCompanyData = [...(userData.companyName || []), newCompany];
  
      await updateDoc(userRef, { companyName: updatedCompanyData });
  
      setUserData((prev) => prev ? { ...prev, companyName: updatedCompanyData } : null);
  
      // Clear input fields
      setNewBusinessName("");
      setNewBusinessType("");
      setNewYearsInBusiness("");
      setNewCompanyWebsite("");
      setNewCompanyDescription("");
    } catch (error) {
      console.error("Error updating company info:", error);
    }
  };

  const removeCompany = async (index: number) => {
    if (!userData || !userData.companyName) return;
  
    const updatedCompanies = [...userData.companyName];
    updatedCompanies.splice(index, 1); // Remove selected company
  
    try {
      await updateDoc(doc(db, "users", userData.uid), { companyName: updatedCompanies });
      setUserData((prev) => prev ? { ...prev, companyName: updatedCompanies } : null);
    } catch (error) {
      console.error("Error removing company entry:", error);
    }
  };
  
  const saveProfile = async () => {
    if (!userData) return;
  
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { 
        profileId: userData.profileId, 
        jobId: userData.jobId, 
        messageId: userData.messageId,
        bio,
        skills: userData.skills || [],
        certs: userData.certs || [],
        links: userData.links || [],
        license: userData.license || [],
        education: userData.education || [],
        workHistory: userData.workHistory || [],
        companyName: userData.companyName || [],
      });
  
      alert("Profile updated successfully!");
      console.log("✅ Profile saved:", userData);
    } catch (error) {
      console.error("🚨 Error saving profile:", error);
      alert("Error saving profile. Please try again.");
    }
  };
  
  
  
  

  return (
    <div className="bg-white p-6 shadow-lg rounded-lg max-w-3xl mx-auto border border-gray-300">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Profile Page</h2>

      {authUser && !authUser.emailVerified && (
        <div className="text-center p-4 bg-yellow-100 border border-yellow-400 rounded">
          <p className="text-yellow-700">Your email is not verified. Please verify to unlock full features.</p>
          <button 
            onClick={sendVerificationEmail} 
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
            disabled={verificationSent}
          >
            {verificationSent ? "Verification Email Sent!" : "Resend Verification Email"}
          </button>
        </div>
      )}

      {/* Profile Section */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5 flex flex-col items-center relative">
          {/* Display Profile Picture */}
          {profilePic ? (
            <img src={profilePic} alt="Profile" className="w-50 h-50 object-cover border-2 border-gray-300 shadow-md" />
          ) : (
            <span className="bg-gray-300 w-50 h-50 flex items-center justify-center text-gray-700">
              No Image
            </span>
          )}

          {/* Hidden File Input */}
          <input 
            type="file" 
            id="profile-upload" 
            className="hidden" 
            accept="image/*" 
            onChange={handleProfilePictureUpload} 
          />

          {/* Camera Icon Button */}
          <label 
            htmlFor="profile-upload" 
            className="absolute bottom-2 right-2 bg-gray-800 text-white p-2 cursor-pointer hover:bg-gray-600 transition-all"
          >
            <FaCamera size={18} />
          </label>
        </div>

        <div className="col-span-6 space-y-4">
          <input className="w-full p-2 border rounded" value={userData.firstName} readOnly placeholder="First Name" />
          <input className="w-full p-2 border rounded" value={userData.lastName} readOnly placeholder="Last Name" />
          <input className="w-full p-2 border rounded" value={userData.email} readOnly placeholder="Email" />
          <input className="w-full p-2 border rounded" value={userData.phone} readOnly placeholder="Phone" />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-xl font-semibold"></h3>
        <p><strong>Profile ID:</strong> {userData.profileId}</p>
        <p><strong>Job ID:</strong> {userData.jobId}</p>
        <p><strong>Message ID:</strong> {userData.messageId}</p>
      </div>


      <div className="w-full h-[6px] bg-black my-4"></div>

       {/* Bio Section */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-6">Bio</h3>
        <textarea
          className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
          rows={4}
          placeholder="Write something about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        ></textarea>
      </div>

      <h2 className="text-2xl font-bold my-6 text-center text-gray-800" >Additional Information</h2>
      <div className="w-full h-[6px] bg-black my-4"></div>

      {/* Company Information Section */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold">Company Information</h3>
        
        <ul className="list-disc ml-5 text-gray-700">
          {Array.isArray(userData.companyName) && userData.companyName.length > 0 ? (
            userData.companyName.map((cmp, index) => (
              <li key={index} className="flex flex-col gap-1">
                <span className="text-xl"> <strong>{cmp.businessName}</strong></span>
                <span> License #: {cmp.businessType} ({cmp.yearsInBusiness} years in business)</span>
                <span>
                   <a href={cmp.companyWebsite} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                    {cmp.companyWebsite}
                  </a>
                </span>
                <p className="text-gray-700">{cmp.companyDescription}</p>


                {/* Remove Company Button */}
                <button 
                  onClick={() => removeCompany(index)} 
                  className="text-red-500 text-sm mt-2 hover:text-red-700 transition-all"
                >
                  ✖ Remove
                </button>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No company information available.</p>
          )}
        </ul>

        {/* Input Fields for New Company */}
        <div className="flex flex-col gap-2 mt-2">
          <input 
            type="text" 
            placeholder="Business Name" 
            value={newBusinessName} 
            onChange={(e) => setNewBusinessName(e.target.value)} 
            className="p-2 border rounded" 
          />

          <input 
            type="text" 
            placeholder="Business Type (LLC, Inc, etc.)" 
            value={newBusinessType} 
            onChange={(e) => setNewBusinessType(e.target.value)} 
            className="p-2 border rounded" 
          />

          <input 
            type="text" 
            placeholder="Years in Business" 
            value={newYearsInBusiness} 
            onChange={(e) => setNewYearsInBusiness(e.target.value)} 
            className="p-2 border rounded" 
          />

          <input 
            type="text" 
            placeholder="Company Website" 
            value={newCompanyWebsite} 
            onChange={(e) => setNewCompanyWebsite(e.target.value)} 
            className="p-2 border rounded" 
          />

          <textarea 
            placeholder="Company Description" 
            value={newCompanyDescription} 
            onChange={(e) => setNewCompanyDescription(e.target.value)} 
            className="p-2 border rounded" 
          ></textarea>

          <button 
            onClick={addCompanyInfo} 
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Add
          </button>
        </div>
      </div>



      {/* Education Section */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold">Education</h3>
        <ul className="list-disc ml-5 text-gray-700">
          {userData.education?.map((edu, index) => (
            <li key={index} className="flex justify-between items-center">
              🎓 {edu.degreeLevel} of {edu.degree} at {edu.school} ({edu.year})
              <button 
                onClick={() => removeEducation(index)} 
                className="text-red-500 text-sm"
              >
                ✖
              </button>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2 mt-2">
          <input 
          type="text" 
          placeholder="School" 
          value={newSchool} 
          onChange={(e) => setNewSchool(e.target.value)} 
          className="p-2 border rounded" />

          <input
          type="text"
          list="degrees"
          placeholder="Select Degree Level"
          value={degreeLevel}
          onChange={(e) => setDegreeLevel(e.target.value)}
          className="p-2 border rounded"
        />
        <datalist id="degrees">
          {degrees.map((deg) => (
            <option key={deg} value={deg} />
          ))}
        </datalist>

          <input 
          type="text" 
          placeholder="Degree" 
          value={newDegree} 
          onChange={(e) => setNewDegree(e.target.value)} 
          className="p-2 border rounded" />

          <input 
          type="text" 
          placeholder="Graduated Year" 
          value={newYear} 
          onChange={(e) => setNewYear(e.target.value)} 
          className="p-2 border rounded" />

          <button onClick={addEducation} className="bg-blue-500 text-white px-3 py-1 rounded">Add</button>
        </div>
      </div>

      {/* Work History Section */}
      <div className="mt-6 mb-6">
        <h3 className="text-xl font-semibold">Work History</h3>
        <ul className="list-disc ml-5 text-gray-700">
          {userData.workHistory?.map((work, index) => (
            <li key={index} className="flex justify-between items-center">
              🏢 {work.position} at {work.company} from {work.startyear} to {work.endyear}
              <button 
                onClick={() => removeWorkHistory(index)} 
                className="text-red-500 text-sm"
              >
                ✖
              </button>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2 mt-2">
          <input type="text" placeholder="Company" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} className="p-2 border rounded" />
          <input type="text" placeholder="Position" value={newPosition} onChange={(e) => setNewPosition(e.target.value)} className="p-2 border rounded" />
          <input type="text" placeholder="Start Year" value={newStartYear} onChange={(e) => setNewStartYear(e.target.value)} className="p-2 border rounded" />
          <input type="text" placeholder="End Year" value={newEndYear} onChange={(e) => setNewEndYear(e.target.value)} className="p-2 border rounded" />
          <button onClick={addWorkHistory} className="bg-blue-500 text-white px-3 py-1 rounded">Add</button>
        </div>
      </div>

      <div className="w-full h-[6px] bg-black my-4"></div>

      {renderStringSection("Skills", "skills", newSkills, setSkills)}
      {renderStringSection("Certifications", "certs", newCerts, setCerts)}
      {renderStringSection("Links", "links", newLinks, setLinks)}
      {renderStringSection("Licenses", "license", newLicense, setLicense)}

      <button
        onClick={saveProfile}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-all w-full mt-4"
      >
        Save Changes
      </button>

    </div>

    
  );
};

export default UserProfile;
