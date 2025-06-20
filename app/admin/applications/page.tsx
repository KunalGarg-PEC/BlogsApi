// Ensure this page always re-runs on every request
export const dynamic = 'force-dynamic';

import { connectToDatabase } from '@/lib/mongodb';
import { Application } from '../../types/application';
import Link from 'next/link';
import { ObjectId } from 'mongodb';

// Helper type for MongoDB document with ObjectId
interface MongoApplication extends Omit<Application, '_id'> {
  _id: ObjectId;
  createdAt: Date;
}

export default async function ApplicationsPage() {
  const { db } = await connectToDatabase();
  
  // Fetch applications with proper typing
  const mongoApplications = await db
    .collection('applications')
    .find({})
    .sort({ createdAt: -1 })
    .toArray() as MongoApplication[];

  // Convert MongoDB documents to Application type
  const applications: Application[] = mongoApplications.map(app => ({
    ...app,
    _id: app._id.toString(),
    createdAt: app.createdAt
  }));

  return (
    <div className="max-w-6xl mx-auto p-6 mt-20">
      <h1 className="text-2xl font-bold mb-6">Job Applications</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                JobId
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((app) => (
              <tr key={app._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {app.firstName} {app.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {app.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {app.phone || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(app.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link 
                    href={`/admin/applications/${app._id}`} 
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Details
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {app.jobId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {applications.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No applications found</p>
        </div>
      )}
    </div>
  );
}