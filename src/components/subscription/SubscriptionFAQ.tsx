import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: "What's included in the monthly subscription?",
    answer:
      "Your subscription includes full access to our AI Visibility Dashboard, comprehensive monthly performance reports, real-time updates on discovery trends, and priority support. You'll have 24/7 access to monitor how your properties are being represented across all major AI platforms.",
  },
  {
    question: 'How does the AI visibility dashboard work?',
    answer:
      'Our dashboard aggregates data from major LLMs and AI search engines to show you exactly when, where, and how your commercial properties are appearing in AI-generated responses. We analyze sentiment, accuracy, and frequency of mentions to give you a complete picture of your AI market presence.',
  },
  {
    question: 'Can I add expert consultation later?',
    answer:
      'Yes, absolutely. While the base subscription gives you all the data and insights you need, you can add one-on-one expert consultation sessions at any time for an additional fee. These sessions are perfect for deep-dive strategy planning or complex portfolio optimization.',
  },
  {
    question: 'What happens if I cancel?',
    answer:
      'We believe in earning your business every month. You can cancel your subscription at any time. Your access will continue until the end of your current billing period, after which you will no longer be charged. We recommend exporting your data before your access expires.',
  },
  {
    question: 'Is there a contract or commitment?',
    answer:
      'No long-term contracts are required for the Professional Subscription. It is a month-to-month service designed to provide ongoing value. For larger enterprise organizations requiring custom SLAs or procurement processes, we do offer annual contracts with volume incentives.',
  },
]

export function SubscriptionFAQ() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Common questions about our analytics platform and subscription
              model.
            </p>
          </div>

          <Accordion type="single" collapsible defaultValue="item-0" className="divide-y divide-slate-200 border-y border-slate-200">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-none">
                <AccordionTrigger className="text-left text-base font-medium text-slate-900 hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
