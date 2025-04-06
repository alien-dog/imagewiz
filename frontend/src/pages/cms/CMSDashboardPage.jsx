import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CMSDashboard from '../../components/cms/CMSDashboard';
import PostList from '../../components/cms/PostList';
import PostEditor from '../../components/cms/PostEditor';
import TagManager from '../../components/cms/TagManager';
import LanguageManager from '../../components/cms/LanguageManager';
import { BarChart, FileText, Tag, Settings, Globe, Info } from 'lucide-react';

const CMSOverview = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">CMS Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Content Management</h3>
              <p className="text-sm text-gray-500">Manage blog posts and content</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = '/cms/posts'}
            className="w-full mt-2 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            Manage Posts
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-teal-100 p-3 rounded-full mr-4">
              <Tag className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Taxonomy</h3>
              <p className="text-sm text-gray-500">Manage tags and categories</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = '/cms/tags'}
            className="w-full mt-2 py-2 bg-teal-50 text-teal-600 rounded-md hover:bg-teal-100 transition-colors text-sm font-medium"
          >
            Manage Tags
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <Globe className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Localization</h3>
              <p className="text-sm text-gray-500">Manage languages and translations</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = '/cms/languages'}
            className="w-full mt-2 py-2 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors text-sm font-medium"
          >
            Manage Languages
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Info className="h-5 w-5 mr-2 text-teal-500" />
          CMS Quick Tips
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Create engaging content with SEO-friendly titles and descriptions</li>
          <li>Use tags to organize your content and improve discoverability</li>
          <li>Add translations to reach a wider audience</li>
          <li>Include high-quality images to make your content more appealing</li>
          <li>Preview your content before publishing to ensure everything looks correct</li>
        </ul>
      </div>
    </div>
  );
};

const CMSSettings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">CMS Settings</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          General Settings
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Title
            </label>
            <input
              type="text"
              defaultValue="iMagenWiz Blog"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Description
            </label>
            <textarea
              defaultValue="AI-powered image processing and enhancement tools for professionals and businesses."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Posts Per Page
            </label>
            <input
              type="number"
              defaultValue={10}
              min={1}
              max={50}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          <div className="pt-4">
            <button
              className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CMSDashboardPage = () => {
  return (
    <Routes>
      <Route path="/" element={<CMSDashboard><CMSOverview /></CMSDashboard>} />
      <Route path="/posts" element={<CMSDashboard><PostList /></CMSDashboard>} />
      <Route path="/posts/new" element={<CMSDashboard><PostEditor /></CMSDashboard>} />
      <Route path="/posts/:id/edit" element={<CMSDashboard><PostEditor /></CMSDashboard>} />
      <Route path="/tags" element={<CMSDashboard><TagManager /></CMSDashboard>} />
      <Route path="/languages" element={<CMSDashboard><LanguageManager /></CMSDashboard>} />
      <Route path="/settings" element={<CMSDashboard><CMSSettings /></CMSDashboard>} />
      <Route path="*" element={<Navigate to="/cms" replace />} />
    </Routes>
  );
};

export default CMSDashboardPage;