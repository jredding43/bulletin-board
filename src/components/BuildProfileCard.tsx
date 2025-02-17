import React from "react";
import { UserProfileData } from "../types";

const formatText = (text: string | undefined) => {
  return text?.split("\n").map((line, index) => (
    <p key={index} className="text-gray-700">{line}</p>
  ));
};

interface ProfileCardProps {
  userData: UserProfileData;
  onSend?: (profile: UserProfileData) => void; // Optional function for sending the card
}

const ProfileCard: React.FC<ProfileCardProps> = ({ userData, onSend }) => {
  if (!userData) return <p className="text-center">No profile data available.</p>;

  const {
    firstName,
    lastName,
    email,
    phone,
    profilePic,
    bio,
    companyName = [],
    education = [],
    workHistory = [],
    skills = [],
    certs = [],
    links = [],
    license = [],
    emailVerified,
  } = userData;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-300 max-w-xl mx-auto">
      {/* Profile Picture & Name */}
      <div className="flex flex-col items-center">
        <img
          src={profilePic || "/default-profile.png"}
          alt="Profile"
          className="w-32 h-32 object-cover rounded-full border-2 border-gray-300 shadow-md"
        />
        {(firstName || lastName) && (
          <h2 className="text-2xl font-bold text-gray-800 mt-4">
            {firstName ?? ""} {lastName ?? ""}
          </h2>
        )}
        {bio && <div className="mt-2 text-gray-600">{formatText(bio)}</div>}
      </div>

      {/* Contact Info */}
      {(email || phone) && (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-lg font-semibold">Contact Info</h3>
          {email && <p className="text-gray-700">📧 {email}</p>}
          {phone && <p className="text-gray-700">📞 {phone}</p>}
        </div>
      )}

      {/* Email Verification & Account Creation Date */}
      {emailVerified === false && (
        <p className="text-red-500 mt-2 text-center">⚠️ Email not verified</p>
      )}

      {/* Business Section */}
      {companyName.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-lg font-semibold">Company Information</h3>
          <ul className="list-disc ml-5 text-gray-700">
            {companyName.map((cmp, index) => (
              <li key={index} className="flex flex-col gap-1 mb-3">
                <span className="text-xl font-bold">{cmp.businessName}</span>
                <span> License #: {cmp.businessType} ({cmp.yearsInBusiness} years in business)</span>
                {cmp.companyWebsite && (
                  <a
                    href={cmp.companyWebsite}
                    className="text-blue-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {cmp.companyWebsite}
                  </a>
                )}
                {cmp.companyDescription && <div className="text-gray-700">{formatText(cmp.companyDescription)}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Education Section */}
      {education.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-lg font-semibold">Education</h3>
          <ul className="list-disc ml-5 text-gray-700">
            {education.map((edu, index) => (
              <li key={index}>🎓 {edu.degree} at {edu.school} ({edu.year})</li>
            ))}
          </ul>
        </div>
      )}

      {/* Work History Section */}
      {workHistory.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-lg font-semibold">Work Experience</h3>
          <ul className="list-disc ml-5 text-gray-700">
            {workHistory.map((work, index) => (
              <li key={index}>🏢 {work.position} at {work.company} ({work.years} years)</li>
            ))}
          </ul>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-lg font-semibold">Skills</h3>
          <p className="text-gray-700">{skills.join(", ")}</p>
        </div>
      )}

      {/* Certifications */}
      {certs.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-lg font-semibold">Certifications</h3>
          <ul className="list-disc ml-5 text-gray-700">
            {certs.map((cert, index) => (
              <li key={index}>🏅 {cert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Links */}
      {links.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-lg font-semibold">Links</h3>
          <ul className="list-disc ml-5 text-blue-500">
            {links.map((link, index) => (
              <li key={index}>
                🔗 <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Licenses */}
      {license.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-lg font-semibold">Licenses</h3>
          <ul className="list-disc ml-5 text-gray-700">
            {license.map((lic, index) => (
              <li key={index}>📜 {lic}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Send Card Button */}
      {onSend && (
        <div className="mt-6">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
            onClick={() => onSend(userData)}
          >
            Send Profile Card
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
