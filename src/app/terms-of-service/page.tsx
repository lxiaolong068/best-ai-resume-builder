import { Metadata } from 'next'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service | Best AI Resume Builder 2025',
  description: 'Terms of Service for Best AI Resume Builder. Learn about the terms and conditions for using our website and services.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsOfServicePage() {
  const lastUpdated = 'January 15, 2025'

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            
            <p className="text-gray-600 mb-8">
              <strong>Last updated:</strong> {lastUpdated}
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing and using Best AI Resume Builder ("the Service"), you accept and agree 
                  to be bound by the terms and provision of this agreement. If you do not agree to 
                  abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                <p className="text-gray-700 leading-relaxed">
                  Best AI Resume Builder provides information, reviews, and comparisons of AI-powered 
                  resume building tools. We offer free resources including ATS checkers, resume templates, 
                  and educational content to help users make informed decisions about resume building tools.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Use License</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Permission is granted to temporarily download one copy of the materials on 
                  Best AI Resume Builder for personal, non-commercial transitory viewing only. 
                  This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained on the website</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Responsibilities</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  When using our services, you agree to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Provide accurate and truthful information</li>
                  <li>Use the service only for lawful purposes</li>
                  <li>Not interfere with or disrupt the service</li>
                  <li>Not attempt to gain unauthorized access to our systems</li>
                  <li>Respect the intellectual property rights of others</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Content and Reviews</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our reviews and recommendations are based on our testing methodology and research. 
                  While we strive for accuracy, we make no warranties about the completeness, 
                  reliability, or accuracy of this information. Any action you take based on 
                  the information on this website is strictly at your own risk.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Affiliate Relationships</h2>
                <p className="text-gray-700 leading-relaxed">
                  Best AI Resume Builder may receive compensation when you click on or purchase 
                  products through affiliate links on our website. This does not affect our 
                  editorial independence or the objectivity of our reviews. We only recommend 
                  products we believe provide value to our users.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy, which also 
                  governs your use of the Service, to understand our practices.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimer</h2>
                <p className="text-gray-700 leading-relaxed">
                  The information on this website is provided on an "as is" basis. To the fullest 
                  extent permitted by law, Best AI Resume Builder excludes all representations, 
                  warranties, conditions and terms whether express or implied.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitations of Liability</h2>
                <p className="text-gray-700 leading-relaxed">
                  In no event shall Best AI Resume Builder or its suppliers be liable for any 
                  damages (including, without limitation, damages for loss of data or profit, 
                  or due to business interruption) arising out of the use or inability to use 
                  the materials on our website.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Accuracy of Materials</h2>
                <p className="text-gray-700 leading-relaxed">
                  The materials appearing on Best AI Resume Builder could include technical, 
                  typographical, or photographic errors. We do not warrant that any of the 
                  materials on its website are accurate, complete, or current.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Links</h2>
                <p className="text-gray-700 leading-relaxed">
                  Best AI Resume Builder has not reviewed all of the sites linked to our website 
                  and is not responsible for the contents of any such linked site. The inclusion 
                  of any link does not imply endorsement by us of the site.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Modifications</h2>
                <p className="text-gray-700 leading-relaxed">
                  Best AI Resume Builder may revise these terms of service at any time without notice. 
                  By using this website, you are agreeing to be bound by the then current version 
                  of these terms of service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Governing Law</h2>
                <p className="text-gray-700 leading-relaxed">
                  These terms and conditions are governed by and construed in accordance with 
                  the laws of [Your Jurisdiction] and you irrevocably submit to the exclusive 
                  jurisdiction of the courts in that state or location.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <p className="text-gray-700">
                    Email: legal@bestairesume2025.com<br />
                    Address: [Your Business Address]
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
