export default function FAQPage() {
  const faqs = [
    {
      question: "How does payment work?",
      answer: "All payments are made directly in cash to the driver when you meet. AlbaniaRides is a connection platform only - we don't process any payments."
    },
    {
      question: "Is my phone number safe?",
      answer: "Yes, your phone number is encrypted and only shared with drivers/passengers after a confirmed booking. We comply with GDPR regulations."
    },
    {
      question: "Can I cancel my booking?",
      answer: "Yes, you can cancel your booking up to 2 hours before the departure time. After that, please contact the driver directly."
    },
    {
      question: "What if the driver cancels?",
      answer: "If a driver cancels, you'll be notified immediately via SMS. You can then search for another ride or post a request."
    },
    {
      question: "How are drivers verified?",
      answer: "All users must verify their Albanian phone numbers (+355). Drivers provide additional information about their vehicles and driving experience."
    },
    {
      question: "What cities are covered?",
      answer: "We cover all major Albanian cities including Tirana, Durrës, Vlorë, Shkodër, and 11 other cities across Albania."
    },
    {
      question: "Can I book multiple seats?",
      answer: "Yes, you can book up to 4 seats per ride, depending on availability."
    },
    {
      question: "Is there a rating system?",
      answer: "Yes, both drivers and passengers can rate each other after completed trips. This helps build trust in our community."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <a href="/" className="text-2xl font-bold text-primary-600">AlbaniaRides</a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="card">
              <h2 className="text-lg font-semibold mb-2">{faq.question}</h2>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 card bg-primary-50 border-primary-200">
          <h2 className="text-lg font-semibold mb-2">Still have questions?</h2>
          <p className="text-gray-700">
            Contact us at support@albaniarides.com or call +355 69 XXX XXXX
          </p>
        </div>
      </main>
    </div>
  )
}