import React, { useState, useEffect } from 'react';

const organisations = [
    { name: 'Delhi State Legal Services Authority', city: 'Delhi', address: 'Patiala House Courts Complex, New Delhi', phone: '011-2338 4781', services: 'Free legal aid, Lok Adalat, mediation' },
    { name: 'Maharashtra Legal Services Authority', city: 'Mumbai', address: 'High Court Building, Mumbai', phone: '022-2262 3037', services: 'Legal aid clinics, legal awareness camps' },
    { name: 'Rajasthan State Legal Services Authority', city: 'Jaipur', address: 'Rajasthan High Court, Jaipur Bench', phone: '0141-222 7481', services: 'Free legal services, Lok Adalats' },
    { name: 'Gujarat State Legal Services Authority', city: 'Ahmedabad', address: 'Sola Civil Courts, Ahmedabad', phone: '079-2766 5791', services: 'Legal aid, mediation, counselling' },
    { name: 'West Bengal Legal Services Authority', city: 'Kolkata', address: 'Bankshall Court, Kolkata', phone: '033-2248 5180', services: 'Legal aid, mediation, advice' },
    { name: 'Tamil Nadu State Legal Services Authority', city: 'Chennai', address: 'High Court Complex, Chennai', phone: '044-2534 1565', services: 'Lok Adalat, legal aid, legal literacy' },
    { name: 'Karnataka State Legal Services Authority', city: 'Bengaluru', address: 'Nyaya Degula Building, H Siddaiah Road, Bengaluru', phone: '080-2211 3333', services: 'Legal aid clinics, mediation, counselling' },
    { name: 'Uttar Pradesh State Legal Services Authority', city: 'Lucknow', address: 'Qaiserbagh, Lucknow', phone: '0522-223 7496', services: 'Free legal services, Lok Adalat' },
];

const LegalAidPage = () => {
  const [search, setSearch] = useState('');
  const [revealed, setRevealed] = useState({});
  const [modalOrg, setModalOrg] = useState(null);

  useEffect(() => {
    const rev = JSON.parse(localStorage.getItem('legalbridge_revealed') || '{}');
    setRevealed(rev);
  }, []);

  const handleContact = (org) => {
    setModalOrg(org);
  };

  const confirmContact = (org) => {
    const newRevealed = { ...revealed, [org.name]: true };
    setRevealed(newRevealed);
    localStorage.setItem('legalbridge_revealed', JSON.stringify(newRevealed));
    
    const log = JSON.parse(localStorage.getItem('legalbridge_contact_log') || '[]');
    log.push({ org: org.name, timestamp: new Date().toISOString() });
    localStorage.setItem('legalbridge_contact_log', JSON.stringify(log));

    setModalOrg(null);
  };

  const filtered = organisations.filter((o) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      o.name.toLowerCase().includes(q) ||
      o.city.toLowerCase().includes(q) ||
      o.services.toLowerCase().includes(q)
    );
  });

  return (
    <div className="legalaid-page" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <h2 className="section-title">Find Legal Aid Near You</h2>
      <p style={{ textAlign: 'center', maxWidth: '640px', margin: '-1rem auto 2rem', color: '#555' }}>
        Search for government legal aid services, pro bono lawyers, and non-profit organisations.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Enter city, organisation, or service..."
          style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: 'var(--radius)', width: '100%', maxWidth: '400px' }}
        />
      </div>
      <div className="grid-container">
        {filtered.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>No organisations found.</p>
        ) : (
          filtered.map((org) => (
            <div key={org.name} className="card">
              <h4 style={{ margin: 0, color: 'var(--primary)' }}>{org.name}</h4>
              <p style={{ margin: '0.5rem 0' }}><strong>City:</strong> {org.city}</p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#555' }}><strong>Services:</strong> {org.services}</p>
              {revealed[org.name] ? (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                  <p style={{ margin: '0.5rem 0' }}><strong>Address:</strong> {org.address}</p>
                  <p style={{ margin: '0.5rem 0' }}><strong>Phone:</strong> {org.phone}</p>
                </div>
              ) : (
                <button
                  onClick={() => handleContact(org)}
                  style={{ marginTop: 'auto', alignSelf: 'flex-start', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '0.5rem 1rem', cursor: 'pointer' }}
                >
                  View Contact Details
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {modalOrg && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '90%', maxWidth: '450px' }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>Confirm Action</h3>
            <p>Viewing contact details will add this organization to your dashboard's contact log to help you track your interactions.</p>
            <p>Do you want to proceed?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={() => setModalOrg(null)} style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '0.6rem 1.2rem', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => confirmContact(modalOrg)} style={{ backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '0.6rem 1.2rem', cursor: 'pointer' }}>Yes, Proceed</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalAidPage;
