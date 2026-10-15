import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('public');
  const [publicEnquiries, setPublicEnquiries] = useState([]);
  const [myEnquiries, setMyEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadEnquiries = useCallback(async (tab = activeTab) => {
    setLoading(true);
    setError('');

    try {
      const result =
        tab === 'public'
          ? await api.getPublicEnquiries()
          : await api.getMyEnquiries();

      const enquiries = result.data || [];

      if (tab === 'public') {
        setPublicEnquiries(enquiries);
      } else {
        setMyEnquiries(enquiries);
      }
    } catch (err) {
      setError(err.message || 'Unable to load enquiries.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadEnquiries(activeTab);
  }, [activeTab, loadEnquiries]);

  async function handleClaim(id) {
    setClaimingId(id);
    setError('');
    setMessage('');

    try {
      await api.claimEnquiry(id);

      setMessage('Enquiry claimed successfully.');

      // Remove the lead from the public list immediately.
      setPublicEnquiries((current) =>
        current.filter((enquiry) => enquiry.id !== id)
      );

      // Refresh the logged-in counselor's claimed leads.
      const result = await api.getMyEnquiries();
      setMyEnquiries(result.data || []);
    } catch (err) {
      setError(err.message || 'Unable to claim this enquiry.');

      // Refresh public leads in case another counselor claimed it.
      try {
        const result = await api.getPublicEnquiries();
        setPublicEnquiries(result.data || []);
      } catch {
        // Keep the original error visible.
      }
    } finally {
      setClaimingId(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem('crm_token');
    navigate('/login', { replace: true });
  }

  const enquiries =
    activeTab === 'public' ? publicEnquiries : myEnquiries;

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">COUNSELOR WORKSPACE</p>
          <h1>CRM Dashboard</h1>
          <p className="muted dashboard-subtitle">
            Manage student enquiries and your assigned leads.
          </p>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <section className="dashboard-stats">
        <div className="stat-card">
          <span>Available leads</span>
          <strong>{publicEnquiries.length}</strong>
        </div>

        <div className="stat-card">
          <span>My enquiries</span>
          <strong>{myEnquiries.length}</strong>
        </div>
      </section>

      <section className="enquiries-panel">
        <div className="dashboard-tabs">
          <button
            className={activeTab === 'public' ? 'tab active' : 'tab'}
            onClick={() => {
              setMessage('');
              setActiveTab('public');
            }}
          >
            Unclaimed enquiries
          </button>

          <button
            className={activeTab === 'mine' ? 'tab active' : 'tab'}
            onClick={() => {
              setMessage('');
              setActiveTab('mine');
            }}
          >
            My enquiries
          </button>

          <button
            className="refresh-button"
            onClick={() => loadEnquiries()}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {message && (
          <div className="alert success" role="status">
            {message}
          </div>
        )}

        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <p className="empty-state">Loading enquiries...</p>
        ) : enquiries.length === 0 ? (
          <div className="empty-state">
            <h3>No enquiries found</h3>
            <p>
              {activeTab === 'public'
                ? 'There are no unclaimed leads right now.'
                : 'You have not claimed any enquiries yet.'}
            </p>
          </div>
        ) : (
          <div className="enquiry-list">
            {enquiries.map((enquiry) => (
              <article className="enquiry-card" key={enquiry.id}>
                <div className="enquiry-card-top">
                  <div>
                    <h3>{enquiry.name}</h3>
                    <p className="enquiry-course">
                      {enquiry.course_interest}
                    </p>
                  </div>

                  <span className="lead-id">Lead #{enquiry.id}</span>
                </div>

                <div className="enquiry-details">
                  <p>
                    <strong>Email:</strong> {enquiry.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {enquiry.phone || 'Not provided'}
                  </p>
                  <p>
                    <strong>Submitted:</strong>{' '}
                    {enquiry.created_at
                      ? new Date(enquiry.created_at).toLocaleString()
                      : 'Not available'}
                  </p>
                </div>

                {activeTab === 'public' && (
                  <button
                    className="claim-button"
                    onClick={() => handleClaim(enquiry.id)}
                    disabled={claimingId !== null}
                  >
                    {claimingId === enquiry.id
                      ? 'Claiming...'
                      : 'Claim lead'}
                  </button>
                )}

                {activeTab === 'mine' && (
                  <span className="claimed-label">Claimed by you</span>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
