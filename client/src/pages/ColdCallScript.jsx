import { useState } from 'react';
import { ChevronDown, ChevronUp, Printer } from 'lucide-react';

const STEPS = [
  {
    step: 1,
    title: 'The Opener',
    color: '#3A86FF',
    script: `"Hi, is this [Name]? Great — this is [Your Name] calling from Sparkflow Digital. I'm not trying to sell you anything today — I actually just ran a quick audit on [Business Name]'s online presence and noticed a couple of things I thought you'd want to know about. Do you have about 60 seconds?"`,
    tip: `Say your name clearly and slowly. Smile while you speak — it comes through. The phrase "not trying to sell" immediately lowers their guard. If they say no to 60 seconds, respect it and ask when's better.`,
  },
  {
    step: 2,
    title: 'Build Curiosity',
    color: '#8B5CF6',
    script: `"So when I looked at [Business Name]'s [website/Instagram/Google listing], I noticed [specific issue — e.g., your website isn't showing up on Google for the most important keywords in your area / your Instagram looks great but your engagement rate is really low]. Most [industry] businesses in [city] are leaving a lot of potential clients on the table because of this — and honestly, it's a fairly simple fix."`,
    tip: `Be specific. Generic statements get ignored. Mention exactly what you found. Refer to their actual business name and niche. The more specific you are, the more credible you sound.`,
  },
  {
    step: 3,
    title: 'Offer Value',
    color: '#10B981',
    script: `"What we do at Sparkflow is [brief description — e.g., help local businesses like yours get more clients online through better social media, SEO, or website strategy]. We've worked with a few [industry] businesses in [city/region] and they started seeing results like [specific benefit — e.g., 30% more website traffic / 2–3x more Instagram followers / more inbound calls]. The great part is, we show you exactly what we'd do before you spend anything."`,
    tip: `Keep this under 30 seconds. You're teasing results, not selling a package. Use real, relatable numbers — "30% more traffic" beats "significant improvement." You're building desire, not closing yet.`,
  },
  {
    step: 4,
    title: 'Qualify',
    color: '#F59E0B',
    script: `"Quick question — are you currently doing any digital marketing at all? [...] And is that something you manage yourself or do you work with someone? [...] What would you say is your biggest challenge right now when it comes to getting new clients through online channels?"`,
    tip: `Listen more than you talk here. Their answers will tell you exactly how to close. Note if they're DIY-ing (prime for agency help) or frustrated with their current agency. Let silence work for you.`,
  },
  {
    step: 5,
    title: 'Ask for the Meeting',
    color: '#3A86FF',
    script: `"Based on what you've shared, I think we could put together something really solid for [Business Name]. I'd love to set up a quick 20-minute call where I show you exactly what I found in the audit and what I'd recommend — no hard sell, just value. Does [Day] or [Day] work for you?"`,
    tip: `Always give two options — it's a micro-commitment technique. Don't ask "do you want to meet?" (too easy to say no). Ask "which day works better?" Makes it feel like a yes is already assumed.`,
  },
  {
    step: 6,
    title: 'Handle Objections',
    color: '#EF4444',
    script: `See the objection cards below — each has a tailored response. Stay calm, validate their concern, then redirect. Never argue. Never push. A handled objection is a door reopened.`,
    tip: `The goal of handling an objection is not to win an argument — it's to keep the conversation alive. Breathe. Agree first. Then reframe. Most objections are just hesitations in disguise.`,
  },
  {
    step: 7,
    title: 'Close the Call',
    color: '#059669',
    script: `"Perfect — I'll send you a calendar invite right now to confirm the slot. Just to recap — on our call I'll walk you through the full audit I did on [Business Name], show you what's working and what's not, and give you a clear recommendation on what I'd prioritize first. Looking forward to speaking more on [Day]. Have a great day, [Name]!"`,
    tip: `Confirm the meeting before you hang up. Repeat the time and day. Send the invite immediately after the call while you're top of mind. Set a reminder to follow up 1 day before the meeting.`,
  },
];

