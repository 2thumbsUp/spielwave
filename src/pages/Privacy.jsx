import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const Privacy = () => {
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
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Privacy Policy</h1>
          
          <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500">Effective Date: December 26, 2025</p>
            
            <p>Your privacy matters to us. This Privacy Policy explains how SpielWave collects and uses information.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">1. Information We Collect</h2>
            <p>We may collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email address</li>
              <li>Username</li>
              <li>Audio content you upload</li>
              <li>Usage data (votes, interactions, timestamps)</li>
              <li>Basic technical data (device, browser, IP)</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">2. How We Use Information</h2>
            <p>We use your data to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Operate and improve SpielWave</li>
              <li>Authenticate users</li>
              <li>Store and play audio content</li>
              <li>Display engagement metrics</li>
              <li>Maintain platform security</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">3. Audio Content</h2>
            <p>Audio you post is stored securely using cloud infrastructure. Public threads are visible to other users.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">4. Cookies & Sessions</h2>
            <p>We use cookies or similar technologies to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Keep you signed in</li>
              <li>Improve performance and user experience</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">5. Data Sharing</h2>
            <p>We do not sell your personal data.</p>
            <p>We may share data only:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With infrastructure providers (e.g., hosting, storage)</li>
              <li>If required by law</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">6. Data Security</h2>
            <p>We use industry-standard practices to protect user data, but no system is 100% secure.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">7. Your Rights</h2>
            <p>You may:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Request account deletion</li>
              <li>Request data access or correction</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">8. Data Retention</h2>
            <p>We retain your data while your account is active. Deleted accounts are removed within 30 days.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">9. Children's Privacy</h2>
            <p>SpielWave is not intended for children under 13. We do not knowingly collect data from children.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">10. International Users</h2>
            <p>Your data may be stored and processed in servers located outside the Philippines. By using SpielWave, you consent to this transfer.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">11. Changes to This Policy</h2>
            <p>We may update this policy. Continued use indicates acceptance.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">12. Contact</h2>
            <p><a href="mailto:contact@spielwave.com" className="text-blue-600 hover:text-blue-700">contact@spielwave.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};