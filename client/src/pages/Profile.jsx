import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/auth';
import { FiUser, FiPhone, FiMail, FiPlus, FiTrash2, FiSave, FiShield, FiEdit3 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [safetyWord, setSafetyWord] = useState('');
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fakeCallName, setFakeCallName] = useState('Mom');
  const [fakeCallDelay, setFakeCallDelay] = useState(5);

  useEffect(() => {
    if (userProfile) {
      setContacts(userProfile.emergencyContacts || []);
      setSafetyWord(userProfile.safetyWord || '');
      setFakeCallName(userProfile.fakeCallSettings?.callerName || 'Mom');
      setFakeCallDelay(userProfile.fakeCallSettings?.delay || 5);
    }
  }, [userProfile]);

  const addContact = () => {
    if (!newContact.name || !newContact.email) {
      toast.error('Name and email are required');
      return;
    }
    setContacts([...contacts, { ...newContact, id: Date.now().toString() }]);
    setNewContact({ name: '', email: '', phone: '' });
    setShowAddForm(false);
    toast.success('Contact added! Don\'t forget to save.');
  };

  const removeContact = (id) => {
    setContacts(contacts.filter((c) => c.id !== id));
    toast.success('Contact removed. Don\'t forget to save.');
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateUserProfile(currentUser.uid, {
        emergencyContacts: contacts,
        safetyWord,
        fakeCallSettings: {
          callerName: fakeCallName,
          delay: Number(fakeCallDelay),
        },
      });
      await refreshProfile(currentUser.uid);
      toast.success('Profile saved!');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header animate-fadeInUp">
          <h1><FiUser /> My Profile</h1>
          <p>Manage your emergency contacts and safety settings</p>
        </div>

        <div className="profile-grid">
          {/* User Info Card */}
          <div className="profile-card glass-card animate-fadeInUp delay-1">
            <h3><FiUser /> Personal Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label"><FiUser /> Name</span>
                <span className="info-value">{userProfile?.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><FiMail /> Email</span>
                <span className="info-value">{userProfile?.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><FiPhone /> Phone</span>
                <span className="info-value">{userProfile?.phone}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><FiShield /> Role</span>
                <span className="info-value">
                  <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>{userProfile?.role}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Contacts Card */}
          <div className="profile-card glass-card animate-fadeInUp delay-2">
            <div className="card-header-row">
              <h3><FiPhone /> Emergency Contacts</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(!showAddForm)}>
                <FiPlus /> Add Contact
              </button>
            </div>

            {showAddForm && (
              <div className="add-contact-form animate-slideDown">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Contact Name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                />
                <input
                  type="email"
                  className="input-field"
                  placeholder="Contact Email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                />
                <input
                  type="tel"
                  className="input-field"
                  placeholder="Contact Phone (optional)"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                />
                <button className="btn btn-primary btn-sm" onClick={addContact}>
                  <FiPlus /> Add
                </button>
              </div>
            )}

            <div className="contacts-list">
              {contacts.length === 0 ? (
                <div className="empty-state">
                  <p>No emergency contacts added yet. Add contacts to receive SOS alerts.</p>
                </div>
              ) : (
                contacts.map((contact) => (
                  <div key={contact.id} className="contact-item">
                    <div className="contact-info">
                      <span className="contact-name">{contact.name}</span>
                      <span className="contact-detail">{contact.email}</span>
                      {contact.phone && <span className="contact-detail">{contact.phone}</span>}
                    </div>
                    <button className="btn-icon-danger" onClick={() => removeContact(contact.id)}>
                      <FiTrash2 />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Safety Settings Card */}
          <div className="profile-card glass-card animate-fadeInUp delay-3">
            <h3><FiShield /> Safety Settings</h3>

            <div className="setting-group">
              <label>Safety Word (for periodic check-in)</label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter your secret safety word"
                value={safetyWord}
                onChange={(e) => setSafetyWord(e.target.value)}
              />
              <small>This word verifies your identity during safety check-ins</small>
            </div>

            <div className="setting-group">
              <label><FiPhone /> Fake Call - Caller Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Mom, Boss, Dad"
                value={fakeCallName}
                onChange={(e) => setFakeCallName(e.target.value)}
              />
            </div>

            <div className="setting-group">
              <label><FiEdit3 /> Fake Call - Delay (seconds)</label>
              <select
                className="input-field"
                value={fakeCallDelay}
                onChange={(e) => setFakeCallDelay(e.target.value)}
              >
                <option value={0}>Immediate</option>
                <option value={5}>5 seconds</option>
                <option value={10}>10 seconds</option>
                <option value={30}>30 seconds</option>
              </select>
            </div>
          </div>
        </div>

        <div className="profile-save animate-fadeInUp delay-4">
          <button className="btn btn-primary btn-lg" onClick={saveProfile} disabled={saving}>
            {saving ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div> : <><FiSave /> Save All Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
