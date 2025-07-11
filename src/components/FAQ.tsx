'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { FAQStructuredData } from './StructuredData'

const faqs = [
  {
    id: 1,
    question: 'What makes an AI resume builder better than others?',
    answer: 'The best AI resume builders combine three key factors: ATS compatibility (can pass through applicant tracking systems), intelligent content suggestions that are relevant to your industry, and professional templates that look polished. Our testing focuses heavily on ATS compatibility since 98% of Fortune 500 companies use these systems to filter resumes.'
  },
  {
    id: 2,
    question: 'How do you test ATS compatibility?',
    answer: 'We test each resume builder across 50+ different ATS systems including Workday, Greenhouse, Lever, and BambooHR. We measure how accurately the systems parse contact information, extract keywords, preserve formatting, and identify sections. We also track real-world success rates by following users who apply for jobs.'
  },
  {
    id: 3,
    question: 'Are AI resume builders worth the cost?',
    answer: 'Yes, for most job seekers. Our data shows that professionally-built, ATS-optimized resumes increase interview callback rates by 40-60% compared to DIY resumes. When you consider that finding a job even one week faster can be worth thousands in salary, the $3-20/month cost is typically a great investment.'
  },
  {
    id: 4,
    question: 'Can I trust AI to write my resume?',
    answer: 'AI should assist, not replace your input. The best AI resume builders use your information to suggest improvements and ensure ATS compatibility, but you maintain control over the content. Always review and customize AI suggestions to ensure they accurately represent your experience and match the job requirements.'
  },
  {
    id: 5,
    question: 'Which resume builder is best for my industry?',
    answer: 'It depends on your field. For tech and business roles, Resume.io and Zety perform best due to their strong ATS compatibility. For creative fields, you might prioritize design flexibility, though be careful about ATS compatibility. For traditional industries like finance or healthcare, stick with classic templates that score highest on ATS tests.'
  },
  {
    id: 6,
    question: 'How often should I update my resume?',
    answer: 'Update your resume every 3-6 months or whenever you gain new skills, complete projects, or change roles. AI resume builders make this easier by suggesting relevant keywords and formatting updates. Also update your resume whenever you\'re targeting a new type of role or industry.'
  },
  {
    id: 7,
    question: 'Do hiring managers prefer AI-generated resumes?',
    answer: 'Hiring managers can\'t usually tell if a resume was created with AI assistance, and they don\'t care as long as it\'s accurate and relevant. What matters is that your resume is well-formatted, ATS-compatible, and effectively communicates your qualifications. AI tools help achieve these goals more consistently.'
  },
  {
    id: 8,
    question: 'How do I avoid AI resume mistakes?',
    answer: 'Always fact-check AI suggestions, customize content for each application, avoid overusing buzzwords, and ensure the AI understands your specific role and industry. Never submit a resume without thoroughly reviewing it for accuracy and relevance to the job posting.'
  }
]

export function FAQ() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(1)

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id)
  }

  return (
    <>
      <FAQStructuredData faqs={faqs} />
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Get answers to the most common questions about AI resume builders
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full px-8 py-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDownIcon
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                      openFAQ === faq.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>
              
              <AnimatePresence>
                {openFAQ === faq.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-6">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mt-16 p-8 bg-blue-600 rounded-2xl text-white"
        >
          <h3 className="text-2xl font-bold mb-4">
            Still have questions?
          </h3>
          <p className="text-blue-100 mb-6 text-lg">
            Try our free ATS compatibility checker to see how your current resume performs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Test Your Resume Free
            </button>
            <button className="border border-blue-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors">
              Read Our Complete Guide
            </button>
          </div>
        </motion.div>

        {/* Schema.org FAQ structured data would go here */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            })
          }}
        />
        </div>
      </section>
    </>
  )
}