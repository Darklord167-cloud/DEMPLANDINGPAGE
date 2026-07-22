import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Shield className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-heading font-bold text-white uppercase tracking-wider">Privacy Policy</h1>
        </div>
        
        <div className="prose prose-invert max-w-none prose-p:text-zinc-400 prose-headings:text-white prose-a:text-primary">
          <p className="lead text-xl text-zinc-300">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">1. Introduction</h2>
          <p>
            Dark Empire Lords LLC ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our website or use our services, including our custom software design platform, cryptocurrency swaps, and integration with Web3 wallets and Google accounts.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Data We Collect</h2>
          <p>
            We may collect, use, store, and transfer different kinds of data about you, which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-zinc-400">
            <li><strong>Identity Data:</strong> Includes Google account information (if you choose to connect it) and public Web3 wallet addresses (e.g., Solana addresses) used for identity verification or transactions.</li>
            <li><strong>Transaction Data:</strong> Details about payments or token swaps ($DEMP) to and from you, and other details of products and services you have accessed from us.</li>
            <li><strong>Technical Data:</strong> Includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
            <li><strong>Usage Data:</strong> Information about how you use our website, products, and services.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. How We Use Your Data</h2>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-zinc-400">
            <li>To verify your identity and age using connected Google accounts or Web3 wallets for accessing our custom software design services.</li>
            <li>To process and manage your token swaps or transactions.</li>
            <li>To manage our relationship with you, including notifying you about changes to our terms or privacy policy.</li>
            <li>To administer and protect our business and this website (including troubleshooting, data analysis, testing, system maintenance, support, reporting, and hosting of data).</li>
            <li>To deliver relevant website content and advertisements to you and measure or understand the effectiveness of the advertising we serve to you.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Third-Party Services</h2>
          <p>
            Our website may include links to third-party websites, plug-ins, and applications (such as Jupiter for token swaps or Google for authentication). Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements. When you leave our website, we encourage you to read the privacy policy of every website you visit.
          </p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">5. Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">6. Data Retention</h2>
          <p>
            We will only retain your personal data for as long as reasonably necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting, or reporting requirements.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">7. Your Legal Rights</h2>
          <p>
            Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">8. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our privacy practices, please contact us at our official Telegram or Discord channels linked in the footer.
          </p>
        </div>
      </div>
    </div>
  );
}
