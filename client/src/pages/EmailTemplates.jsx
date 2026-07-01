import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const TEMPLATES = [
  {
    id: 1,
    title: 'Initial Cold Outreach',
    tag: 'First Touch',
    tagColor: '#3A86FF',
    subject: 'Quick question about [Business Name]\'s online presence',
    body: `Hi [First Name],

I came across [Business Name] while researching [industry] businesses in [city/area] and wanted to reach out.

I ran a quick audit on your online presence and noticed a few things that could be holding you back from getting more clients online — specifically with your [website / social media / Google visibility].

At Sparkflow Digital, we help [industry] businesses like yours get more visibility, more leads, and more conversions through strategic digital marketing. We've worked with similar businesses and consistently seen strong results.

I'd love to share what I found in the audit — no pitch, just honest feedback. Would you be open to a quick 15–20 minute call this week?

Looking forward to hearing from you.

Best,
[Your Name]
Sparkflow Digital
[Phone] | [Email]`,
  },
  {
    id: 2,
    title: 'Follow-Up (3 Days)',
    tag: 'Follow-Up',
    tagColor: '#8B5CF6',
    subject: 'RE: [Business Name] — just checking in',
    body: `Hi [First Name],

Just wanted to follow up on my previous email about [Business Name]'s online presence.

I know inboxes get busy — I just didn't want this to fall through the cracks because the audit findings were genuinely worth sharing.

Here's a quick preview of what I found:

• [Specific issue 1 — e.g., Your website isn't appearing in Google results for key search terms in your area]
• [Specific issue 2 — e.g., Your social engagement rate is below average for your industry]
• [Specific issue 3 — e.g., There's no clear call-to-action on your homepage]

These are things we see all the time — and they're all fixable.

If you're open to it, I'd love a 15-minute call to walk you through the full audit. No commitment — just a conversation.

Would [Day, Date] at [Time] work for you?

Best,
[Your Name]
Sparkflow Digital
[Phone] | [Email]`,
  },
  {
    id: 3,
    title: 'Post-Call Summary',
    tag: 'Post-Meeting',
    tagColor: '#10B981',
    subject: 'Great speaking with you, [First Name] — next steps for [Business Name]',
    body: `Hi [First Name],

It was great speaking with you earlier today! I really enjoyed learning more about [Business Name] and your goals for [specific goal they mentioned].

As promised, here's a quick summary of what we discussed:

What we covered:
• [Key point 1 from the call]
• [Key point 2 from the call]
• [Main pain point or challenge identified]

What I'm recommending:
Based on our conversation, I believe the best starting point for [Business Name] would be [Primary Service] focused on [specific goal]. This would directly address [their main problem] and position you to [desired outcome].

Next steps:
1. I'll put together a tailored proposal based on our discussion
2. We'll schedule a second call to review it together — [Proposed Date/Time]
3. If it's a fit, we can get started within [timeframe]

Feel free to reach out if you have any questions before then. I'm looking forward to putting something compelling together for you.

Best,
[Your Name]
Sparkflow Digital
[Phone] | [Email]`,
  },
  {
    id: 4,
    title: 'Proposal Follow-Up',
    tag: 'Closing',
    tagColor: '#F59E0B',
    subject: 'Following up on our proposal for [Business Name]',
    body: `Hi [First Name],

I hope things are going well! I wanted to follow up on the proposal I sent over on [Date].

I know decisions like this take some thought — especially when you're juggling everything else that comes with running a business. I just want to make sure you have everything you need to make the best call for [Business Name].

A few things worth keeping in mind:

✓ [Key benefit 1 — e.g., The strategy we proposed is designed to show measurable results within 60–90 days]
✓ [Key benefit 2 — e.g., We handle everything end-to-end so you don't have to add anything to your plate]
✓ [Key benefit 3 — e.g., We work with a small number of clients at a time to keep quality high]

If you have any questions about the pricing, scope, or timeline — I'm happy to jump on a quick 10-minute call to address them. Or if there's a specific concern holding things up, just reply and let me know and I'll do my best to address it directly.

Looking forward to the chance to work together.

Best,
[Your Name]
Sparkflow Digital
[Phone] | [Email]`,
  },
];

function highlightVars(text) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return parts.map((part, i) =>
    part.startsWith('[') && part.endsWith(']')
      ? <mark key={i} className="bg-yellow-200 text-yellow-800 rounded px-0.5 not-italic">{part}</mark>
      : part
  );
}

function TemplateCard({ template }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const full = `Subject: ${template.subject}\n\n${template.body}`;
    navigator.clipboard.writeText(full).then(() => {
      setCopied(true);
      toast.success('Template copied to clipboard!', { icon: '📋' });
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => toast.error('Copy failed — please copy manually.'));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: template.tagColor }}
          >
            {template.tag}
          </span>
          <h2 className="text-base font-bold text-gray-900">{template.title}</h2>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            copied
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="px-6 py-4">
        <div className="mb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Subject Line</span>
          <p className="mt-1 text-sm font-semibold text-gray-800 bg-gray-50 rounded-lg px-3 py-2">
            {highlightVars(template.subject)}
          </p>
        </div>
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Body</span>
          <div className="mt-1 bg-gray-50 rounded-xl px-4 py-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
              {highlightVars(template.body)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmailTemplates() {
  const handleCopyAll = () => {
    const all = TEMPLATES.map(t => `=== ${t.title} ===\nSubject: ${t.subject}\n\n${t.body}`).join('\n\n---\n\n');
    navigator.clipboard.writeText(all).then(() => {
      toast.success('All 4 templates copied!', { icon: '📋' });
    });
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-sm text-gray-400 mt-1">4 ready-to-use outreach templates</p>
        </div>
        <button
          onClick={handleCopyAll}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Copy size={16} /> Copy All Templates
        </button>
      </div>

      <div className="mb-5 flex items-center gap-2 bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3">
        <span className="text-yellow-500">💡</span>
        <p className="text-sm text-yellow-700">
          <strong>Personalization tip:</strong> Yellow highlighted text <mark className="bg-yellow-200 text-yellow-800 rounded px-0.5">[like this]</mark> indicates variables to replace before sending. The more specific you are, the better your reply rate.
        </p>
      </div>

      <div className="space-y-6">
        {TEMPLATES.map(t => <TemplateCard key={t.id} template={t} />)}
      </div>
    </div>
  );
}
