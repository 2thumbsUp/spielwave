import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const Disclaimer = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to SpielWave</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Disclaimer</h1>
          
          <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500">Effective Date: December 26, 2025</p>
            
            <p>SpielWave is a user-generated content platform.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">1. User Opinions</h2>
            <p>All audio threads and replies reflect the opinions of individual users. They do not represent the views of SpielWave.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">2. No Professional Advice</h2>
            <p>Content on SpielWave is not professional advice (medical, legal, financial, or otherwise). Always consult a qualified professional when needed.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">3. Content Accuracy</h2>
            <p>We do not guarantee the accuracy, completeness, or reliability of user-generated content.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">4. External Links</h2>
            <p>SpielWave may contain links to third-party websites. We are not responsible for their content or practices.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">5. Use at Your Own Risk</h2>
            <p>Use of the platform and reliance on content is at your own risk.</p>

            <p className="mt-8 text-center text-sm text-gray-500">© SpielWave. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};