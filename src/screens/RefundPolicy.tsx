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

export const RefundPolicy = () => {
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
          <h1 className="text-4xl font-black text-text-primary tracking-tight mb-3">Refund Policy</h1>
          <p className="text-[13px] text-text-muted">
            Effective Date: June 18, 2026 &nbsp;·&nbsp; Last Updated: June 18, 2026
          </p>
        </div>

        <Section title="1. Overview">
          <p>
            CareAgent.ai ("we", "our", or "the Company") is committed to ensuring customer satisfaction with our AI-powered customer support platform. This Refund Policy outlines the conditions under which refunds may be granted for subscriptions purchased through our website at careagent.flint-sol.com.
          </p>
          <p>By subscribing to any of our paid plans, you agree to the terms set forth in this Refund Policy.</p>
        </Section>

        <Section title="2. Subscription Plans">
          <p>CareAgent.ai currently offers the following subscription tiers:</p>
          <div className="space-y-1.5 mt-2">
            <Bullet>Startup Plan — $0/month (Free, no payment required)</Bullet>
            <Bullet>Growth Plan — $20/month (Recurring monthly subscription)</Bullet>
            <Bullet>Enterprise Plan — Custom pricing (Contact sales)</Bullet>
          </div>
        </Section>

        <Section title="3. Refund Eligibility">
          <p>You may be eligible for a refund under the following circumstances:</p>
          <div className="space-y-1.5 mt-2">
            <Bullet>You were charged in error (e.g. duplicate billing or technical failure)</Bullet>
            <Bullet>You cancel your subscription within 7 days of the initial charge and have not made substantial use of the platform</Bullet>
            <Bullet>The service was unavailable for a significant period due to our technical failure (more than 24 consecutive hours)</Bullet>
            <Bullet>You were charged after a confirmed cancellation request</Bullet>
          </div>
        </Section>

        <Section title="4. Non-Refundable Circumstances">
          <p>Refunds will not be issued in the following cases:</p>
          <div className="space-y-1.5 mt-2">
            <Bullet>You simply changed your mind after more than 7 days of the billing cycle</Bullet>
            <Bullet>Your account was suspended due to violation of our Terms of Service</Bullet>
            <Bullet>You did not use the service but the subscription period has already passed</Bullet>
            <Bullet>Partial month refunds for mid-cycle cancellations</Bullet>
            <Bullet>The Startup (free) plan — as no payment is made</Bullet>
          </div>
        </Section>

        <Section title="5. How to Request a Refund">
          <p>To request a refund, please follow these steps:</p>
          <div className="space-y-1.5 mt-2">
            <Bullet>Send an email to <a href="mailto:support@careagent.ai" className="text-brand hover:underline font-semibold">support@careagent.ai</a> with the subject line: "Refund Request — [Your Account Email]"</Bullet>
            <Bullet>Include your account email address, the date of the charge, and the reason for your refund request</Bullet>
            <Bullet>Our team will review your request within 3 business days and respond with a decision</Bullet>
            <Bullet>If approved, refunds are processed within 5–10 business days to the original payment method</Bullet>
          </div>
        </Section>

        <Section title="6. Cancellation Policy">
          <p>
            You may cancel your subscription at any time from the Billing &amp; Plans section within the CareAgent.ai platform, or by contacting our support team.
          </p>
          <p>
            Cancellation takes effect at the end of your current billing period. You will retain access to Growth plan features until the end of the paid period. No further charges will be made after cancellation is confirmed.
          </p>
        </Section>

        <Section title="7. Chargebacks">
          <p>
            We ask that you contact us before initiating a chargeback with your bank or payment provider. Chargebacks can result in immediate account suspension. We are committed to resolving billing issues fairly and quickly through direct communication.
          </p>
        </Section>

        <Section title="8. Payment Processors">
          <p>CareAgent.ai processes payments through the following third-party payment processors:</p>
          <div className="space-y-1.5 mt-2">
            <Bullet>Stripe — <a href="https://stripe.com" target="_blank" rel="noreferrer" className="text-brand hover:underline">stripe.com</a></Bullet>
            <Bullet>Paddle — <a href="https://paddle.com" target="_blank" rel="noreferrer" className="text-brand hover:underline">paddle.com</a></Bullet>
          </div>
          <p className="mt-3">
            Refund processing times may vary depending on the payment processor used at the time of purchase. Refunds are subject to the terms of the respective payment processor in addition to this policy.
          </p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>
            We reserve the right to update or modify this Refund Policy at any time. Changes will be published on this page with an updated effective date. Continued use of CareAgent.ai after changes constitutes acceptance of the revised policy.
          </p>
        </Section>

        <Section title="10. Contact Us">
          <p>For refund requests or billing questions, please contact us:</p>
          <div className="space-y-1.5 mt-2">
            <Bullet>Email: <a href="mailto:flintsol.internal@gmail.com" className="text-brand hover:underline font-semibold">flintsol.internal@gmail.com</a></Bullet>
            <Bullet>Website: <a href="https://careagent.flint-sol.com" className="text-brand hover:underline">careagent.flint-sol.com</a></Bullet>
            <Bullet>Response time: Within 3 business days</Bullet>
          </div>
        </Section>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border-faint text-center">
          <p className="text-[12px] text-text-disabled">
            CareAgent.ai &nbsp;·&nbsp; Refund Policy &nbsp;·&nbsp; Effective: June 18, 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
};
