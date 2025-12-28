import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const Terms = () => {
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
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Terms of Service</h1>
          
          <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500">Effective Date: December 26, 2025</p>
            
            <p>Welcome to SpielWave ("we," "our," or "the platform"). By accessing or using SpielWave.com, you agree to these Terms of Service. If you do not agree, please do not use the platform.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">1. What SpielWave Is</h2>
            <p>SpielWave is a voice-based discussion platform where users can post audio threads, reply with audio, and engage through agree/disagree voting.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">2. Eligibility</h2>
            <p>You must be at least 13 years old (or the minimum age required in your country) to use SpielWave.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">3. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are responsible for maintaining the security of your account.</li>
              <li>You must provide accurate information during signup.</li>
              <li>You are responsible for all activity under your account.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">4. User Content</h2>
            <p>You retain ownership of any audio or content you post.</p>
            <p>By posting content, you grant SpielWave a non-exclusive, royalty-free license to host, store, and display your content solely for operating and improving the platform.</p>
            <p>You agree not to post:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Illegal content</li>
              <li>Harassment, hate speech, or threats</li>
              <li>Spam or misleading information</li>
              <li>Content that violates others' rights</li>
            </ul>
            <p>We reserve the right to remove content or suspend accounts that violate these rules.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">5. Platform Availability</h2>
            <p>SpielWave is provided "as is" and "as available." We do not guarantee uninterrupted service or error-free operation.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">6. Account Termination</h2>
            <p>We may suspend or terminate accounts for violations of these terms or harmful behavior, with or without notice.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">7. Limitation of Liability</h2>
            <p>SpielWave is not liable for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>User-generated content</li>
              <li>Loss of data</li>
              <li>Damages arising from platform use</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">8. Changes to These Terms</h2>
            <p>We may update these terms occasionally. Continued use means acceptance of updated terms.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">9. Governing Law</h2>
            <p>These Terms are governed by the laws of the Philippines. Any disputes will be resolved in Philippine courts.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">10. Indemnification</h2>
            <p>You agree to indemnify and hold SpielWave harmless from any claims arising from your use of the platform or violation of these terms.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">11. Contact</h2>
            <p>For questions or concerns: <a href="mailto:contact@spielwave.com" className="text-blue-600 hover:text-blue-700">contact@spielwave.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};