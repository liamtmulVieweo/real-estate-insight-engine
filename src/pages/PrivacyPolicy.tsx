import { VieweoLogo } from '@/components/VieweoLogo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <VieweoLogo className="h-10 w-auto" />
            </Link>
            <Button variant="outline" size="sm" asChild>
              <Link to="/" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

        <div className="space-y-10 text-foreground">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">1. Our Commitment to Your Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              At Vieweo, we provide an AI Visibility analytics platform that helps businesses cut through the noise and understand exactly how they are represented across the dynamic landscape of AI systems and generative search environments.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This Privacy Policy isn't just a legal document; it's our promise to you. It explains what information we collect, how we use it to provide our service, and how we protect it when you use the Vieweo dashboard (the "Platform").
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">2. Information We Handle</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information in three key ways: what you give us, what we automatically collect as you use the Platform, and the public data we analyze on your behalf.
            </p>

            <h3 className="text-lg font-medium mt-6">A. Information You Directly Provide</h3>
            <p className="text-muted-foreground leading-relaxed">
              When you sign up, configure your analysis, or manage your account, you may provide us with:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Name and contact information</li>
              <li>Company name and organizational details</li>
              <li>Billing and payment information</li>
              <li>The domains, URLs, or specific entities you submit for analysis</li>
              <li>The prompt queries or parameters you enter into the dashboard</li>
              <li>Files or supplementary data you choose to upload for context</li>
            </ul>

            <h3 className="text-lg font-medium mt-6">B. Technical Information Collected Automatically</h3>
            <p className="text-muted-foreground leading-relaxed">
              To ensure the Platform is reliable, secure, and performs optimally, we automatically log certain technical details:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>IP address and general location data</li>
              <li>Device type and browser information</li>
              <li>Details of your usage activity inside the dashboard (e.g., features used, session duration)</li>
              <li>Log data and session metadata related to technical operations</li>
            </ul>

            <h3 className="text-lg font-medium mt-6">C. The Public Data We Process</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our core value is analyzing publicly available data. We analyze information found in the public domain, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Publicly accessible websites, forums, and blogs</li>
              <li>Public business listings and profile data</li>
              <li>Public reviews and media mentions</li>
              <li>The publicly generated outputs from Large Language Models (LLMs)</li>
              <li>Public entity metadata and knowledge graphs</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed font-medium">
              Crucially, Vieweo does not access private accounts, private databases, or restricted systems without explicit and verifiable authorization.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">3. How We Utilize This Information</h2>
            <p className="text-muted-foreground leading-relaxed">We use the data we collect solely to deliver and improve the Vieweo service:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>To generate your requested AI visibility analytics, scoring, and performance reports.</li>
              <li>To monitor and refine prompt-level performance and extraction accuracy.</li>
              <li>To enhance the reliability and security of our Platform and underlying systems.</li>
              <li>To process billing and manage your customer account.</li>
              <li>To provide efficient customer support and technical assistance.</li>
              <li>To prevent misuse, fraud, and ensure overall platform security.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed font-semibold">We do not sell your personal data. Period.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">4. AI and Automated Analysis Explained</h2>
            <p className="text-muted-foreground leading-relaxed">Vieweo is powered by advanced automated systems, which include:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Large Language Models (LLMs) and custom NLP extraction engines.</li>
              <li>Structured data analysis pipelines.</li>
              <li>Our proprietary scoring and benchmarking frameworks.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              The insights and scores generated are automated and reflect the state of AI systems at the time of analysis. As AI systems are constantly evolving, we remind users that they are responsible for reviewing and validating all outputs before basing critical business decisions on them.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">5. Security Measures</h2>
            <p className="text-muted-foreground leading-relaxed">We take the security of your data seriously and employ commercially reasonable safeguards, including:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Encrypted transmission using HTTPS/TLS.</li>
              <li>Leveraging secure, industry-leading cloud infrastructure (e.g., AWS or GCP).</li>
              <li>Strict internal access controls and employee restrictions.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">While we strive for maximum security, no system on the internet can guarantee absolute security.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">6. Data Retention and Deletion</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your account and associated usage data for the duration that your Vieweo account remains active, unless you request deletion.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You may request account deletion at any time by contacting: [Insert Privacy Email]
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">7. Our Service Providers</h2>
            <p className="text-muted-foreground leading-relaxed">To operate effectively, we partner with specialized third-party providers for essential services like:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Cloud hosting and infrastructure</li>
              <li>Payment processing</li>
              <li>Analytics and performance monitoring</li>
              <li>AI model APIs</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">These third parties are carefully selected and operate under their own privacy policies.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">8. Your Data Rights</h2>
            <p className="text-muted-foreground leading-relaxed">As a user, you have certain rights regarding your personal data. You may request to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Access the data we hold about you.</li>
              <li>Correct any inaccuracies in your personal information.</li>
              <li>Request the deletion of your account and associated data.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">To exercise these rights, please contact us at: [Insert Email]</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">9. Updates to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy as our Platform evolves or legal requirements change. When we make updates, we will revise the "Effective Date." Your continued use of Vieweo after any changes signifies your acceptance of the updated policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">10. How to Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For any questions about this Privacy Policy or our data practices, please reach out:
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Vieweo<br />
              [Legal Entity Name]<br />
              [Address]<br />
              [Email]
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Use</Link>
            <Link to="/methodology" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Methodology</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
