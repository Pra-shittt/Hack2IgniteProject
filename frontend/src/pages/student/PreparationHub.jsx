import { useState } from 'react';
import { BookOpen, Code2, Users, Lightbulb, ExternalLink } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'technical',
    label: '💻 Technical Interview',
    icon: Code2,
    color: '#4f46e5',
    bg: '#ede9fe',
    questions: [
      'Explain the difference between SQL and NoSQL databases.',
      'What is the time complexity of binary search?',
      'How does a REST API work? What are HTTP methods?',
      'What are the SOLID principles in software development?',
      'Explain the concept of closures in JavaScript.',
      'What is the difference between synchronous and asynchronous programming?',
      'Explain what Docker is and why it is used.',
      'What is the MVC architecture pattern?',
      'How would you optimize a slow database query?',
      'Explain the difference between a stack and a queue.',
    ],
  },
  {
    id: 'hr',
    label: '🤝 HR Interview',
    icon: Users,
    color: '#0ea5e9',
    bg: '#e0f2fe',
    questions: [
      'Tell me about yourself.',
      'Why are you interested in this internship?',
      'What are your greatest strengths and weaknesses?',
      'Where do you see yourself in 5 years?',
      'Describe a challenging situation and how you handled it.',
      'How do you prioritize tasks when you have multiple deadlines?',
      'Tell me about a project you are most proud of.',
      'How do you handle feedback and criticism?',
      'Why should we hire you over other candidates?',
      'What do you know about our company?',
    ],
  },
  {
    id: 'tips',
    label: '💡 Preparation Tips',
    icon: Lightbulb,
    color: '#f59e0b',
    bg: '#fef3c7',
    items: [
      { title: 'Research the company', desc: 'Understand their products, culture, and recent news before the interview.' },
      { title: 'Practice coding on a whiteboard/Leetcode', desc: 'Focus on arrays, strings, trees, and dynamic programming.' },
      { title: 'Prepare your STAR stories', desc: 'Use Situation-Task-Action-Result format for behavioral questions.' },
      { title: 'Know your resume', desc: 'Be ready to explain every project and skill listed.' },
      { title: 'Ask good questions', desc: 'Prepare 3-5 thoughtful questions for the interviewer.' },
      { title: 'Test your tech setup', desc: 'Check audio, video, and internet before video interviews.' },
      { title: 'Dress professionally', desc: 'First impressions matter, even on video calls.' },
      { title: 'Be on time', desc: 'Join video calls 5 minutes early.' },
    ],
  },
  {
    id: 'resources',
    label: '📚 Resources',
    icon: BookOpen,
    color: '#22c55e',
    bg: '#dcfce7',
    links: [
      { label: 'LeetCode - Practice coding', url: 'https://leetcode.com', desc: 'Data structures & algorithms problems' },
      { label: 'HackerRank', url: 'https://hackerrank.com', desc: 'Coding challenges and certification' },
      { label: 'Glassdoor - Interview Reviews', url: 'https://glassdoor.com', desc: 'Real interview experiences by company' },
      { label: 'LinkedIn Learning', url: 'https://linkedin.com/learning', desc: 'Professional development courses' },
      { label: 'freeCodeCamp', url: 'https://freecodecamp.org', desc: 'Free web development courses' },
      { label: 'GitHub - Build your portfolio', url: 'https://github.com', desc: 'Showcase your projects' },
    ],
  },
];

export default function PreparationHub() {
  const [activeTab, setActiveTab] = useState('technical');

  const cat = CATEGORIES.find(c => c.id === activeTab);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📚 Preparation Hub</h1>
          <p className="page-subtitle">Prepare for your internship interviews with curated resources</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveTab(c.id)}
            className={`btn ${activeTab === c.id ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            style={{ ...(activeTab === c.id ? {} : { background: '#f1f5f9', color: '#475569' }) }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <cat.icon size={20} color={cat.color} />
          </div>
          <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{cat.label}</h2>
        </div>

        {cat.questions && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cat.questions.map((q, i) => (
              <div key={i} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, borderLeft: `3px solid ${cat.color}` }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ color: cat.color, fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>{i + 1}.</span>
                  <p style={{ margin: 0, color: '#374151', fontSize: '0.875rem', lineHeight: 1.6 }}>{q}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {cat.items && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {cat.items.map((item, i) => (
              <div key={i} style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 10, borderLeft: `3px solid ${cat.color}` }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 4, color: '#0f172a' }}>💡 {item.title}</div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        )}

        {cat.links && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cat.links.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noreferrer"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#f8fafc', borderRadius: 10, textDecoration: 'none', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: cat.color, marginBottom: 2 }}>{link.label}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{link.desc}</div>
                </div>
                <ExternalLink size={16} color="#94a3b8" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
