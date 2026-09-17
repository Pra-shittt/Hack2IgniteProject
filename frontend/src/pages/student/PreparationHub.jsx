import { useState, useEffect } from 'react';
import { BookOpen, Code2, Users, Lightbulb, ExternalLink, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Trophy, ArrowLeft } from 'lucide-react';

/* ───────────────── Company Data ───────────────── */
const COMPANIES = [
  {
    id: 'tcs',
    name: 'TCS',
    color: '#2563eb',
    bg: '#dbeafe',
    codingQuestions: [
      { title: 'Two Sum', platform: 'LeetCode', url: 'https://leetcode.com/problems/two-sum/', difficulty: 'Easy' },
      { title: 'Reverse Linked List', platform: 'LeetCode', url: 'https://leetcode.com/problems/reverse-linked-list/', difficulty: 'Easy' },
      { title: 'Valid Parentheses', platform: 'LeetCode', url: 'https://leetcode.com/problems/valid-parentheses/', difficulty: 'Easy' },
      { title: 'Maximum Subarray', platform: 'LeetCode', url: 'https://leetcode.com/problems/maximum-subarray/', difficulty: 'Medium' },
      { title: 'Fibonacci Number', platform: 'CodeChef', url: 'https://www.codechef.com/problems/FIBXOR01', difficulty: 'Easy' },
    ],
    mcqs: [
      { question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 1 },
      { question: 'Which data structure uses FIFO?', options: ['Stack', 'Queue', 'Tree', 'Graph'], correct: 1 },
      { question: 'What does SQL stand for?', options: ['Strong Query Language', 'Structured Query Language', 'Simple Query Logic', 'Standard Query Language'], correct: 1 },
      { question: 'Which protocol is used for secure web browsing?', options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'], correct: 2 },
    ],
    interviewQuestions: [
      'Tell me about yourself.',
      'Why do you want to join TCS?',
      'What is the difference between TCP and UDP?',
      'Explain Object-Oriented Programming concepts.',
      'What is normalization in databases?',
    ],
  },
  {
    id: 'infosys',
    name: 'Infosys',
    color: '#0ea5e9',
    bg: '#e0f2fe',
    codingQuestions: [
      { title: 'Merge Two Sorted Lists', platform: 'LeetCode', url: 'https://leetcode.com/problems/merge-two-sorted-lists/', difficulty: 'Easy' },
      { title: 'Best Time to Buy and Sell Stock', platform: 'LeetCode', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', difficulty: 'Easy' },
      { title: 'Climbing Stairs', platform: 'LeetCode', url: 'https://leetcode.com/problems/climbing-stairs/', difficulty: 'Easy' },
      { title: 'Power Set', platform: 'CodeForces', url: 'https://codeforces.com/problemset/problem/236/A', difficulty: 'Medium' },
    ],
    mcqs: [
      { question: 'Which keyword is used to inherit a class in Java?', options: ['implements', 'extends', 'inherits', 'super'], correct: 1 },
      { question: 'What is the default port for HTTP?', options: ['443', '8080', '80', '3000'], correct: 2 },
      { question: 'Which of these is NOT a JavaScript data type?', options: ['Boolean', 'Float', 'String', 'Undefined'], correct: 1 },
      { question: 'What does REST stand for?', options: ['Representational State Transfer', 'Remote Execution Standard Technology', 'Reliable Server Transaction', 'Real-time Event Stream Transfer'], correct: 0 },
    ],
    interviewQuestions: [
      'Why Infosys over other IT companies?',
      'Explain the concept of Cloud Computing.',
      'What is Agile methodology?',
      'Describe a project you are proud of.',
      'What is the difference between an Array and a Linked List?',
    ],
  },
  {
    id: 'wipro',
    name: 'Wipro',
    color: '#7c3aed',
    bg: '#ede9fe',
    codingQuestions: [
      { title: 'Palindrome Number', platform: 'LeetCode', url: 'https://leetcode.com/problems/palindrome-number/', difficulty: 'Easy' },
      { title: 'Remove Duplicates from Sorted Array', platform: 'LeetCode', url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/', difficulty: 'Easy' },
      { title: 'String Compression', platform: 'LeetCode', url: 'https://leetcode.com/problems/string-compression/', difficulty: 'Medium' },
      { title: 'Watermelon', platform: 'CodeForces', url: 'https://codeforces.com/problemset/problem/4/A', difficulty: 'Easy' },
    ],
    mcqs: [
      { question: 'Which sorting algorithm has the best average case complexity?', options: ['Bubble Sort', 'Quick Sort', 'Selection Sort', 'Insertion Sort'], correct: 1 },
      { question: 'What is polymorphism in OOP?', options: ['Multiple inheritance', 'Same interface, different implementations', 'Data hiding', 'Method overloading only'], correct: 1 },
      { question: 'What does DNS stand for?', options: ['Data Network Service', 'Domain Name System', 'Digital Network Security', 'Dynamic Name Server'], correct: 1 },
    ],
    interviewQuestions: [
      'What motivates you as a software engineer?',
      'Explain MVC architecture.',
      'How would you handle a conflict in a team?',
      'What is version control? Why is Git important?',
    ],
  },
  {
    id: 'google',
    name: 'Google',
    color: '#ea4335',
    bg: '#fee2e2',
    codingQuestions: [
      { title: 'Longest Substring Without Repeating Characters', platform: 'LeetCode', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', difficulty: 'Medium' },
      { title: 'Median of Two Sorted Arrays', platform: 'LeetCode', url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/', difficulty: 'Hard' },
      { title: 'LRU Cache', platform: 'LeetCode', url: 'https://leetcode.com/problems/lru-cache/', difficulty: 'Medium' },
      { title: 'Word Break', platform: 'LeetCode', url: 'https://leetcode.com/problems/word-break/', difficulty: 'Medium' },
      { title: 'Trapping Rain Water', platform: 'LeetCode', url: 'https://leetcode.com/problems/trapping-rain-water/', difficulty: 'Hard' },
    ],
    mcqs: [
      { question: 'What is the time complexity of HashMap get() in Java?', options: ['O(n)', 'O(1) average', 'O(log n)', 'O(n²)'], correct: 1 },
      { question: 'Which algorithm is used by Google Search for ranking?', options: ['Dijkstra', 'PageRank', 'BFS', 'A*'], correct: 1 },
      { question: 'What is the CAP theorem about?', options: ['Caching strategies', 'Distributed systems tradeoffs', 'Compiler optimization', 'CPU architecture'], correct: 1 },
    ],
    interviewQuestions: [
      'Design a URL shortener system.',
      'Explain how a garbage collector works.',
      'What happens when you type a URL in the browser?',
      'Tell me about a time you solved a difficult bug.',
      'How would you design Google Docs collaboration feature?',
    ],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    color: '#f59e0b',
    bg: '#fef3c7',
    codingQuestions: [
      { title: 'Number of Islands', platform: 'LeetCode', url: 'https://leetcode.com/problems/number-of-islands/', difficulty: 'Medium' },
      { title: 'Rotate Image', platform: 'LeetCode', url: 'https://leetcode.com/problems/rotate-image/', difficulty: 'Medium' },
      { title: 'Product of Array Except Self', platform: 'LeetCode', url: 'https://leetcode.com/problems/product-of-array-except-self/', difficulty: 'Medium' },
      { title: 'Min Stack', platform: 'LeetCode', url: 'https://leetcode.com/problems/min-stack/', difficulty: 'Medium' },
      { title: 'Merge Intervals', platform: 'LeetCode', url: 'https://leetcode.com/problems/merge-intervals/', difficulty: 'Medium' },
    ],
    mcqs: [
      { question: 'What is Amazon\'s leadership principle about Customer Obsession?', options: ['Focus on competitors', 'Start with the customer and work backwards', 'Maximize profit', 'Reduce costs first'], correct: 1 },
      { question: 'Which AWS service is used for serverless computing?', options: ['EC2', 'Lambda', 'S3', 'RDS'], correct: 1 },
      { question: 'What is a microservices architecture?', options: ['One large application', 'Small independent services', 'Database design pattern', 'Frontend framework'], correct: 1 },
    ],
    interviewQuestions: [
      'Describe a time you took ownership of a project.',
      'How would you design an e-commerce cart system?',
      'Explain eventual consistency.',
      'What is the difference between SQL and NoSQL?',
      'Tell me about a time you disagreed with a teammate.',
    ],
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    color: '#0078d4',
    bg: '#dbeafe',
    codingQuestions: [
      { title: 'Binary Tree Level Order Traversal', platform: 'LeetCode', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', difficulty: 'Medium' },
      { title: '3Sum', platform: 'LeetCode', url: 'https://leetcode.com/problems/3sum/', difficulty: 'Medium' },
      { title: 'Linked List Cycle', platform: 'LeetCode', url: 'https://leetcode.com/problems/linked-list-cycle/', difficulty: 'Easy' },
      { title: 'Implement Trie', platform: 'LeetCode', url: 'https://leetcode.com/problems/implement-trie-prefix-tree/', difficulty: 'Medium' },
    ],
    mcqs: [
      { question: 'What is Azure?', options: ['A programming language', 'Microsoft\'s cloud platform', 'A database', 'A frontend framework'], correct: 1 },
      { question: 'Which design pattern does C# use for events?', options: ['Singleton', 'Observer', 'Factory', 'Strategy'], correct: 1 },
      { question: 'What is the purpose of a load balancer?', options: ['Encrypt data', 'Distribute traffic across servers', 'Store backups', 'Compress files'], correct: 1 },
    ],
    interviewQuestions: [
      'Design a parking lot system.',
      'What is dependency injection?',
      'Explain the SOLID principles.',
      'How do you handle technical debt?',
      'Describe your approach to code reviews.',
    ],
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    color: '#047857',
    bg: '#dcfce7',
    codingQuestions: [
      { title: 'Search in Rotated Sorted Array', platform: 'LeetCode', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', difficulty: 'Medium' },
      { title: 'Coin Change', platform: 'LeetCode', url: 'https://leetcode.com/problems/coin-change/', difficulty: 'Medium' },
      { title: 'Matrix Chain Multiplication', platform: 'CodeChef', url: 'https://www.codechef.com/problems/MTRXCHN', difficulty: 'Hard' },
      { title: 'Subarray Sum Equals K', platform: 'LeetCode', url: 'https://leetcode.com/problems/subarray-sum-equals-k/', difficulty: 'Medium' },
    ],
    mcqs: [
      { question: 'What is a CDN used for?', options: ['Code compilation', 'Content delivery & caching', 'Database management', 'User authentication'], correct: 1 },
      { question: 'Which data structure is best for implementing autocomplete?', options: ['Array', 'Trie', 'Stack', 'Queue'], correct: 1 },
      { question: 'What is sharding in databases?', options: ['Encryption', 'Horizontal partitioning', 'Vertical scaling', 'Caching'], correct: 1 },
    ],
    interviewQuestions: [
      'Design a notification system for an e-commerce app.',
      'How would you handle a flash sale with millions of users?',
      'Explain the difference between horizontal and vertical scaling.',
      'What are your favorite Flipkart features and how would you improve them?',
    ],
  },
];

const RESOURCES = [
  { label: 'LeetCode', url: 'https://leetcode.com', desc: 'Data structures & algorithms problems', color: '#f59e0b' },
  { label: 'CodeForces', url: 'https://codeforces.com', desc: 'Competitive programming contests', color: '#2563eb' },
  { label: 'CodeChef', url: 'https://www.codechef.com', desc: 'Coding challenges & competitions', color: '#7c3aed' },
  { label: 'HackerRank', url: 'https://hackerrank.com', desc: 'Practice & certification', color: '#22c55e' },
  { label: 'GeeksForGeeks', url: 'https://geeksforgeeks.org', desc: 'Tutorials & interview prep', color: '#0ea5e9' },
  { label: 'InterviewBit', url: 'https://www.interviewbit.com', desc: 'Structured interview preparation', color: '#ef4444' },
];

const difficultyColor = {
  Easy: { bg: '#dcfce7', color: '#16a34a' },
  Medium: { bg: '#fef3c7', color: '#d97706' },
  Hard: { bg: '#fee2e2', color: '#dc2626' },
};

/* ───────────────── Component ───────────────── */
export default function PreparationHub() {
  const [activeTab, setActiveTab] = useState('companies');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyTab, setCompanyTab] = useState('coding');
  const [revealedMcqs, setRevealedMcqs] = useState({});
  // Quiz state
  const [quizCompany, setQuizCompany] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizTimer, setQuizTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Timer
  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => setQuizTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const startQuiz = (company) => {
    setQuizCompany(company);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizTimer(0);
    setTimerRunning(true);
    setActiveTab('quiz');
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
    setTimerRunning(false);
  };

  const quizScore = quizCompany
    ? quizCompany.mcqs.reduce((score, q, i) => score + (quizAnswers[i] === q.correct ? 1 : 0), 0)
    : 0;

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const toggleMcqReveal = (companyId, idx) => {
    const key = `${companyId}-${idx}`;
    setRevealedMcqs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  /* ── Company Detail View ── */
  if (selectedCompany) {
    const company = selectedCompany;
    const tabs = [
      { id: 'coding', label: '💻 Coding Questions', icon: Code2 },
      { id: 'mcqs', label: '📝 MCQ Questions', icon: BookOpen },
      { id: 'interview', label: '🤝 Interview Questions', icon: Users },
    ];

    return (
      <div>
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSelectedCompany(null)} className="btn btn-ghost btn-sm"
              style={{ padding: '6px 10px' }}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="page-title">{company.name} — Preparation</h1>
              <p className="page-subtitle">Previously asked questions and practice resources</p>
            </div>
          </div>
          <button onClick={() => startQuiz(company)} className="btn btn-primary btn-sm">
            🧠 Take Quiz
          </button>
        </div>

        {/* Sub-tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setCompanyTab(t.id)}
              className={`btn ${companyTab === t.id ? 'btn-primary' : 'btn-ghost'} btn-sm`}
              style={companyTab !== t.id ? { background: '#f1f5f9', color: '#475569' } : {}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Coding Questions */}
        {companyTab === 'coding' && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: company.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Code2 size={20} color={company.color} />
              </div>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '1.05rem' }}>Previously Asked Coding Questions</h2>
                <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Click to practice on the original platform</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {company.codingQuestions.map((q, i) => {
                const dc = difficultyColor[q.difficulty];
                return (
                  <a key={i} href={q.url} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#f8fafc', borderRadius: 10, textDecoration: 'none', border: '1px solid #e2e8f0', transition: 'all 0.15s' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = company.color; e.currentTarget.style.background = company.bg + '40'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ color: company.color, fontWeight: 700, fontSize: '0.875rem', width: 24 }}>{i + 1}.</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{q.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{q.platform}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: dc.bg, color: dc.color }}>
                        {q.difficulty}
                      </span>
                      <ExternalLink size={14} color="#94a3b8" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* MCQ Questions */}
        {companyTab === 'mcqs' && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: company.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={20} color={company.color} />
              </div>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '1.05rem' }}>MCQ Practice Questions</h2>
                <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Click "Reveal Answer" to check your knowledge</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {company.mcqs.map((q, i) => {
                const key = `${company.id}-${i}`;
                const revealed = revealedMcqs[key];
                return (
                  <div key={i} style={{ padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a', marginBottom: 12 }}>
                      <span style={{ color: company.color, marginRight: 8 }}>Q{i + 1}.</span>
                      {q.question}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {q.options.map((opt, j) => {
                        const isCorrect = j === q.correct;
                        const optStyle = revealed
                          ? isCorrect
                            ? { background: '#dcfce7', borderColor: '#22c55e', color: '#16a34a' }
                            : { background: '#fee2e2', borderColor: '#fca5a5', color: '#dc2626', opacity: 0.6 }
                          : {};
                        return (
                          <div key={j} style={{
                            padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0',
                            fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 8,
                            transition: 'all 0.15s', ...optStyle,
                          }}>
                            <span style={{ fontWeight: 700, color: revealed ? 'inherit' : '#94a3b8', fontSize: '0.75rem' }}>
                              {String.fromCharCode(65 + j)}.
                            </span>
                            {opt}
                            {revealed && isCorrect && <CheckCircle size={14} color="#16a34a" style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                          </div>
                        );
                      })}
                    </div>
                    <button onClick={() => toggleMcqReveal(company.id, i)}
                      className="btn btn-ghost btn-sm" style={{ marginTop: 10, fontSize: '0.75rem' }}>
                      {revealed ? '🙈 Hide Answer' : '👁️ Reveal Answer'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Interview Questions */}
        {companyTab === 'interview' && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: company.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} color={company.color} />
              </div>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '1.05rem' }}>Previously Asked Interview Questions</h2>
                <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Prepare your answers using the STAR method</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {company.interviewQuestions.map((q, i) => (
                <div key={i} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, borderLeft: `3px solid ${company.color}` }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ color: company.color, fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>{i + 1}.</span>
                    <p style={{ margin: 0, color: '#374151', fontSize: '0.875rem', lineHeight: 1.6 }}>{q}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Quiz Mode ── */
  if (activeTab === 'quiz' && quizCompany) {
    return (
      <div>
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => { setActiveTab('companies'); setQuizCompany(null); setTimerRunning(false); }}
              className="btn btn-ghost btn-sm" style={{ padding: '6px 10px' }}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="page-title">🧠 Quiz — {quizCompany.name}</h1>
              <p className="page-subtitle">{quizCompany.mcqs.length} questions</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#f1f5f9', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600 }}>
              <Clock size={16} color="#64748b" />
              {formatTime(quizTimer)}
            </div>
            {!quizSubmitted && (
              <button onClick={submitQuiz} className="btn btn-primary btn-sm"
                disabled={Object.keys(quizAnswers).length < quizCompany.mcqs.length}>
                Submit Quiz
              </button>
            )}
          </div>
        </div>

        {quizSubmitted && (
          <div className="card" style={{
            marginBottom: 20, textAlign: 'center',
            background: quizScore === quizCompany.mcqs.length
              ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)'
              : quizScore >= quizCompany.mcqs.length / 2
                ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                : 'linear-gradient(135deg, #fee2e2, #fecaca)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>
              {quizScore === quizCompany.mcqs.length ? '🏆' : quizScore >= quizCompany.mcqs.length / 2 ? '👍' : '📚'}
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 4 }}>
              Score: {quizScore}/{quizCompany.mcqs.length}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Time: {formatTime(quizTimer)} •
              {quizScore === quizCompany.mcqs.length ? ' Perfect!' : quizScore >= quizCompany.mcqs.length / 2 ? ' Good job!' : ' Keep practicing!'}
            </p>
            <button onClick={() => startQuiz(quizCompany)} className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
              🔄 Retry Quiz
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {quizCompany.mcqs.map((q, i) => {
            const answered = quizAnswers[i] !== undefined;
            const isCorrect = quizSubmitted && quizAnswers[i] === q.correct;
            const isWrong = quizSubmitted && answered && quizAnswers[i] !== q.correct;
            return (
              <div key={i} className="card" style={{
                border: quizSubmitted
                  ? isCorrect ? '2px solid #22c55e' : isWrong ? '2px solid #ef4444' : '1px solid #e2e8f0'
                  : '1px solid #e2e8f0',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                    <span style={{ color: quizCompany.color, marginRight: 8 }}>Q{i + 1}.</span>
                    {q.question}
                  </div>
                  {quizSubmitted && (
                    isCorrect
                      ? <CheckCircle size={20} color="#22c55e" style={{ flexShrink: 0 }} />
                      : isWrong
                        ? <XCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
                        : null
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {q.options.map((opt, j) => {
                    const isSelected = quizAnswers[i] === j;
                    const optCorrect = j === q.correct;
                    let bg = 'white';
                    let borderCol = isSelected ? quizCompany.color : '#e2e8f0';
                    if (quizSubmitted) {
                      if (optCorrect) { bg = '#dcfce7'; borderCol = '#22c55e'; }
                      else if (isSelected && !optCorrect) { bg = '#fee2e2'; borderCol = '#ef4444'; }
                    }
                    return (
                      <button key={j} disabled={quizSubmitted}
                        onClick={() => setQuizAnswers(prev => ({ ...prev, [i]: j }))}
                        style={{
                          padding: '10px 14px', borderRadius: 8, border: `2px solid ${borderCol}`,
                          fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 8,
                          background: bg, cursor: quizSubmitted ? 'default' : 'pointer',
                          fontWeight: isSelected ? 600 : 400, textAlign: 'left',
                          transition: 'all 0.15s', fontFamily: 'inherit',
                        }}>
                        <span style={{ fontWeight: 700, color: '#94a3b8', fontSize: '0.75rem' }}>
                          {String.fromCharCode(65 + j)}.
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Main View: Companies + Resources ── */
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📚 Preparation Hub</h1>
          <p className="page-subtitle">Company-wise interview preparation with questions, MCQs & quizzes</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { id: 'companies', label: '🏢 Companies' },
          { id: 'resources', label: '📚 Resources' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            style={activeTab !== t.id ? { background: '#f1f5f9', color: '#475569' } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Companies Grid */}
      {activeTab === 'companies' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {COMPANIES.map(company => (
            <div key={company.id} className="card card-hover" style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
              onClick={() => { setSelectedCompany(company); setCompanyTab('coding'); }}>
              {/* Decorative circle */}
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: company.bg, opacity: 0.5 }} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, background: company.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '1.1rem', color: company.color, flexShrink: 0,
                  }}>
                    {company.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{company.name}</h3>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {company.codingQuestions.length} coding • {company.mcqs.length} MCQs • {company.interviewQuestions.length} interview
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                  <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>💻 {company.codingQuestions.length} Coding</span>
                  <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>📝 {company.mcqs.length} MCQs</span>
                  <span className="badge badge-warning" style={{ fontSize: '0.68rem' }}>🤝 {company.interviewQuestions.length} Interview</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedCompany(company); setCompanyTab('coding'); }}
                    className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', flex: 1, background: company.bg, color: company.color }}>
                    View Questions →
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); startQuiz(company); }}
                    className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#d97706' }}>
                    🧠 Quiz
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resources */}
      {activeTab === 'resources' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={20} color="#22c55e" />
            </div>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>📚 Practice Platforms</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {RESOURCES.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noreferrer"
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 16px', background: '#f8fafc', borderRadius: 10,
                  textDecoration: 'none', border: '1px solid #e2e8f0', transition: 'all 0.15s',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = link.color; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: link.color, marginBottom: 2 }}>{link.label}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{link.desc}</div>
                </div>
                <ExternalLink size={16} color="#94a3b8" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
