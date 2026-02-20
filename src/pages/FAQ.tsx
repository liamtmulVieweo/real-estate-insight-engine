import { VieweoLogo } from '@/components/VieweoLogo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqCategories = [
  {
    title: 'Discovery and Positioning',
    questions: [
      {
        q: "I'm not showing up when potential clients ask AI tools for broker recommendations. Why is this happening?",
        a: "AI systems look for clear signals about who you are and what you do. If your website says you handle \"all types of commercial real estate across the Southeast,\" that's too vague. AI prefers specificity: \"industrial investment sales in Charleston's port district\" or \"medical office leasing in Mount Pleasant.\" The more precisely you define your niche, the more likely AI is to recommend you for relevant queries.",
      },
      {
        q: 'How do I know if ChatGPT or other AI tools recognize my brokerage correctly?',
        a: 'Test it yourself. Ask "Who are the top industrial brokers in [your city]?" across different AI platforms. Common issues include name inconsistencies (using both "Smith & Associates" and "Smith Commercial" in different places), unclear leadership structure, or generic descriptions. AI struggles with ambiguity, so consistency matters more than you might think.',
      },
      {
        q: 'What exactly is AI visibility in commercial real estate?',
        a: "It's how often and how confidently AI systems recommend your brokerage when someone asks for professional help. Unlike traditional marketing metrics, this measures whether you're included in AI-generated shortlists — which is increasingly where initial broker selection happens.",
      },
    ],
  },
  {
    title: 'Competition and Market Position',
    questions: [
      {
        q: 'How can a boutique firm like ours compete with CBRE or JLL in AI search results?',
        a: "AI doesn't automatically favor big names the way Google search sometimes does. A boutique firm that clearly specializes in, say, restaurant leasing in downtown Nashville often gets recommended over a national firm with generic positioning. AI values expertise clarity over company size. Your advantage is that you can be much more specific about what you do and where you do it.",
      },
      {
        q: "When I ask AI tools about top brokers in my market, competitors keep getting mentioned but I don't. What are they doing differently?",
        a: "They're probably better at communicating their specialization and track record. Look at their websites — do they have clear sections explaining their focus? Do they showcase specific deals with details? Are they consistent in how they describe themselves across different platforms? Often it's not about being better; it's about being clearer.",
      },
    ],
  },
  {
    title: 'Client Behavior and Lead Generation',
    questions: [
      {
        q: 'Are companies actually using AI to find brokers, or is this just theoretical?',
        a: "It's happening now. Facility managers ask AI which brokers handle warehouse expansion. Investors query who specializes in multifamily acquisitions in specific submarkets. Even sophisticated clients start with AI for initial research, then verify through traditional channels. The key is being visible at that crucial first step.",
      },
      {
        q: 'What kind of questions do tenants and buyers ask AI when they\'re looking for representation?',
        a: 'Very specific ones: "Who should I hire to find medical office space in Greenville?" or "Best tenant rep for 50,000 sq ft warehouse in Charleston port area?" They\'re not asking for general information — they want names and recommendations. That\'s why generic positioning doesn\'t work in AI search.',
      },
    ],
  },
  {
    title: 'Business Impact',
    questions: [
      {
        q: "Can AI visibility actually affect our company's valuation or partnership opportunities?",
        a: "Yes, especially for mid-market firms. When potential investors or acquisition partners research your company, AI-generated summaries increasingly shape their first impressions. Being consistently mentioned as a market authority in AI responses signals strength and recognition that can influence business development conversations.",
      },
    ],
  },
  {
    title: 'Practical Improvements',
    questions: [
      {
        q: "What's the fastest way to improve how AI systems understand and recommend our firm?",
        a: 'Start with your homepage. Replace vague language ("full-service commercial real estate") with specific positioning ("industrial leasing and investment sales in Charleston\'s Upper Peninsula"). Add a simple FAQ section answering common questions in your niche. Make sure your team bios clearly explain their individual specialties, not just years of experience.',
      },
      {
        q: 'Does publishing more property listings help with AI visibility?',
        a: "Not really. AI systems care more about how you explain your expertise than how many listings you have. A well-written deal profile explaining your negotiation strategy for a complex lease will be more valuable than a hundred basic listings. Quality of positioning beats quantity of content.",
      },
    ],
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-4">What Makes AI Visibility Different</h1>
          <p className="text-muted-foreground leading-relaxed text-lg">
            Traditional SEO helps you rank on Google when someone searches for "commercial real estate Charleston." But AI visibility is about being <strong className="text-foreground">recommended</strong> when someone asks, "Who should I hire to lease warehouse space in Charleston?"
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Here's the key difference: AI systems don't just look at your website traffic or backlinks. They analyze how clearly you communicate your expertise, which markets you actually serve, and whether your specialization comes through in your content. A boutique firm with crystal-clear positioning often outranks larger competitors in AI recommendations.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-10">
          {faqCategories.map((category) => (
            <section key={category.title}>
              <h2 className="text-xl font-semibold text-foreground mb-4">{category.title}</h2>
              <Accordion type="single" collapsible className="divide-y divide-border border-y border-border">
                {category.questions.map((faq, idx) => (
                  <AccordionItem key={idx} value={`${category.title}-${idx}`} className="border-none">
                    <AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline py-5">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/methodology" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Methodology
            </Link>
            <Link to="/vieweo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Vieweo Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
