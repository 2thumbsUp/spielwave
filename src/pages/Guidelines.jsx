// FILE: src/pages/Guidelines.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const Guidelines = () => {
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
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Community Guidelines</h1>
          
          <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500">Effective Date: December 26, 2025</p>
            
            <p>SpielWave is a community for respectful discussion. Please follow these guidelines to help us maintain a positive environment.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">✅ We Encourage:</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Thoughtful, respectful discourse</li>
              <li>Constructive disagreement and healthy debate</li>
              <li>Diverse perspectives and viewpoints</li>
              <li>Reporting violations to help keep the community safe</li>
              <li>Using the agree/disagree feature thoughtfully</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">❌ Not Allowed:</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Harassment or bullying:</strong> Personal attacks, threats, or intimidation</li>
              <li><strong>Hate speech:</strong> Content promoting discrimination based on race, religion, gender, sexual orientation, disability, or other protected characteristics</li>
              <li><strong>Spam:</strong> Repetitive content, excessive self-promotion, or manipulation of the platform</li>
              <li><strong>Illegal content:</strong> Content that violates laws or promotes illegal activities</li>
              <li><strong>Impersonation:</strong> Pretending to be someone else or misrepresenting your identity</li>
              <li><strong>Copyright violations:</strong> Posting content you don't have rights to use</li>
              <li><strong>Explicit sexual content:</strong> Pornography or sexually explicit material</li>
              <li><strong>Violence:</strong> Content inciting, glorifying, or threatening violence</li>
              <li><strong>Misinformation:</strong> Deliberately sharing false information intended to deceive</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">🚨 Reporting</h2>
            <p>If you see content that violates these guidelines:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contact us at: <a href="mailto:contact@spielwave.com" className="text-blue-600 hover:text-blue-700">contact@spielwave.com</a></li>
              <li>Include the thread or reply link</li>
              <li>Explain which guideline was violated</li>
            </ul>
            <p>We review all reports and take action within 48 hours.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">⚖️ Enforcement</h2>
            <p>Violations of these guidelines may result in:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>First offense:</strong> Warning and content removal</li>
              <li><strong>Second offense:</strong> Temporary account suspension (7 days)</li>
              <li><strong>Severe or repeated violations:</strong> Permanent account ban</li>
            </ul>
            <p>We reserve the right to remove any content or user at our discretion to maintain a safe community.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6">📝 User Disclaimer</h2>
            <p><strong>User-Generated Content:</strong> All threads and replies reflect individual user opinions and do not represent SpielWave's views.</p>
            <p><strong>No Professional Advice:</strong> Content is not professional advice (medical, legal, financial, etc.). Always consult qualified professionals.</p>
            <p><strong>Content Accuracy:</strong> We don't guarantee the accuracy or reliability of user content.</p>

            <p className="mt-8 text-center text-sm text-gray-500">© SpielWave. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};