const OBJECTIONS = [
  {
    obj: '"I\'m not interested."',
    response: `"I completely understand — I wasn't calling to pitch a package. Can I ask, is it that you're not looking to grow right now, or is it more about the timing or budget side of things? I just want to make sure I'm not wasting your time."`,
    tip: 'Acknowledge, then gently probe the root cause. Most "not interested" responses are reflexive — not a firm no.',
  },
  {
    obj: '"We already have someone handling this."',
    response: `"That's great to hear! Out of curiosity, how are results going with them? I ask because a lot of businesses we work with came to us after their last agency wasn't moving the needle. If things are going well, I won't take up more of your time — but if there's any frustration there, I'd love to show you what we do differently."`,
    tip: 'Don\'t dismiss their current agency. Ask about results. If they\'re happy — respect it and leave a good impression. If they\'re frustrated — you just found your opening.',
  },
  {
    obj: '"Just send me an email."',
    response: `"Absolutely, happy to do that. To make sure I send you something actually relevant, can I ask — what would be most useful for you to see? Is it pricing, case studies from similar businesses, or the specific audit I ran on your site?"`,
    tip: 'Don\'t just say "sure" and hang up. Turn this into a qualifying conversation. An email sent without context gets deleted.',
  },
  {
    obj: '"I don\'t have time right now."',
    response: `"No problem at all — I can tell you're busy, and I'll be brief. When would be a better time to reconnect? Tomorrow morning, or later this week?"`,
    tip: 'Short, clean, respectful. Offer two specific options. Never just say "I\'ll call back sometime" — get a commitment.',
  },
  {
    obj: '"How much does it cost?"',
    response: `"Great question — and honestly, it depends entirely on what you need most, which I don't fully know yet. That's exactly why I want that 20-minute call first. I'd rather give you an accurate number than throw out a random figure that might not even apply to your situation. It's worth the 20 minutes."`,
    tip: 'Never give pricing over the phone without context. It always sounds too high or too vague. The meeting is where you present value before cost.',
  },
  {
    obj: '"I\'ve tried digital marketing before and it didn\'t work."',
    response: `"I hear that a lot, and I'm sorry that was your experience. Can I ask — what did you try and what kind of results were you expecting? I want to understand what went wrong before I say anything about what we do, because the last thing I want is for you to go through that again."`,
    tip: 'Show empathy first. Diagnose before prescribing. If their past experience was bad, find out why — then position your approach as the fix.',
  },
];

function StepCard({ step: s }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div
        className="flex items-center gap-3 px-6 py-4"
        style={{ borderLeft: `4px solid ${s.color}` }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ backgroundColor: s.color }}
        >
          {s.step}
        </div>
        <h2 className="text-base font-bold text-gray-900">{s.title}</h2>
      </div>
      <div className="px-6 pb-5">
        <div className="bg-gray-50 rounded-xl px-4 py-3.5 mb-3">
          <p className="text-sm text-gray-700 leading-relaxed italic">{s.script}</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-xs font-bold text-amber-500 mt-0.5 shrink-0">TIP</span>
          <p className="text-xs text-gray-500 leading-relaxed">{s.tip}</p>
        </div>
      </div>
    </div>
  );
}

function ObjectionCard({ o }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-800">{o.obj}</span>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
          <div className="mt-3 bg-white rounded-lg px-4 py-3 mb-2">
            <p className="text-sm text-gray-700 leading-relaxed italic">{o.response}</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs font-bold text-amber-500 mt-0.5 shrink-0">TIP</span>
            <p className="text-xs text-gray-500 leading-relaxed">{o.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ColdCallScript() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cold Call Script</h1>
          <p className="text-sm text-gray-400 mt-1">Step-by-step guide for outbound calls</p>
        </div>
        <button
          onClick={() => window.print()}
          className="no-print flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Printer size={16} /> Print Script
        </button>
      </div>

      <div className="space-y-4 mb-10">
        {STEPS.map(s => <StepCard key={s.step} step={s} />)}
      </div>

      <div className="border-t border-gray-100 pt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Objection Handler</h2>
        <p className="text-sm text-gray-400 mb-5">Click any objection to reveal your response strategy.</p>
        <div className="space-y-2">
          {OBJECTIONS.map((o, i) => <ObjectionCard key={i} o={o} />)}
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl px-6 py-5">
        <h3 className="text-sm font-bold text-blue-800 mb-2">Before Every Call — Quick Checklist</h3>
        <ul className="space-y-1.5">
          {[
            'Look up the business online before dialing — have a specific observation ready',
            'Know their industry, rough size, and what services they might need',
            'Set your goal: book the meeting. Not to sell the package.',
            'Have your CRM open — enter notes in real time while they\'re talking',
            'Stand up while calling — your energy and voice projection improve significantly',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
              <span className="text-blue-400 font-bold mt-0.5">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
