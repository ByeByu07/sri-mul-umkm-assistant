import React from 'react';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-6 sm:p-12">
      <div className="mx-auto max-w-3xl bg-white shadow-md rounded-2xl p-8">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">1. Introduction</h2>
          <p className="text-gray-700">
            This Privacy Policy describes how we handle information for <strong>hackathon-only</strong> purposes. This project
            is not commercial. We do not sell any personal data to third parties.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-lg font-medium">2. Information We Collect</h2>
          <ul className="list-disc ml-6 text-gray-700 space-y-2">
            <li>Information you provide directly (name, email, feedback) when you use the app.</li>
            <li>Technical data (browser, device, IP address) collected automatically for analytics and debugging.</li>
            <li>Optional data you choose to share (profile picture, additional notes).</li>
          </ul>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-lg font-medium">3. How We Use Your Information</h2>
          <p className="text-gray-700">
            We use collected information to operate the app, fix bugs, and improve user experience. Examples include:
          </p>
          <ul className="list-disc ml-6 text-gray-700 space-y-2">
            <li>Providing and maintaining the service.</li>
            <li>Debugging and resolving technical issues.</li>
            <li>Analyzing usage patterns to improve the product.</li>
          </ul>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-lg font-medium">4. Data Sharing & Third Parties</h2>
          <p className="text-gray-700">
            This project is strictly for hackathon/demo use. We <strong>do not sell</strong> personal data. We will not share
            your personal information with third parties for commercial purposes. We may, however, use third-party services to
            host, store, or process data (for example: analytics or cloud hosting). Those providers are chosen to respect
            security and privacy, and only receive the minimum data necessary to perform their services.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-lg font-medium">5. Security</h2>
          <p className="text-gray-700">
            We implement reasonable technical and organizational measures to protect data from unauthorized access,
            alteration, disclosure, or destruction. However, no method of transmission or storage is 100% secure.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-lg font-medium">6. Data Retention</h2>
          <p className="text-gray-700">
            We retain personal data only as long as needed for the hackathon purpose and to comply with legal obligations.
            If you want your data deleted sooner, see the Contact section below.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-lg font-medium">7. Your Rights</h2>
          <p className="text-gray-700">
            You may request access to, correction of, or deletion of your personal data. To make a request, contact us at
            the email below. We will respond as soon as reasonably possible.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-lg font-medium">8. Children's Privacy</h2>
          <p className="text-gray-700">
            This project is not intended for children under 13. If you believe we have collected personal information from a
            child under 13, please contact us and we will take steps to delete the information.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-lg font-medium">9. Changes to This Policy</h2>
          <p className="text-gray-700">
            We may update this policy from time to time. If material changes are made, we will provide an updated date at the
            top of this page.
          </p>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-lg font-medium">10. Contact</h2>
          <p className="text-gray-700">
            For questions or data requests, contact: <strong>hello@bayu-ai.dev</strong>. 
          </p>
        </section>

        <footer className="mt-8 border-t pt-6 text-sm text-gray-500">
          <p>
            <strong>Note:</strong> This privacy policy is provided as a simple template for hackathon/demo use. It is not
            legal advice. For production or commercial use, consult a legal professional and adapt this policy to comply
            with applicable laws (such as GDPR, CCPA, etc.).
          </p>
        </footer>
      </div>
    </main>
  );
}
