import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Search, MapPin, DollarSign, Clock, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from '../../components/shared/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function InternshipMarketplace() {
  const { user, profile } = useAuth();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [filters, setFilters] = useState({ search: '', location: '', minStipend: '' });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 400);
    return () => clearTimeout(t);
  }, [filters.search]);

  const fetchInternships = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.location) params.location = filters.location;
      if (filters.minStipend) params.minStipend = filters.minStipend;

      const { data } = await api.get('/internships', { params });
      setInternships(data.data);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      toast.error('Failed to load internships');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filters.location, filters.minStipend]);

  useEffect(() => { fetchInternships(); }, [fetchInternships]);

  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Internship Marketplace</h1>
          <p className="page-subtitle">{total} open opportunities available</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            id="internship-search"
            className="input"
            style={{ paddingLeft: 38 }}
            placeholder="Search by title or description..."
            value={filters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
          />
        </div>
        <div style={{ position: 'relative', minWidth: 160 }}>
          <MapPin size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="input" style={{ paddingLeft: 38 }} placeholder="Location" value={filters.location} onChange={e => handleFilterChange('location', e.target.value)} />
        </div>
        <div style={{ position: 'relative', minWidth: 160 }}>
          <DollarSign size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="input" style={{ paddingLeft: 38 }} placeholder="Min Stipend (₹)" type="number" value={filters.minStipend} onChange={e => handleFilterChange('minStipend', e.target.value)} />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      ) : internships.length === 0 ? (
        <div className="empty-state">
          <Search size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px', display: 'block' }} />
          <h3>No internships found</h3>
          <p>Try adjusting your search filters</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {internships.map((internship) => (
            <InternshipCard key={internship._id} internship={internship} profile={profile} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.875rem', color: '#64748b' }}>
            Page {page} of {pages}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => p + 1)} disabled={page === pages}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function InternshipCard({ internship, profile }) {
  const company = internship.companyId;
  const deadline = internship.applicationDeadline ? new Date(internship.applicationDeadline) : null;
  const isExpired = deadline && deadline < new Date();

  // Simple eligibility
  const eli = internship.eligibility;
  let eligibleStr = '✅ Eligible';
  let eligibleColor = '#16a34a';
  if (eli?.minCgpa && profile?.cgpa && profile.cgpa < eli.minCgpa) {
    eligibleStr = '⚠️ Check eligibility';
    eligibleColor = '#d97706';
  }

  return (
    <Link to={`/internships/${internship._id}`} style={{ textDecoration: 'none' }}>
      <div className="card card-hover" style={{ height: '100%', cursor: 'pointer' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            {company?.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: 8, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                🏢
              </div>
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', lineHeight: 1.2 }}>{internship.title}</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 2 }}>{company?.name}</div>
            </div>
          </div>
          <StatusBadge status={internship.status} />
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {internship.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: '#64748b' }}>
              <MapPin size={12} /> {internship.location}
            </span>
          )}
          {internship.stipend && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: '#64748b' }}>
              ₹{internship.stipend.toLocaleString()}/mo
            </span>
          )}
          {internship.duration && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: '#64748b' }}>
              <Clock size={12} /> {internship.duration}
            </span>
          )}
        </div>

        {/* Skills */}
        {internship.skills?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
            {internship.skills.slice(0, 3).map(s => (
              <span key={s} className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>{s}</span>
            ))}
            {internship.skills.length > 3 && <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>+{internship.skills.length - 3}</span>}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: eligibleColor }}>{eligibleStr}</span>
          {deadline && (
            <span style={{ fontSize: '0.75rem', color: isExpired ? '#ef4444' : '#64748b' }}>
              {isExpired ? '⛔ Expired' : `📅 ${deadline.toLocaleDateString()}`}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
