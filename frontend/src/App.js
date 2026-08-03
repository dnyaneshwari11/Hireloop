import { useState, useEffect } from 'react';
import {
  Briefcase, LayoutDashboard, Bell, Brain,
  Plus, LogOut, MapPin, DollarSign, Calendar,
  Trash2, ExternalLink, Zap, ChevronRight, BarChart2, FileText
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  registerUser, loginUser, getJobs, createJob,
  updateJob, deleteJob, getStats, generateCoverLetter, analyzeGap
} from './api/client';
import './App.css';

const STATUS_COLS = [
  { key: 'saved', label: 'Saved' },
  { key: 'applied', label: 'Applied' },
  { key: 'phone_screen', label: 'Phone Screen' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'rejected', label: 'Rejected' },
];

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#22c55e', '#ef4444'];

export default function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [authForm, setAuthForm] = useState({ first_name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [view, setView] = useState('dashboard');
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    company: '', role: '', job_url: '', location: '',
    salary_min: '', salary_max: '', status: 'saved',
    job_description: '', notes: '', applied_date: '', follow_up_date: ''
  });
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [gapResult, setGapResult] = useState('');
  const [gapLoading, setGapLoading] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [showGapInput, setShowGapInput] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (user) { fetchJobs(); fetchStats(); }
  }, [user]);

  useEffect(() => {
    if (selectedJob) setNotes(selectedJob.notes || '');
  }, [selectedJob]);

  const fetchJobs = async () => {
    try { const res = await getJobs(); setJobs(res.data); }
    catch (err) { console.error(err); }
  };

  const fetchStats = async () => {
    try { const res = await getStats(); setStats(res.data); }
    catch (err) { console.error(err); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await loginUser(authForm.email, authForm.password);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Login failed.');
    } finally { setAuthLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await registerUser(authForm.first_name, authForm.email, authForm.password);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    } catch (err) {
      const errData = err.response?.data;
      const msg = errData?.email?.[0] || errData?.error || 'Registration failed.';
      setAuthError(msg);
    } finally { setAuthLoading(false); }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setJobs([]);
    setStats(null);
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    try {
      const data = { ...addForm };
      if (!data.salary_min) delete data.salary_min;
      if (!data.salary_max) delete data.salary_max;
      if (!data.applied_date) delete data.applied_date;
      if (!data.follow_up_date) delete data.follow_up_date;
      await createJob(data);
      setShowAddModal(false);
      setAddForm({
        company: '', role: '', job_url: '', location: '',
        salary_min: '', salary_max: '', status: 'saved',
        job_description: '', notes: '', applied_date: '', follow_up_date: ''
      });
      fetchJobs(); fetchStats();
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await updateJob(jobId, { status: newStatus });
      fetchJobs(); fetchStats();
      if (selectedJob?.id === jobId)
        setSelectedJob(prev => ({ ...prev, status: newStatus }));
    } catch (err) { console.error(err); }
  };

  const handleSaveNotes = async () => {
    try { await updateJob(selectedJob.id, { notes }); fetchJobs(); }
    catch (err) { console.error(err); }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await deleteJob(jobId);
      setSelectedJob(null);
      setView('board');
      fetchJobs(); fetchStats();
    } catch (err) { console.error(err); }
  };

  const handleGenerateCoverLetter = async () => {
    if (!selectedJob) return;
    setAiLoading(true);
    setAiResult('');
    try {
      const res = await generateCoverLetter(selectedJob.id);
      setAiResult(res.data.cover_letter);
    } catch {
      setAiResult('Failed to generate. Make sure the job has a description.');
    } finally { setAiLoading(false); }
  };

  const handleResumeFile = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.type === 'text/plain') {
    const reader = new FileReader();
    reader.onload = (ev) => setResumeText(ev.target.result);
    reader.readAsText(file);
  } else if (file.type === 'application/pdf') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:8000/api/ai/parse-resume/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.text) {
        setResumeText(data.text);
      } else {
        alert('Could not parse PDF. Please paste your resume text instead.');
      }
    } catch {
      alert('Failed to upload PDF. Please paste your resume text instead.');
    }
  } else {
    alert('Please upload a PDF or TXT file.');
  }
};

  const handleAnalyzeGap = async () => {
    if (!resumeText || !selectedJob?.job_description) return;
    setGapLoading(true);
    setGapResult('');
    try {
      const res = await analyzeGap(selectedJob.job_description, resumeText);
      setGapResult(res.data.analysis);
    } catch {
      setGapResult('Failed to analyze. Make sure the job has a description.');
    } finally { setGapLoading(false); }
  };

  const getFollowUps = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return jobs.filter(j => {
      if (!j.follow_up_date) return false;
      const d = new Date(j.follow_up_date);
      return d <= today && ['applied', 'phone_screen', 'interview'].includes(j.status);
    });
  };

  // ── AUTH ──
  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-box">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Briefcase size={20} color="#fff" strokeWidth={2} />
            </div>
            HireLoop
          </div>
          {authView === 'login' ? (
            <>
              <h2>Welcome back</h2>
              <p>Track your job search, land faster.</p>
              {authError && <div className="auth-error">{authError}</div>}
              <form onSubmit={handleLogin}>
                <div className="auth-field">
                  <label>Email</label>
                  <input type="email" placeholder="you@email.com" value={authForm.email}
                    onChange={e => setAuthForm({ ...authForm, email: e.target.value })} required />
                </div>
                <div className="auth-field">
                  <label>Password</label>
                  <input type="password" placeholder="••••••••" value={authForm.password}
                    onChange={e => setAuthForm({ ...authForm, password: e.target.value })} required />
                </div>
                <button className="auth-submit" type="submit" disabled={authLoading}>
                  {authLoading ? 'Logging in...' : 'Log in'}
                </button>
              </form>
              <div className="auth-switch">
                No account? <button onClick={() => { setAuthView('register'); setAuthError(''); }}>Sign up</button>
              </div>
            </>
          ) : (
            <>
              <h2>Create account</h2>
              <p>Start tracking your job search today.</p>
              {authError && <div className="auth-error">{authError}</div>}
              <form onSubmit={handleRegister}>
                <div className="auth-field">
                  <label>Full Name</label>
                  <input type="text" placeholder="Your name" value={authForm.first_name}
                    onChange={e => setAuthForm({ ...authForm, first_name: e.target.value })} required />
                </div>
                <div className="auth-field">
                  <label>Email</label>
                  <input type="email" placeholder="you@email.com" value={authForm.email}
                    onChange={e => setAuthForm({ ...authForm, email: e.target.value })} required />
                </div>
                <div className="auth-field">
                  <label>Password</label>
                  <input type="password" placeholder="Min. 6 characters" value={authForm.password}
                    onChange={e => setAuthForm({ ...authForm, password: e.target.value })} required />
                </div>
                <button className="auth-submit" type="submit" disabled={authLoading}>
                  {authLoading ? 'Creating...' : 'Create account'}
                </button>
              </form>
              <div className="auth-switch">
                Have an account? <button onClick={() => { setAuthView('login'); setAuthError(''); }}>Log in</button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const followUps = getFollowUps();

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Briefcase size={18} color="#fff" strokeWidth={2} />
          </div>
          HireLoop
        </div>

        {[
          { key: 'dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
          { key: 'board', icon: <Briefcase size={16} />, label: 'Applications' },
          { key: 'followups', icon: <Bell size={16} />, label: `Follow-ups${followUps.length > 0 ? ` (${followUps.length})` : ''}` },
          { key: 'analytics', icon: <BarChart2 size={16} />, label: 'Analytics' },
        ].map(item => (
          <button key={item.key}
            className={`sidebar-item ${view === item.key ? 'active' : ''}`}
            onClick={() => { setView(item.key); setSelectedJob(null); }}>
            {item.icon} {item.label}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="user-info">
            <strong>{user.first_name}</strong>
            {user.email}
          </div>
          <button className="sidebar-item" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">

        {/* DASHBOARD */}
        {view === 'dashboard' && !selectedJob && (
          <div className="fade-up">
            <div className="page-header">
              <div>
                <h1>Good day, {user.first_name}</h1>
                <p>Here's your job search at a glance</p>
              </div>
              <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                <Plus size={16} /> Add Application
              </button>
            </div>

            {stats && (
              <div className="stats-grid">
                <div className="stat-card dark">
                  <div className="stat-num">{stats.total}</div>
                  <div className="stat-label">Total Applied</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num">{stats.interview}</div>
                  <div className="stat-label">Interviews</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num">{stats.offer}</div>
                  <div className="stat-label">Offers</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num">{stats.follow_ups_due}</div>
                  <div className="stat-label">Follow-ups Due</div>
                </div>
              </div>
            )}

            <div className="recent-card">
              <div className="recent-card-header">
                <span>Recent Applications</span>
                <button className="view-all-btn" onClick={() => setView('board')}>
                  View all <ChevronRight size={14} />
                </button>
              </div>
              {jobs.slice(0, 5).map(job => (
                <div key={job.id} className="recent-item"
                  onClick={() => { setSelectedJob(job); setView('detail'); }}>
                  <div>
                    <div className="recent-item-company">{job.company}</div>
                    <div className="recent-item-role">{job.role}</div>
                  </div>
                  <span className="status-pill" style={{
                    background: job.status === 'offer' ? 'rgba(34,197,94,0.15)' :
                      job.status === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.1)',
                    color: job.status === 'offer' ? '#4ade80' :
                      job.status === 'rejected' ? '#f87171' : 'rgba(255,255,255,0.6)'
                  }}>
                    {job.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
              {jobs.length === 0 && (
                <div className="empty-state">
                  <h3>No applications yet</h3>
                  <p>Click "Add Application" to get started</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* KANBAN BOARD */}
        {view === 'board' && !selectedJob && (
          <div className="fade-up">
            <div className="page-header">
              <div>
                <h1>Applications</h1>
                <p>{jobs.length} total applications</p>
              </div>
              <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                <Plus size={16} /> Add Application
              </button>
            </div>
            <div className="kanban-board">
              {STATUS_COLS.map(col => {
                const colJobs = jobs.filter(j => j.status === col.key);
                return (
                  <div key={col.key} className="kanban-col">
                    <div className="kanban-col-header">
                      <span className="kanban-col-title">{col.label}</span>
                      <span className="kanban-col-count">{colJobs.length}</span>
                    </div>
                    {colJobs.map(job => (
                      <div key={job.id} className="kanban-card"
                        onClick={() => { setSelectedJob(job); setView('detail'); }}>
                        <div className="kanban-card-company">{job.company}</div>
                        <div className="kanban-card-role">{job.role}</div>
                        <div className="kanban-card-meta">
                          {job.location && <span>{job.location}</span>}
                          {job.follow_up_date && <span className="follow-up-badge">Follow up</span>}
                        </div>
                      </div>
                    ))}
                    {colJobs.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
                        Empty
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* JOB DETAIL */}
        {view === 'detail' && selectedJob && (
          <div className="detail-page fade-up">
            <div className="detail-header">
              <div>
                <button onClick={() => { setSelectedJob(null); setView('board'); }}
                  style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Inter, sans-serif' }}>
                  ← Back to board
                </button>
                <div className="detail-company">{selectedJob.company}</div>
                <div className="detail-role">{selectedJob.role}</div>
                <div className="detail-meta">
                  {selectedJob.location && <span className="detail-meta-item"><MapPin size={13} />{selectedJob.location}</span>}
                  {selectedJob.salary_min && (
                    <span className="detail-meta-item">
                      <DollarSign size={13} />{selectedJob.salary_min.toLocaleString()} — {selectedJob.salary_max?.toLocaleString()}
                    </span>
                  )}
                  {selectedJob.applied_date && <span className="detail-meta-item"><Calendar size={13} />Applied {selectedJob.applied_date}</span>}
                  {selectedJob.job_url && (
                    <a href={selectedJob.job_url} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
                      <ExternalLink size={13} /> Job posting
                    </a>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <select className="status-select" value={selectedJob.status}
                  onChange={e => handleStatusChange(selectedJob.id, e.target.value)}>
                  {STATUS_COLS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
                <button className="btn-danger" onClick={() => handleDelete(selectedJob.id)}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>

            {/* AI PANEL */}
            <div className="ai-panel">
              <h3>AI Assistant</h3>

              {/* Cover Letter */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 8, fontWeight: 600 }}>
                  Cover Letter Generator
                </div>
                {aiResult ? (
                  <div className="ai-result"><ReactMarkdown>{aiResult}</ReactMarkdown></div>
                ) : (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                    Generate a tailored cover letter based on the job description.
                  </div>
                )}
                <button className="btn-ai" onClick={handleGenerateCoverLetter} disabled={aiLoading}>
                  {aiLoading ? <span className="spinner" /> : <Zap size={14} />}
                  {aiLoading ? 'Generating...' : 'Generate Cover Letter'}
                </button>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '16px 0' }} />

              {/* Gap Analysis */}
              <div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 8, fontWeight: 600 }}>
                  Resume Gap Analysis
                </div>
                {gapResult ? (
                  <div className="ai-result"><ReactMarkdown>{gapResult}</ReactMarkdown></div>
                ) : (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                    Upload your resume and AI will tell you how well you match this job.
                  </div>
                )}

                {showGapInput && (
                  <div style={{ marginTop: 12 }}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1.5px dashed rgba(255,255,255,0.2)',
                      borderRadius: 10, cursor: 'pointer',
                      fontSize: 13, color: 'rgba(255,255,255,0.6)',
                      marginBottom: 10
                    }}>
                      <FileText size={15} />
                      {resumeText ? 'Resume loaded — click to change' : 'Upload resume (PDF or TXT)'}
                      <input type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={handleResumeFile} />
                    </label>
                    <textarea
                      value={resumeText}
                      onChange={e => setResumeText(e.target.value)}
                      placeholder="Or paste your resume text here..."
                      style={{
                        width: '100%', padding: '12px 14px',
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.13)',
                        borderRadius: 10, color: '#fff', fontSize: 13,
                        fontFamily: 'Inter, sans-serif', resize: 'vertical',
                        minHeight: 100, outline: 'none'
                      }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button className="btn-ai" onClick={() => setShowGapInput(!showGapInput)}>
                    <FileText size={14} />
                    {showGapInput ? 'Hide' : 'Upload Resume'}
                  </button>
                  {showGapInput && resumeText && (
                    <button className="btn-ai" onClick={handleAnalyzeGap} disabled={gapLoading}>
                      {gapLoading ? <span className="spinner" /> : <Brain size={14} />}
                      {gapLoading ? 'Analyzing...' : 'Analyze Gap'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="detail-section">
              <h3>Job Description</h3>
              <p>{selectedJob.job_description || 'No description added.'}</p>
            </div>

            {/* Notes */}
            <div className="detail-section">
              <h3>Notes</h3>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Add your notes here — interview prep, contacts, feedback..."
                onBlur={handleSaveNotes} />
              <button onClick={handleSaveNotes}
                style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 8, fontFamily: 'Inter, sans-serif' }}>
                Save notes
              </button>
            </div>
          </div>
        )}

        {/* FOLLOW-UPS */}
        {view === 'followups' && (
          <div className="fade-up">
            <div className="page-header">
              <div>
                <h1>Follow-ups</h1>
                <p>Applications that need your attention</p>
              </div>
            </div>
            {followUps.length === 0 ? (
              <div className="empty-state">
                <h3>All caught up</h3>
                <p>No follow-ups due right now.</p>
              </div>
            ) : (
              <div className="followup-list">
                {followUps.map(job => (
                  <div key={job.id} className="followup-item overdue"
                    onClick={() => { setSelectedJob(job); setView('detail'); }}>
                    <div>
                      <div className="followup-company">{job.company}</div>
                      <div className="followup-role">{job.role}</div>
                    </div>
                    <div className="followup-date">Follow up by {job.follow_up_date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS */}
        {view === 'analytics' && (
          <div className="fade-up">
            <div className="page-header">
              <div>
                <h1>Analytics</h1>
                <p>How your job search is going</p>
              </div>
            </div>
            {stats && (
              <div className="charts-grid">
                <div className="chart-card">
                  <h3>Applications by Status</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={[
                      { name: 'Saved', value: stats.saved },
                      { name: 'Applied', value: stats.applied },
                      { name: 'Screen', value: stats.phone_screen },
                      { name: 'Interview', value: stats.interview },
                      { name: 'Offer', value: stats.offer },
                      { name: 'Rejected', value: stats.rejected },
                    ]}>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} />
                      <Tooltip contentStyle={{ background: '#0f1535', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h3>Status Breakdown</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Saved', value: stats.saved || 0 },
                          { name: 'Applied', value: stats.applied || 0 },
                          { name: 'Interview', value: stats.interview || 0 },
                          { name: 'Offer', value: stats.offer || 0 },
                          { name: 'Rejected', value: stats.rejected || 0 },
                        ].filter(d => d.value > 0)}
                        cx="50%" cy="50%" outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name} (${value})`}
                      >
                        {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0f1535', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
                  <h3>Conversion Rate</h3>
                  <div style={{ display: 'flex', gap: 40, padding: '20px 0' }}>
                    {[
                      { label: 'Applied → Phone Screen', value: stats.applied > 0 ? ((stats.phone_screen / stats.applied) * 100).toFixed(0) : 0 },
                      { label: 'Phone Screen → Interview', value: stats.phone_screen > 0 ? ((stats.interview / stats.phone_screen) * 100).toFixed(0) : 0 },
                      { label: 'Interview → Offer', value: stats.interview > 0 ? ((stats.offer / stats.interview) * 100).toFixed(0) : 0 },
                    ].map((item, i) => (
                      <div key={i}>
                        <div style={{ fontSize: 32, fontWeight: 800, color: '#60a5fa' }}>{item.value}%</div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ADD JOB MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Application</h2>
            <form onSubmit={handleAddJob}>
              <div className="form-grid">
                <div className="form-field">
                  <label>Company</label>
                  <input type="text" placeholder="Google" value={addForm.company}
                    onChange={e => setAddForm({ ...addForm, company: e.target.value })} required />
                </div>
                <div className="form-field">
                  <label>Role</label>
                  <input type="text" placeholder="ML Engineer" value={addForm.role}
                    onChange={e => setAddForm({ ...addForm, role: e.target.value })} required />
                </div>
                <div className="form-field">
                  <label>Location</label>
                  <input type="text" placeholder="Remote" value={addForm.location}
                    onChange={e => setAddForm({ ...addForm, location: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Status</label>
                  <select value={addForm.status} onChange={e => setAddForm({ ...addForm, status: e.target.value })}>
                    {STATUS_COLS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Min Salary</label>
                  <input type="number" placeholder="120000" value={addForm.salary_min}
                    onChange={e => setAddForm({ ...addForm, salary_min: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Max Salary</label>
                  <input type="number" placeholder="150000" value={addForm.salary_max}
                    onChange={e => setAddForm({ ...addForm, salary_max: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Applied Date</label>
                  <input type="date" value={addForm.applied_date}
                    onChange={e => setAddForm({ ...addForm, applied_date: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Follow-up Date</label>
                  <input type="date" value={addForm.follow_up_date}
                    onChange={e => setAddForm({ ...addForm, follow_up_date: e.target.value })} />
                </div>
                <div className="form-field full">
                  <label>Job URL</label>
                  <input type="url" placeholder="https://..." value={addForm.job_url}
                    onChange={e => setAddForm({ ...addForm, job_url: e.target.value })} />
                </div>
                <div className="form-field full">
                  <label>Job Description</label>
                  <textarea placeholder="Paste the job description here..." value={addForm.job_description}
                    onChange={e => setAddForm({ ...addForm, job_description: e.target.value })} />
                </div>
                <div className="form-field full">
                  <label>Notes</label>
                  <textarea placeholder="Any notes..." value={addForm.notes}
                    onChange={e => setAddForm({ ...addForm, notes: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}