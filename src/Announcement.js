import React, { useState, useEffect } from 'react';
import { Bell, Calendar, AlertCircle, CheckCircle, Info } from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from './baseurl';

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'update':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'notice':
      default:
        return <Info className="w-5 h-5 text-amber-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'alert':
        return 'bg-red-50 text-red-700 border-red-200 ring-red-200';
      case 'update':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-200';
      case 'notice':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-200';
    }
  };

  const getCardBorderColor = (type) => {
    switch (type.toLowerCase()) {
      case 'alert':
        return 'border-l-red-400';
      case 'update':
        return 'border-l-blue-400';
      case 'notice':
      default:
        return 'border-l-amber-400';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter to show only active announcements
  const activeAnnouncements = announcements.filter(announcement => 
    announcement.status === 'Active'
  );

  useEffect(() => {
    getAnnouncements();
  }, []);

  const getAnnouncements = async () => {
    try {
   let response=await axios.get(`${BASE_URL}/get-announcements`)
   console.log(response.data)
   
      setAnnouncements(response.data.announements);
    } catch (e) {
      console.error('Error fetching announcements:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Active Announcements</h1>
              <div className="flex items-center justify-center mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm font-medium text-green-600">Current Updates</span>
              </div>
            </div>
          </div>
          <p className="text-lg text-gray-600">Current important updates and notifications</p>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {activeAnnouncements.length === 0 ? (
            <div className="text-center py-16">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active announcements</h3>
              <p className="text-gray-500">There are currently no active announcements to display.</p>
            </div>
          ) : (
            activeAnnouncements.map((announcement) => (
              <div
                key={announcement._id}
                className={`bg-white rounded-lg shadow-sm border-l-4 ${getCardBorderColor(announcement.type)} border-t border-r border-b border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:translate-y-[-1px]`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      {getTypeIcon(announcement.type)}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{announcement.title}</h2>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getTypeColor(announcement.type)}`}>
                          {announcement.type}
                        </span>
                        <div className="ml-3 flex items-center text-xs text-green-600">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                          Active
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed text-base">{announcement.content}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Published: {formatDate(announcement.createdAt)}</span>
                    </div>
                    {announcement.createdAt !== announcement.updatedAt && (
                      <div className="flex items-center">
                        <span className="text-blue-600">Updated: {formatDate(announcement.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      
      </div>
    </div>
  );
};

export default AnnouncementsPage;