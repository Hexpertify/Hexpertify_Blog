'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
  title?: string;
  className?: string;
}

export default function FAQSection({ faqs, title = 'FAQs', className = '' }: FAQSectionProps) {
  if (faqs.length === 0) {
    return null;
  }

  return (
    <div className={`bg-purple-50/50 rounded-lg p-8 ${className}`}>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">{title}</h2>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={faq.id} value={`item-${index}`}>
            <AccordionTrigger className="text-gray-900 font-medium hover:text-purple-600 text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-gray-700 leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
