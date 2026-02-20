import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const previewFaqs = [
  {
    q: 'What exactly is AI visibility in commercial real estate?',
    a: "It's how often and how confidently AI systems recommend your brokerage when someone asks for professional help. Unlike traditional marketing metrics, this measures whether you're included in AI-generated shortlists — which is increasingly where initial broker selection happens.",
  },
  {
    q: 'Are companies actually using AI to find brokers, or is this just theoretical?',
    a: "It's happening now. Facility managers ask AI which brokers handle warehouse expansion. Investors query who specializes in multifamily acquisitions in specific submarkets. The key is being visible at that crucial first step.",
  },
  {
    q: 'How can a boutique firm compete with CBRE or JLL in AI search results?',
    a: "AI doesn't automatically favor big names the way Google search sometimes does. A boutique firm that clearly specializes in, say, restaurant leasing in downtown Nashville often gets recommended over a national firm with generic positioning. AI values expertise clarity over company size.",
  },
];

export function FAQPreview() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Common questions about AI visibility in commercial real estate.
          </p>
        </motion.div>

        <Accordion type="single" collapsible className="divide-y divide-border border-y border-border">
          {previewFaqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`preview-${idx}`} className="border-none">
              <AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link to="/faq" className="gap-2">
              View All FAQs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
