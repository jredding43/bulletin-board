import { Timestamp } from "firebase/firestore";

/**
 * Job Post Data
 */
export interface JobPost {
  id: string;
  jobId: string;
  profileId: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  responsibilities?: string;
  salary?: string;
  hourly?: string;
  employmentType?: string;
  jobLocation?: string;
  requiredSkills?: string[];
  companyBenefits?: string;
  isFollowed?: boolean;
  category: string;
  timestamp?: Timestamp;
}

/**
 * User Profile Data
 */
export interface UserProfileData {
  uid: string;
  profileId: string;
  jobId:string;
  messageId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePic?: string;
  bio?: string;
  companyName?: {
    businessName: string;
    businessType: string;
    yearsInBusiness: string;
    companyWebsite?: string;
    companyDescription?: string;
  }[];
  education?: {
    school: string;
    degree: string;
    year: string;
  }[];
  workHistory?: {
    company: string;
    position: string;
    years: string;
  }[];
  skills?: string[];
  certs?: string[];
  links?: string[];
  license?: string[];
  createdAt?: Timestamp;
  emailVerified?: boolean;
}

/**
 * Job Inquiry (User Applying for a Job)
 */
export interface JobInquiry {
  id: string;
  userId: string;
  jobId: string;
  userName: string;
  message: string;
  timestamp: Timestamp;
}

/**
 * Messages Between Users
 */
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  jobId?: string;
  text: string;
  timestamp: Timestamp;
}

