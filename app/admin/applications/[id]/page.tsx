import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { Application, Education, Experience, Project } from '../../../types/application';
import Link from 'next/link';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ id: string }>;
};


export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;                           
    return {
      title: `Application ${id}`,
    };
}

export default async function ApplicationPage({ params }: Props) {
    const { id } = await params;                           
    const { db } = await connectToDatabase();
    const application = await db
      .collection('applications')
      .findOne({ _id: new ObjectId(id) }) as Application | null;

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Application Not Found</h1>
        <p className="mb-4">The requested application could not be found.</p>
        <Link href="/admin/applications" className="text-blue-600 hover:underline">
          &larr; Back to Applications
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-20">
      <div className="mb-6">
        <Link href="/admin/applications" className="text-blue-600 hover:underline">
          &larr; Back to Applications
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">
        Application from {application.firstName} {application.lastName}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
            Personal Information
          </h2>
          <div className="mb-3">
            <span className="font-medium text-gray-700">Email:</span>
            <span className="ml-2">{application.email}</span>
          </div>
          <div className="mb-3">
            <span className="font-medium text-gray-700">Phone:</span>
            <span className="ml-2">{application.phone || 'Not provided'}</span>
          </div>
          <div className="mb-3">
            <span className="font-medium text-gray-700">Location:</span>
            <span className="ml-2">
              {application.city}, {application.state}
            </span>
          </div>
          <div className="mb-3">
            <span className="font-medium text-gray-700">Address:</span>
            <span className="ml-2">{application.addressLine1 || 'Not provided'}</span>
          </div>
        </div>
        
        {/* Application Questions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
            Application Questions
          </h2>
          <div className="mb-3">
            <span className="font-medium text-gray-700">Over 18:</span>
            <span className="ml-2">{application.isOver18 || 'Not answered'}</span>
          </div>
          <div className="mb-3">
            <span className="font-medium text-gray-700">Authorized to work:</span>
            <span className="ml-2">{application.isAuthorizedToWork || 'Not answered'}</span>
          </div>
          <div className="mb-3">
            <span className="font-medium text-gray-700">Requires sponsorship:</span>
            <span className="ml-2">{application.requiresSponsorship || 'Not answered'}</span>
          </div>
        </div>
        
        {/* Education */}
        {application.education && application.education.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
              Education
            </h2>
            {application.education.map((edu: Education, i: number) => (
              <div key={i} className="mb-4">
                <h3 className="font-semibold">{edu.degree}</h3>
                <p>{edu.institution}</p>
                <p>{edu.score} - {edu.completionYear}</p>
              </div>
            ))}
          </div>
        )}
        
        {/* Experience */}
        {application.experience && application.experience.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
              Work Experience
            </h2>
            {application.experience.map((exp: Experience, i: number) => (
              <div key={i} className="mb-4">
                <h3 className="font-semibold">{exp.jobTitle}</h3>
                <p>{exp.employerName}</p>
                <p>{exp.startDate} - {exp.currentJob ? 'Present' : exp.endDate}</p>
              </div>
            ))}
          </div>
        )}
        
        {/* Documents */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
            Documents
          </h2>
          <div className="mb-4">
            <p className="font-medium text-gray-700">Resume:</p>
            {application.resumeUrl ? (
              <a 
                href={application.resumeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Download Resume
              </a>
            ) : (
              <p>Not provided</p>
            )}
          </div>
          <div className="mb-4">
            <p className="font-medium text-gray-700">Cover Letter:</p>
            {application.coverLetterUrl ? (
              <a 
                href={application.coverLetterUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Download Cover Letter
              </a>
            ) : (
              <p>Not provided</p>
            )}
          </div>
        </div>
        
        {/* Projects */}
        {application.projects && application.projects.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
              Projects
            </h2>
            {application.projects.map((project: Project, i: number) => (
              <div key={i} className="mb-4">
                <h3 className="font-semibold">{project.title}</h3>
                <p className="text-gray-600">{project.description}</p>
                <p className="text-sm text-gray-500">{project.date}</p>
              </div>
            ))}
          </div>
        )}
        
        {/* Links */}
        {application.links && application.links.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
              Links
            </h2>
            <ul>
              {application.links.map((link: string, i: number) => (
                <li key={i} className="mb-2">
                  <a 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}