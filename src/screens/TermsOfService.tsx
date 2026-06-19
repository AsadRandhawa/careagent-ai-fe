import * as React from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="text-[18px] font-black text-text-primary mb-3 tracking-tight">{title}</h2>
    <div className="space-y-3 text-[14px] text-text-second leading-relaxed">{children}</div>
  </div>
);

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2.5">
    <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 flex-shrink-0" />
    <span>{children}</span>
  </div>
);

export const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <div className="border-b border-border-faint bg-bg-elevated px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[12px] font-semibold text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={14} /> Back to Home
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <div className="w-6 h-6 rounded-lg bg-brand flex items-center justify-center">
            <span className="text-white text-[10px] font-black">C</span>
          </div>
          <span className="text-[13px] font-black text-text-primary">CareAgent.ai</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto px-6 py-14"
      >
        {/* Header */}
        <div className="mb-10 pb-8 border-b border-border-faint">
          <h1 className="text-4xl font-black text-text-primary tracking-tight mb-3">Terms of Service</h1>
          <p className="text-[13px] text-text-muted">
            Effective Date: June 18, 2026 &nbsp;·&nbsp; Last Updated: June 18, 2026
          </p>
        </div>

        <Section title="1. Acceptance of Terms">
          <p>By accessing or using CareAgent.ai ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not use the Service.</p>
          <p>These Terms apply to all visitors, users, and customers of CareAgent.ai. By creating an account or using any part of the Service, you confirm that you have read, understood, and accepted these Terms in full.</p>
        </Section>

        <Section title="2. Description of Service">
          <p>CareAgent.ai is an AI-powered customer support platform that helps businesses automate their support operations. The Service includes:</p>
          <div className="space-y-1.5 mt-2">
            <Bullet>AI-generated draft replies to customer support emails</Bullet>
            <Bullet>Knowledge base management for training the AI on business-specific documents</Bullet>
            <Bullet>Gmail inbox integration for managing customer conversations</Bullet>
            <Bullet>Analytics dashboard for tracking ticket volume, resolution rates, and sentiment</Bullet>
            <Bullet>Escalation management tools for routing complex tickets to human agents</Bullet>
          </div>
        </Section>

        <Section title="3. Account Registration">
          <p>To use CareAgent.ai you must:</p>
          <div className="space-y-1.5 mt-2">
            <Bullet>Be at least 18 years of age or the age of legal majority in your jurisdiction</Bullet>
            <Bullet>Provide a valid email address and create a secure password</Bullet>
            <Bullet>Provide accurate and truthful information during registration</Bullet>
            <Bullet>Keep your login credentials confidential and not share them with any third party</Bullet>
          </div>
          <p className="mt-3">You are responsible for all activity that occurs under your account. If you believe your account has been compromised, you must notify us immediately at <a href="mailto:flintsol.internal@gmail.com" className="text-brand hover:underline font-semibold">flintsol.internal@gmail.com</a>.</p>
        </Section>

        <Section title="4. Subscription and Billing">
          <p>CareAgent.ai offers the following subscription plans:</p>
          <div className="space-y-1.5 mt-2">
            <Bullet>Startup Plan: Free of charge, with limited features as described on our pricing page</Bullet>
            <Bullet>Growth Plan: $20 USD per month, billed monthly on a recurring basis</Bullet>
            <Bullet>Enterprise Plan: Custom pricing, billed as agreed upon in a separate agreement</Bullet>
          </div>
          <p className="mt-3">Paid subscriptions automatically renew at the end of each billing cycle unless cancelled before the renewal date. By subscribing to a paid plan, you authorise CareAgent.ai and its payment processors to charge your payment method on a recurring basis.</p>
          <p>All prices are listed in USD. We reserve the right to change pricing at any time with at least 14 days prior notice to existing subscribers.</p>
        </Section>

        <Section title="5. Free Plan Limitations">
          <p>The free Startup Plan includes:</p>
          <div className="space-y-1.5 mt-2">
            <Bullet>Up to 100 AI-generated resolutions per month</Bullet>
            <Bullet>Up to 2 knowledge base document sources</Bullet>
            <Bullet>Email (Gmail) integration only</Bullet>
          </div>
          <p className="mt-3">Features including WhatsApp integration, SSO login, unlimited knowledge base documents, and priority support are not available on the free plan. We reserve the right to modify free plan features and limits at any time.</p>
        </Section>

        <Section title="6. Cancellation">
          <p>You may cancel your subscription at any time through the Billing &amp; Plans section of your account dashboard or by contacting us at <a href="mailto:flintsol.internal@gmail.com" className="text-brand hover:underline font-semibold">flintsol.internal@gmail.com</a>.</p>
          <p>Cancellation takes effect at the end of the current billing period. You will retain access to paid plan features until that date. No refunds are issued for the unused portion of a billing period unless otherwise required by applicable law or stated in our Refund Policy.</p>
          <p>Upon cancellation, your account will be downgraded to the free Startup Plan. Your data will be retained for 90 days after which it may be permanently deleted.</p>
        </Section>

        <Section title="7. Acceptable Use">
          <p>You agree not to use CareAgent.ai to:</p>
          <div className="space-y-1.5 mt-2">
            <Bullet>Violate any applicable law, regulation, or third-party rights</Bullet>
            <Bullet>Upload, transmit, or distribute harmful, fraudulent, or illegal content</Bullet>
            <Bullet>Attempt to reverse engineer, decompile, or disassemble any part of the Service</Bullet>
            <Bullet>Use the Service to send unsolicited commercial messages or spam</Bullet>
            <Bullet>Interfere with or disrupt the security, integrity, or performance of the Service</Bullet>
            <Bullet>Access or attempt to access accounts or systems other than your own</Bullet>
            <Bullet>Resell or sublicense access to the Service without prior written consent</Bullet>
          </div>
        </Section>

        <Section title="8. Intellectual Property">
          <p>CareAgent.ai and all its components, including software, design, branding, and documentation, are the exclusive intellectual property of FlintSol and its licensors. All rights are reserved.</p>
          <p>You retain full ownership of all data, content, and documents you upload to the Service ("User Content"). By uploading User Content, you grant CareAgent.ai a limited, non-exclusive licence to process and store that content solely for the purpose of providing the Service to you.</p>
        </Section>

        <Section title="9. Data and Privacy">
          <p>Your use of CareAgent.ai is also governed by our <a href="/privacy" className="text-brand hover:underline font-semibold">Privacy Policy</a>. By using the Service you consent to the collection and use of your data as described in the Privacy Policy. We are committed to protecting your personal data and do not sell your data to third parties.</p>
        </Section>

        <Section title="10. Third-Party Services">
          <p>CareAgent.ai integrates with and relies on the following third-party services:</p>
          <div className="space-y-1.5 mt-2">
            <Bullet>Google OAuth and Gmail API (Google LLC) — for email authentication and inbox integration</Bullet>
            <Bullet>OpenAI API (OpenAI, Inc.) — for AI-powered draft generation</Bullet>
            <Bullet>Railway (Railway Corp.) — for cloud hosting and database infrastructure</Bullet>
            <Bullet>Stripe (Stripe, Inc.) — for payment processing</Bullet>
            <Bullet>Paddle (Paddle.com Market Ltd.) — for payment processing</Bullet>
          </div>
          <p className="mt-3">Your use of these integrations is subject to the respective third-party terms of service and privacy policies. CareAgent.ai is not responsible for the practices or content of these third-party services.</p>
        </Section>

        <Section title="11. Disclaimers">
          <p className="uppercase text-[13px] font-semibold">The Service is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
          <p>CareAgent.ai is currently in beta. We do not guarantee uninterrupted access, error-free operation, or a specific uptime percentage at this stage of development. AI-generated responses are drafts only and should be reviewed by a human agent before sending.</p>
        </Section>

        <Section title="12. Limitation of Liability">
          <p className="uppercase text-[13px] font-semibold">To the maximum extent permitted by applicable law, CareAgent.ai and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.</p>
          <p>In no event shall our total liability to you for all claims arising out of or relating to these Terms or your use of the Service exceed the greater of: (a) the total amount you paid to CareAgent.ai in the twelve months preceding the claim, or (b) $20 USD.</p>
        </Section>

        <Section title="13. Termination">
          <p>We reserve the right to suspend or terminate your account and access to the Service at any time, with or without notice, for any of the following reasons:</p>
          <div className="space-y-1.5 mt-2">
            <Bullet>Violation of these Terms or our Acceptable Use Policy</Bullet>
            <Bullet>Fraudulent, abusive, or illegal activity</Bullet>
            <Bullet>Non-payment of subscription fees</Bullet>
          </div>
          <p className="mt-3">You may also terminate your account at any time by contacting us. Upon termination, your right to use the Service immediately ceases.</p>
        </Section>

        <Section title="14. Changes to Terms">
          <p>We reserve the right to modify these Terms at any time. When we make material changes, we will notify you by email or by displaying a prominent notice within the Service at least 7 days before the changes take effect. Your continued use of the Service after changes become effective constitutes your acceptance of the revised Terms.</p>
        </Section>

        <Section title="15. Governing Law">
          <p>These Terms shall be governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Islamabad, Pakistan.</p>
        </Section>

        <Section title="16. Contact Information">
          <p>For questions, concerns, or notices relating to these Terms, please contact us:</p>
          <div className="space-y-1.5 mt-2">
            <Bullet>Email: <a href="mailto:flintsol.internal@gmail.com" className="text-brand hover:underline font-semibold">flintsol.internal@gmail.com</a></Bullet>
            <Bullet>Website: <a href="https://careagent.flint-sol.com" className="text-brand hover:underline">careagent.flint-sol.com</a></Bullet>
            <Bullet>Response time: Within 3 business days</Bullet>
          </div>
        </Section>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border-faint text-center">
          <p className="text-[12px] text-text-disabled">
            CareAgent.ai &nbsp;·&nbsp; Terms of Service &nbsp;·&nbsp; Effective: June 18, 2026
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <a href="/privacy" className="text-[11px] text-text-muted hover:text-brand transition-colors">Privacy Policy</a>
            <span className="text-text-disabled">·</span>
            <a href="/refund-policy" className="text-[11px] text-text-muted hover:text-brand transition-colors">Refund Policy</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
