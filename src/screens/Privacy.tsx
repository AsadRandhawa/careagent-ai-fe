import * as React from "react";
import { motion } from "motion/react";
import { Shield, ArrowLeft, Mail, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

const today = new Date().toLocaleDateString("en-GB", {
  day: "numeric", month: "long", year: "numeric",
});

// ── Layout helpers ────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <h2 className="text-[18px] font-black text-text-primary tracking-tight mb-4 pb-2 border-b border-border-faint">
      {title}
    </h2>
    <div className="space-y-3">{children}</div>
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-4">
    <h3 className="text-[14px] font-bold text-text-primary mb-2">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[13px] text-text-second leading-relaxed">{children}</p>
);

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="space-y-1.5 ml-4">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-2 text-[13px] text-text-second leading-relaxed">
        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
        {item}
      </li>
    ))}
  </ul>
);

const ExternalLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-brand hover:underline font-medium"
  >
    {children}
  </a>
);

// ── Main Component ────────────────────────────────────────
export const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg">
      {/* Nav bar */}
      <div className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border-faint">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[13px] text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Back to CareAgent.ai
          </button>
          <div className="flex items-center gap-2 text-[13px] text-text-muted">
            <Shield size={14} className="text-brand" />
            Privacy Policy
          </div>
        </div>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-6 pt-16 pb-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
            <Shield size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="text-[32px] font-black text-text-primary tracking-tight leading-tight">
              Privacy Policy
            </h1>
            <p className="text-[13px] text-text-muted mt-0.5">CareAgent.ai — operated by Flint Sol</p>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-4 p-4 bg-surface border border-border-mid rounded-xl mb-12">
          <div className="flex items-center gap-2 text-[12px] text-text-second">
            <span className="font-bold text-text-muted uppercase tracking-wider text-[10px]">Effective</span>
            {today}
          </div>
          <div className="w-px bg-border-faint" />
          <div className="flex items-center gap-2 text-[12px] text-text-second">
            <span className="font-bold text-text-muted uppercase tracking-wider text-[10px]">Last Updated</span>
            {today}
          </div>
          <div className="w-px bg-border-faint" />
          <div className="flex items-center gap-2 text-[12px] text-text-second">
            <Globe size={12} className="text-text-muted" />
            careagent.flint-sol.com
          </div>
        </div>

        {/* Content */}
        <div className="prose-like">

          {/* 1 */}
          <Section title="1. Introduction">
            <P>
              This Privacy Policy describes how Flint Sol ("we", "us", or "our") collects, uses, and
              protects your personal information when you use CareAgent.ai (the "Service"), accessible
              at careagent.flint-sol.com.
            </P>
            <P>
              By using the Service, you agree to the collection and use of information as described
              in this Privacy Policy. If you do not agree, please do not use the Service.
            </P>
            <P>
              We are committed to protecting your privacy and handling your data responsibly,
              transparently, and in accordance with applicable laws.
            </P>
          </Section>

          {/* 2 */}
          <Section title="2. Information We Collect">
            <SubSection title="2.1 Account Information">
              <P>When you create an account, we collect:</P>
              <Bullets items={[
                "Email address",
                "Password (stored in encrypted, hashed form — we never store your plain-text password)",
              ]} />
            </SubSection>

            <SubSection title="2.2 Gmail Integration Data">
              <P>When you connect your Gmail account through Google OAuth, we collect and store:</P>
              <Bullets items={[
                "OAuth access tokens and refresh tokens (used to read and send emails on your behalf)",
                "Email metadata: sender name, sender email address, subject line, and message snippet (preview text)",
                "Email thread IDs (used to send replies within the correct conversation thread)",
              ]} />
              <P>
                We access your Gmail data solely to display your inbox within the Service and to send
                replies you explicitly approve. We do not read, store, or process emails beyond what
                is necessary to provide these features.
              </P>
            </SubSection>

            <SubSection title="2.3 Knowledge Base Content">
              <P>When you configure the Service, we collect and store:</P>
              <Bullets items={[
                "Business identity and description you provide",
                "Brand voice preferences you define",
                "Documents and text content you upload to the knowledge base",
              ]} />
              <P>
                This information is used exclusively to generate contextually relevant AI draft
                responses for your customer support tickets.
              </P>
            </SubSection>

            <SubSection title="2.4 Support Ticket Data">
              <P>We store ticket records derived from your connected channels. Each record includes:</P>
              <Bullets items={[
                "Customer name and email address (as received from the email sender)",
                "Message subject and content snippet",
                "Ticket status, category, and sentiment classification",
                "Timestamps (when received, when resolved)",
              ]} />
              <P>
                This data is used to generate analytics, detect recurring issues, and provide
                AI-powered insights within your dashboard.
              </P>
            </SubSection>

            <SubSection title="2.5 Usage Data">
              <P>We may automatically collect basic technical information including:</P>
              <Bullets items={[
                "Browser type and version",
                "Device type and operating system",
                "Pages visited and features used within the Service",
                "Date and time of access",
              ]} />
            </SubSection>

            <SubSection title="2.6 Future Data Collection">
              <P>
                As the Service expands, we may collect additional information including full name,
                phone number (for WhatsApp integration), and payment information (for subscription
                billing, processed via third-party payment processors — we will never store card
                numbers directly). This Privacy Policy will be updated before any such collection
                begins.
              </P>
            </SubSection>
          </Section>

          {/* 3 */}
          <Section title="3. How We Use Your Information">
            <Bullets items={[
              "To create and manage your account",
              "To connect to your Gmail account and display your inbox within the Service",
              "To generate AI-powered draft replies to customer support tickets using your knowledge base",
              "To send email replies on your behalf when you approve and submit a draft",
              "To compute dashboard analytics including ticket volume, sentiment, response times, and escalation rates",
              "To detect recurring issues and generate AI recommendations specific to your ticket patterns",
              "To maintain the security and integrity of the Service",
              "To communicate with you about your account, updates, or support requests",
              "To comply with legal obligations",
            ]} />
          </Section>

          {/* 4 */}
          <Section title="4. Third-Party Services and Data Sharing">
            <P>
              We share your data with the following third-party services strictly to operate the
              Service. We do not sell your personal data to any third party.
            </P>

            <SubSection title="4.1 Google (Gmail OAuth)">
              <P>
                We use Google OAuth 2.0 to connect to your Gmail account. Your OAuth tokens are
                stored securely in our database. Email content is transmitted to and from Google's
                servers in accordance with Google's Privacy Policy.
              </P>
              <P>
                <ExternalLink href="https://policies.google.com/privacy">
                  Google Privacy Policy →
                </ExternalLink>
              </P>
            </SubSection>

            <SubSection title="4.2 OpenAI">
              <P>
                We send the following data to OpenAI's API to generate AI draft responses and
                insights:
              </P>
              <Bullets items={[
                "Customer message content from your inbox tickets",
                "Your knowledge base documents and business context",
                "Ticket subject lines and snippets for recurring issue analysis",
              ]} />
              <P>
                OpenAI processes this data under their data processing terms. OpenAI does not use
                API-submitted data to train their models by default.
              </P>
              <P>
                <ExternalLink href="https://openai.com/privacy">
                  OpenAI Privacy Policy →
                </ExternalLink>
              </P>
            </SubSection>

            <SubSection title="4.3 Railway (Cloud Hosting)">
              <P>
                Our backend servers and database are hosted on Railway's infrastructure. All stored
                data resides on Railway's servers.
              </P>
              <P>
                <ExternalLink href="https://railway.app/legal/privacy">
                  Railway Privacy Policy →
                </ExternalLink>
              </P>
            </SubSection>

            <SubSection title="4.4 Meta / WhatsApp (Upcoming)">
              <P>
                We intend to offer WhatsApp Business integration in a future release. When enabled,
                customer message data will be transmitted through Meta's WhatsApp Business API.
                This Privacy Policy will be updated with full details before that feature is
                available.
              </P>
            </SubSection>

            <SubSection title="4.5 Legal Disclosures">
              <P>
                We may disclose your information if required by law, court order, or governmental
                authority, or if we believe in good faith that such disclosure is necessary to
                protect our rights, your safety, or the safety of others.
              </P>
            </SubSection>
          </Section>

          {/* 5 */}
          <Section title="5. Data Retention">
            <Bullets items={[
              "Account credentials: retained until you delete your account",
              "Gmail OAuth tokens: retained until you disconnect Gmail or delete your account",
              "Ticket records: retained for 12 months from receipt, then automatically deleted",
              "Knowledge base content: retained until you delete it or close your account",
            ]} />
            <P>
              Upon account deletion, we will delete all personal data associated with your account
              within 30 days, except where retention is required by law.
            </P>
          </Section>

          {/* 6 */}
          <Section title="6. Data Security">
            <Bullets items={[
              "Passwords are hashed using bcrypt and never stored in plain text",
              "All data in transit is encrypted using TLS (HTTPS)",
              "OAuth tokens are stored encrypted in our database",
              "Access to production systems is restricted to authorised personnel only",
            ]} />
            <P>
              While we take reasonable precautions, no method of transmission over the internet is
              100% secure. We encourage you to use strong, unique passwords.
            </P>
          </Section>

          {/* 7 */}
          <Section title="7. Your Rights">
            <Bullets items={[
              "Access: request a copy of the personal data we hold about you",
              "Correction: request that we correct inaccurate or incomplete data",
              "Deletion: request that we delete your account and all associated data",
              "Disconnection: revoke Gmail access at any time from the Channels page, or from myaccount.google.com/permissions",
              "Portability: request an export of your data in a machine-readable format",
            ]} />
            <P>
              To exercise any of these rights, contact us at flintsol.internal@gmail.com. We will
              respond within 30 days.
            </P>
          </Section>

          {/* 8 */}
          <Section title="8. Cookies and Local Storage">
            <P>
              The Service uses browser local storage to store your authentication token so you remain
              logged in between sessions. We do not use advertising cookies or tracking cookies. You
              may clear your browser's local storage at any time, which will log you out.
            </P>
          </Section>

          {/* 9 */}
          <Section title="9. Children's Privacy">
            <P>
              The Service is not directed at individuals under the age of 18. We do not knowingly
              collect personal information from children. If you believe a child has provided us
              with personal information, please contact us and we will delete it promptly.
            </P>
          </Section>

          {/* 10 */}
          <Section title="10. Changes to This Privacy Policy">
            <P>
              We may update this Privacy Policy from time to time. When we do, we will update the
              effective date above. For material changes, we will notify you by email or by
              displaying a prominent notice within the Service. Your continued use of the Service
              after changes constitutes acceptance of the updated policy.
            </P>
          </Section>

          {/* 11 */}
          <Section title="11. Governing Law">
            <P>
              This Privacy Policy is governed by the laws of the Islamic Republic of Pakistan. Any
              disputes arising from this policy or your use of the Service shall be subject to the
              exclusive jurisdiction of the courts of Islamabad, Pakistan.
            </P>
          </Section>

          {/* 12 */}
          <Section title="12. Contact Us">
            <P>
              If you have any questions, concerns, or requests regarding this Privacy Policy or your
              personal data, please contact us:
            </P>
            <div className="mt-4 p-4 bg-surface border border-border-mid rounded-xl space-y-2">
              <p className="text-[14px] font-bold text-text-primary">Flint Sol</p>
              <p className="text-[13px] text-text-second">Islamabad, Pakistan</p>
              <a
                href="mailto:flintsol.internal@gmail.com"
                className="flex items-center gap-2 text-[13px] text-brand hover:underline"
              >
                <Mail size={13} />
                flintsol.internal@gmail.com
              </a>
              <a
                href="https://careagent.flint-sol.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[13px] text-brand hover:underline"
              >
                <Globe size={13} />
                careagent.flint-sol.com
              </a>
            </div>
          </Section>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border-faint text-center">
          <p className="text-[12px] text-text-muted italic">
            This document was last updated on {today}.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
