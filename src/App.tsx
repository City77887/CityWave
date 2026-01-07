import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Users, 
  User, 
  Phone, 
  Lock, 
  ShieldCheck, 
  ArrowLeft,
  Info,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Clock,
  FileText,
  Edit,
  Map as MapIcon,
  Image as ImageIcon,
  Download,
  LogOut,
  KeyRound,
  UploadCloud,
  Save,
  UserPlus,
  ShieldAlert,
  Settings
} from 'lucide-react';
import { EventData, Table, TableStatus, Reservation, AdminUser } from './types';

// Firebase imports
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';

// --- Utility Components ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'success' }> = ({ 
  className, 
  variant = 'primary', 
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500 shadow-lg shadow-indigo-500/20",
    secondary: "bg-gray-800 text-gray-200 hover:bg-gray-700 focus:ring-gray-500 border border-gray-700",
    danger: "bg-red-600 text-white hover:bg-red-500 focus:ring-red-500 shadow-lg shadow-red-500/20",
    success: "bg-green-600 text-white hover:bg-green-500 focus:ring-green-500 shadow-lg shadow-green-500/20",
    outline: "border border-gray-600 text-gray-300 hover:bg-gray-800 focus:ring-indigo-500"
  };
  
  return (
    <button className={`${baseStyles} ${variants[variant]} ${className || ''}`} {...props} />
  );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; icon?: React.ReactNode }> = ({ label, icon, className, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          {icon}
        </div>
      )}
      <input 
        className={`w-full ${icon ? 'pl-10' : 'px-3'} py-2 bg-gray-800 border border-gray-700 text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 ${className || ''}`} 
        {...props} 
      />
    </div>
  </div>
);

// --- Admin Management Components ---

const AdminManagementModal = ({ isOpen, onClose, currentAdmins, onAddAdmin, onDeleteAdmin }: {
  isOpen: boolean;
  onClose: () => void;
  currentAdmins: AdminUser[];
  onAddAdmin: (u: string, p: string) => void;
  onDeleteAdmin: (id: string) => void;
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      onAddAdmin(username, password);
      setUsername('');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-indigo-900/20">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Upravljanje Adminima</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><XCircle /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow space-y-8">
          {/* Form to add new admin */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Dodaj novog podčinjenog admina</h3>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="Korisničko ime" value={username} onChange={e => setUsername(e.target.value)} />
              <Input placeholder="Lozinka" value={password} onChange={e => setPassword(e.target.value)} type="text" />
              <Button type="submit" variant="success"><UserPlus className="w-4 h-4" /> Dodaj</Button>
            </form>
          </section>

          {/* List of existing admins */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Postojeći Admini</h3>
            <div className="space-y-2">
              {currentAdmins.filter(a => !a.isMain).length === 0 ? (
                <div className="text-center py-8 text-gray-600 border-2 border-dashed border-gray-800 rounded-xl">
                  Nema podčinjenih admina.
                </div>
              ) : (
                currentAdmins.filter(a => !a.isMain).map(admin => (
                  <div key={admin.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-indigo-500/10 rounded-lg"><User className="w-5 h-5 text-indigo-400" /></div>
                      <div>
                        <p className="font-bold text-white">{admin.username}</p>
                        <p className="text-xs text-gray-500 font-mono">Lozinka: {admin.password}</p>
                      </div>
                    </div>
                    <button onClick={() => onDeleteAdmin(admin.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
        
        <div className="p-6 border-t border-gray-800 bg-gray-900">
          <Button onClick={onClose} variant="secondary" className="w-full">Zatvori</Button>
        </div>
      </div>
    </div>
  );
};

// --- Layout ---

const Layout = ({ currentAdmin, onAdminClick, onManageAdmins, children }: { 
  currentAdmin: AdminUser | null, 
  onAdminClick: () => void,
  onManageAdmins: () => void,
  children?: React.ReactNode 
}) => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans selection:bg-indigo-500/30">
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3">
                <span className="font-bold text-xl text-white tracking-tight">CityWave <span className="text-indigo-500">Events</span></span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
               {currentAdmin?.isMain && (
                 <button 
                  onClick={onManageAdmins}
                  className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/20 transition-all"
                  title="Upravljaj Adminima"
                 >
                   <Settings className="w-5 h-5" />
                 </button>
               )}
               <button 
                onClick={onAdminClick}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${currentAdmin ? 'bg-indigo-900/50 text-indigo-200 border-indigo-500/50' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}`}
               >
                 {currentAdmin ? <LogOut className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                 <span className="hidden sm:inline">{currentAdmin ? `${currentAdmin.username} (Odjava)` : 'Admin Prijava'}</span>
                 <span className="sm:hidden">{currentAdmin ? currentAdmin.username : 'Login'}</span>
               </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">© 2025 CityWave Events. Sva prava pridržana.</p>
        </div>
      </footer>
    </div>
  );
};

// Admin Login Modal
const AdminLoginModal = ({ 
  isOpen, 
  onClose, 
  onLogin 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onLogin: (u: string, p: string) => Promise<boolean> 
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await onLogin(username, password);
    setLoading(false);
    if (success) {
      setUsername('');
      setPassword('');
      setError('');
      onClose();
    } else {
      setError('Neispravni podaci.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-4 text-indigo-500">
           <ShieldCheck className="w-6 h-6" />
           <h3 className="text-xl font-bold text-white">Administratorska Prijava</h3>
        </div>
        <p className="text-gray-400 mb-6 text-sm">Prijavite se za upravljanje svojim događajima.</p>
        
        <form onSubmit={handleSubmit}>
          <Input 
            label="Korisničko ime" 
            placeholder="Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            icon={<User className="w-4 h-4" />}
            autoFocus
          />
          <Input 
            label="Lozinka"
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            icon={<KeyRound className="w-4 h-4" />}
          />
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          
          <div className="flex gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Odustani</Button>
            <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'Provjera...' : 'Prijavi se'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. Home Page
const HomePage = ({ 
  events, 
  currentAdmin, 
  onDeleteEvents,
  onToggleVisibility
}: { 
  events: EventData[], 
  currentAdmin: AdminUser | null, 
  onDeleteEvents: (ids: string[]) => void,
  onToggleVisibility: (id: string) => void
}) => {
  const navigate = useNavigate();
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isAdmin = !!currentAdmin;

  // Filter events visibility
  const visibleEvents = useMemo(() => {
    return events.filter(e => isAdmin || !e.isHidden);
  }, [events, isAdmin]);

  useEffect(() => {
    if (!isDeleteMode) setSelectedIds([]);
  }, [isDeleteMode]);

  const toggleSelection = (id: string) => {
    const event = events.find(e => e.id === id);
    if (!event) return;
    
    // Sub-admins can only delete their own events
    if (currentAdmin && !currentAdmin.isMain && event.ownerId !== currentAdmin.username) return;

    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(item => item !== id);
      return [...prev, id];
    });
  };

  const handleConfirmDelete = () => {
    if (selectedIds.length === 0) {
      setIsDeleteMode(false);
      return;
    }
    
    if (window.confirm(`Jeste li sigurni da želite obrisati ${selectedIds.length} događaj(a)?`)) {
      onDeleteEvents(selectedIds);
      setIsDeleteMode(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Nadolazeći Događaji</h1>
          <p className="text-gray-500 mt-1">Pregledajte i rezervirajte svoja mjesta.</p>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-3 w-full md:w-auto">
            {isDeleteMode ? (
              <>
                 <Button variant="secondary" onClick={() => setIsDeleteMode(false)}>Odustani</Button>
                 <Button variant="danger" onClick={handleConfirmDelete} disabled={selectedIds.length === 0}>
                  <Trash2 className="w-4 h-4" /> Potvrdi ({selectedIds.length})
                </Button>
              </>
            ) : (
              <>
                 <Button variant="outline" onClick={() => setIsDeleteMode(true)} className="text-red-400 border-red-900/50 hover:bg-red-900/20">
                  <Trash2 className="w-4 h-4" /> Brisanje
                </Button>
                <Link to="/admin/create" className="flex-1 md:flex-none">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-500">
                    <Plus className="w-4 h-4" /> Novi Event
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleEvents.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-500 bg-gray-900 rounded-xl border border-gray-800">
            {isAdmin ? "Nema vaših događaja u bazi." : "Trenutno nema nadolazećih događaja."}
          </div>
        ) : (
          visibleEvents.map(event => {
            const isSelected = selectedIds.includes(event.id);
            const isHidden = !!event.isHidden;
            const isOwner = currentAdmin?.username === event.ownerId || currentAdmin?.isMain;
            
            return (
              <div 
                key={event.id} 
                onClick={(e) => {
                  if (isDeleteMode) {
                    e.preventDefault();
                    toggleSelection(event.id);
                  } else {
                    navigate(`/event/${event.id}`);
                  }
                }}
                className={`
                  group relative bg-gray-900 rounded-xl shadow-lg border overflow-hidden transition-all duration-200 flex flex-col cursor-pointer
                  ${isDeleteMode 
                    ? (isSelected ? 'ring-2 ring-red-500 border-red-500 transform scale-95' : 'border-gray-800 opacity-70') 
                    : 'border-gray-800 hover:border-gray-700 hover:shadow-xl'
                  }
                  ${isHidden && !isDeleteMode ? 'opacity-60' : ''}
                `}
              >
                {/* Admin Badges */}
                <div className="absolute top-2 left-2 z-20 flex flex-col gap-2">
                   {isAdmin && !isDeleteMode && isOwner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onToggleVisibility(event.id);
                      }}
                      className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 hover:bg-indigo-500 transition-all"
                      title={isHidden ? "Prikaži" : "Sakrij"}
                    >
                      {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                  {isAdmin && isOwner && (
                    <span className="bg-indigo-600 text-[10px] font-bold text-white px-2 py-0.5 rounded uppercase tracking-tighter">Vlasnik</span>
                  )}
                </div>

                {isDeleteMode && (
                   <div className="absolute top-3 right-3 z-30">
                      {isSelected ? (
                        <div className="bg-red-600 text-white p-1 rounded-full"><CheckCircle className="w-5 h-5" /></div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-500 bg-black/20" />
                      )}
                   </div>
                )}

                <div className="w-full h-48 overflow-hidden bg-gray-800">
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                
                <div className="p-5 flex-grow">
                  <h3 className="text-xl font-bold mb-2 text-white">{event.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">{event.description}</p>
                  <div className="flex items-center text-gray-500 text-xs gap-4">
                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString('hr-HR')}</div>
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(event.date).toLocaleTimeString('hr-HR', {hour:'2-digit', minute:'2-digit'})}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// 3. Admin Create Event
const AdminEventForm = ({ currentAdmin, onSave }: { currentAdmin: AdminUser | null, onSave: (evt: EventData) => Promise<void> }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<EventData>>({
    title: '', date: '', description: '', longDescription: '', imageUrl: 'https://picsum.photos/800/400'
  });
  const [floorPlan1, setFloorPlan1] = useState('');
  const [floorPlan2, setFloorPlan2] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentAdmin) return <div className="text-center py-20">Niste prijavljeni.</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;
    setIsSubmitting(true);

    const newEvent: EventData = {
      id: `evt-${Date.now()}`,
      title: formData.title,
      date: formData.date,
      description: formData.description || '',
      longDescription: formData.longDescription || '',
      imageUrl: formData.imageUrl || 'https://picsum.photos/800/400',
      floorPlanImages: [floorPlan1, floorPlan2].filter(u => u.trim() !== ''),
      tables: [],
      isHidden: false,
      ownerId: currentAdmin.username
    };

    await onSave(newEvent);
    setIsSubmitting(false);
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-800">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <Plus className="w-6 h-6 text-green-500" /> Kreiraj Novi Događaj
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Naziv Događaja" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
        <Input label="Datum i Vrijeme" type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Kratki Opis</label>
          <textarea className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Detaljni Opis</label>
          <textarea className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md" rows={4} value={formData.longDescription} onChange={e => setFormData({...formData, longDescription: e.target.value})} />
        </div>

        <Input label="URL Naslovne Slike" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
        
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
           <h3 className="text-sm font-bold text-gray-200">Plan Stolova</h3>
           <Input label="Slika 1 URL" value={floorPlan1} onChange={e => setFloorPlan1(e.target.value)} icon={<ImageIcon className="w-4 h-4"/>} />
           <Input label="Slika 2 URL (opcionalno)" value={floorPlan2} onChange={e => setFloorPlan2(e.target.value)} icon={<ImageIcon className="w-4 h-4"/>} />
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate('/')} className="flex-1">Odustani</Button>
          <Button type="submit" variant="success" className="flex-1" disabled={isSubmitting}>
             {isSubmitting ? 'Slanje...' : <><UploadCloud className="w-4 h-4" /> Objavi</>}
          </Button>
        </div>
      </form>
    </div>
  );
};

// 4. Table UI
// Use React.FC to properly handle standard React props like 'key' in a list
const TableCard: React.FC<{ table: Table; onClick: (t: Table) => void }> = ({ table, onClick }) => {
  const isReserved = table.status === TableStatus.RESERVED;
  return (
    <button onClick={() => onClick(table)} className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all aspect-square ${isReserved ? 'bg-gray-900/50 border-gray-800 text-gray-500' : 'bg-gray-800 border-green-500/30 hover:border-green-500 hover:scale-105 shadow-lg'}`}>
      <div className={`mb-2 p-2 rounded-full ${isReserved ? 'bg-gray-800 text-gray-600' : 'bg-green-500/10 text-green-400'}`}>
        {isReserved ? <Lock className="w-5 h-5" /> : <Users className="w-5 h-5" />}
      </div>
      <h4 className="font-bold text-sm text-center">{table.name}</h4>
      <span className={`text-[10px] uppercase font-bold mt-1 ${isReserved ? 'text-red-900' : 'text-green-500'}`}>
        {isReserved ? 'Zauzeto' : 'Slobodno'}
      </span>
    </button>
  );
};

// 5. Detail View
const EventDetailPage = ({ events, currentAdmin, updateEvent }: { events: EventData[], currentAdmin: AdminUser | null, updateEvent: (e: EventData) => void }) => {
  const { id } = useParams();
  const event = events.find(e => e.id === id);
  const navigate = useNavigate();

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);
  const [newTableName, setNewTableName] = useState('');

  if (!event) return <div className="text-center py-20">Događaj nije pronađen.</div>;

  const isAdmin = !!currentAdmin;
  const isOwner = currentAdmin?.username === event.ownerId || currentAdmin?.isMain;

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    if (table.status === TableStatus.FREE) {
      if (!isAdmin) setShowReserveModal(true);
    } else {
      if (isAdmin && isOwner) {
        setShowAdminModal(true);
      } else {
        setShowCancelModal(true);
      }
    }
  };

  const handleReserve = (data: Reservation) => {
    if (!selectedTable) return;
    const updatedTables = event.tables.map(t => t.id === selectedTable.id ? { ...t, status: TableStatus.RESERVED, reservation: data } : t);
    updateEvent({ ...event, tables: updatedTables });
    setShowReserveModal(false);
  };

  const handleCancelReservation = () => {
    if (!selectedTable) return;
    const updatedTables = event.tables.map(t => t.id === selectedTable.id ? { ...t, status: TableStatus.FREE, reservation: undefined } : t);
    updateEvent({ ...event, tables: updatedTables });
    setShowCancelModal(false);
    setShowAdminModal(false);
  };

  const handleAddTable = () => {
    if (!newTableName.trim()) return;
    const newTable: Table = { id: `tbl-${Date.now()}`, name: newTableName, status: TableStatus.FREE };
    updateEvent({ ...event, tables: [...event.tables, newTable] });
    setNewTableName('');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Button variant="secondary" onClick={() => navigate('/')} className="mb-6"><ArrowLeft className="w-4 h-4" /> Natrag</Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Event Info */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
            <img src={event.imageUrl} alt={event.title} className="w-full h-auto aspect-video object-cover" />
            <div className="p-6">
              <h1 className="text-2xl font-bold text-white mb-4">{event.title}</h1>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-400" /> {new Date(event.date).toLocaleDateString('hr-HR')}</div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400" /> {new Date(event.date).toLocaleTimeString('hr-HR', {hour:'2-digit', minute:'2-digit'})}</div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-800">
                 <Button onClick={() => setShowInfoModal(true)} className="w-full bg-white/10 hover:bg-white/20 border border-white/20"><FileText className="w-4 h-4" /> Više Info</Button>
              </div>

              {isAdmin && isOwner && (
                <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                   <p className="text-[10px] font-bold text-indigo-400 uppercase mb-3 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Vaš Događaj</p>
                   <div className="grid grid-cols-1 gap-2">
                     <Button variant="secondary" onClick={() => setShowEditEventModal(true)}><Edit className="w-4 h-4" /> Uredi</Button>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Table Selection */}
        <div className="lg:col-span-2">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-white">Rezervacija Stolova</h2>
             {event.floorPlanImages && event.floorPlanImages.length > 0 && (
               <Button onClick={() => setShowFloorPlanModal(true)} className="bg-indigo-600 animate-pulse hover:animate-none"><MapIcon className="w-4 h-4" /> Plan stolova</Button>
             )}
           </div>

           {isAdmin && isOwner && (
             <div className="mb-8 p-4 bg-gray-900 border border-gray-800 rounded-xl flex gap-2">
                <input className="flex-grow bg-gray-800 border-gray-700 rounded-lg px-4 text-sm" placeholder="Naziv novog stola..." value={newTableName} onChange={e => setNewTableName(e.target.value)} />
                <Button onClick={handleAddTable}><Plus className="w-4 h-4" /> Dodaj</Button>
             </div>
           )}

           <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
             {event.tables.length === 0 ? (
               <div className="col-span-full py-12 text-center text-gray-600 border-2 border-dashed border-gray-800 rounded-2xl">Nema stolova.</div>
             ) : (
               event.tables.map(t => <TableCard key={t.id} table={t} onClick={handleTableClick} />)
             )}
           </div>
        </div>
      </div>

      {/* MODALS */}
      <AdminLoginModal isOpen={false} onClose={() => {}} onLogin={async() => false} />
      {/* ... (Ostali modali iz prethodne verzije se zadržavaju, uz provjere isOwner) ... */}
      
      {/* Reserve Modal */}
      <ReserveModal isOpen={showReserveModal} table={selectedTable} onClose={() => setShowReserveModal(false)} onConfirm={handleReserve} />
      <CancelModal isOpen={showCancelModal} table={selectedTable} onClose={() => setShowCancelModal(false)} onConfirm={handleCancelReservation} />
      <AdminTableInfoModal isOpen={showAdminModal} table={selectedTable} onClose={() => setShowAdminModal(false)} onCancel={handleCancelReservation} />
      <EventInfoModal isOpen={showInfoModal} title={event.title} description={event.longDescription} onClose={() => setShowInfoModal(false)} />
      <FloorPlanModal isOpen={showFloorPlanModal} images={event.floorPlanImages} onClose={() => setShowFloorPlanModal(false)} />
      <EditEventModal isOpen={showEditEventModal} event={event} onSave={(e) => { updateEvent(e); setShowEditEventModal(false); }} onClose={() => setShowEditEventModal(false)} />
    </div>
  );
};

// --- Modals implementation stubs (to keep it clean) ---
const ReserveModal = ({ isOpen, table, onClose, onConfirm }: any) => {
  const [d, setD] = useState({ firstName: '', lastName: '', phone: '', password: '' });
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-md border border-gray-800">
        <h3 className="text-xl font-bold mb-4">Rezerviraj {table.name}</h3>
        <Input label="Ime" value={d.firstName} onChange={e => setD({...d, firstName: e.target.value})} />
        <Input label="Prezime" value={d.lastName} onChange={e => setD({...d, lastName: e.target.value})} />
        <Input label="Telefon" value={d.phone} onChange={e => setD({...d, phone: e.target.value})} />
        <Input label="Lozinka za otkazivanje" type="password" value={d.password} onChange={e => setD({...d, password: e.target.value})} />
        <div className="flex gap-2 mt-4"><Button variant="secondary" onClick={onClose} className="flex-1">Odustani</Button><Button onClick={() => onConfirm(d)} className="flex-1">Potvrdi</Button></div>
      </div>
    </div>
  );
};

const CancelModal = ({ isOpen, table, onClose, onConfirm }: any) => {
  const [p, setP] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-md border border-gray-800">
        <h3 className="text-xl font-bold mb-4 text-red-400">Otkaži Rezervaciju</h3>
        <Input label="Unesite lozinku" type="password" value={p} onChange={e => setP(e.target.value)} />
        <div className="flex gap-2 mt-4"><Button variant="secondary" onClick={onClose} className="flex-1">Zatvori</Button><Button variant="danger" onClick={() => { if(p === table.reservation.password) onConfirm(); }} className="flex-1">Otkaži</Button></div>
      </div>
    </div>
  );
};

const AdminTableInfoModal = ({ isOpen, table, onClose, onCancel }: any) => {
  if (!isOpen || !table.reservation) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-md border border-gray-800">
        <div className="flex items-center gap-2 mb-4 text-indigo-400"><ShieldAlert /> <h3 className="text-xl font-bold text-white">Info Rezervacije</h3></div>
        <div className="space-y-4 text-gray-300 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
          <p><span className="text-xs text-gray-500 uppercase block">Gost:</span> {table.reservation.firstName} {table.reservation.lastName}</p>
          <p><span className="text-xs text-gray-500 uppercase block">Telefon:</span> {table.reservation.phone}</p>
          <p className="font-mono text-red-400"><span className="text-xs text-gray-500 uppercase block">Lozinka:</span> {table.reservation.password}</p>
        </div>
        <div className="flex gap-2 mt-6"><Button variant="secondary" onClick={onClose} className="flex-1">Zatvori</Button><Button variant="danger" onClick={onCancel} className="flex-1">Poništi Rezervaciju</Button></div>
      </div>
    </div>
  );
};

const EventInfoModal = ({ isOpen, title, description, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-lg border border-gray-800">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <div className="text-gray-400 text-sm leading-relaxed max-h-60 overflow-auto">{description || "Nema opisa."}</div>
        <Button variant="secondary" onClick={onClose} className="w-full mt-6">Zatvori</Button>
      </div>
    </div>
  );
};

const FloorPlanModal = ({ isOpen, images, onClose }: any) => {
  if (!isOpen || !images.length) return null;
  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="flex flex-col md:flex-row gap-4 max-w-7xl w-full" onClick={e => e.stopPropagation()}>
        {images.map((img: string, i: number) => <img key={i} src={img} className="flex-1 h-auto max-h-[80vh] object-contain rounded-xl shadow-2xl" />)}
      </div>
      <button onClick={onClose} className="absolute top-4 right-4 text-white"><XCircle className="w-8 h-8"/></button>
    </div>
  );
};

const EditEventModal = ({ isOpen, event, onSave, onClose }: any) => {
  const [fd, setFd] = useState(event);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-lg border border-gray-800 max-h-[90vh] overflow-auto">
        <h3 className="text-xl font-bold mb-4">Uredi Event</h3>
        <Input label="Naziv" value={fd.title} onChange={e => setFd({...fd, title: e.target.value})} />
        <Input label="Datum" type="datetime-local" value={fd.date} onChange={e => setFd({...fd, date: e.target.value})} />
        <Input label="Slika" value={fd.imageUrl} onChange={e => setFd({...fd, imageUrl: e.target.value})} />
        <div className="flex gap-2 mt-4"><Button variant="secondary" onClick={onClose} className="flex-1">Odustani</Button><Button onClick={() => onSave(fd)} className="flex-1">Spremi</Button></div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdminMgmt, setShowAdminMgmt] = useState(false);

  // Subscribe to Firebase
  useEffect(() => {
    const unsubEvents = onSnapshot(collection(db, "events"), (snapshot) => {
      setEvents(snapshot.docs.map(d => d.data() as EventData));
    });
    const unsubAdmins = onSnapshot(collection(db, "admins"), (snapshot) => {
      setAdmins(snapshot.docs.map(d => d.data() as AdminUser));
    });
    return () => { unsubEvents(); unsubAdmins(); };
  }, []);

  const handleAdminLogin = async (username: string, password: string) => {
    // 1. Root admin check
    if (username === 'admin' && password === '13377331LL') {
      setCurrentAdmin({ id: 'root', username: 'admin', password: '***', isMain: true });
      return true;
    }
    // 2. Sub-admin check from DB
    const admin = admins.find(a => a.username === username && a.password === password);
    if (admin) {
      setCurrentAdmin(admin);
      return true;
    }
    return false;
  };

  const handleAddAdmin = async (u: string, p: string) => {
    const id = `adm-${Date.now()}`;
    await setDoc(doc(db, "admins", id), { id, username: u, password: p, isMain: false });
  };

  const handleDeleteAdmin = async (id: string) => {
    await deleteDoc(doc(db, "admins", id));
  };

  const handleAddEvent = async (e: EventData) => {
    await setDoc(doc(db, "events", e.id), e);
  };

  const handleUpdateEvent = async (e: EventData) => {
    await setDoc(doc(db, "events", e.id), e);
  };

  const handleDeleteEvents = async (ids: string[]) => {
    for (const id of ids) await deleteDoc(doc(db, "events", id));
  };

  return (
    <HashRouter>
      <Layout 
        currentAdmin={currentAdmin} 
        onAdminClick={() => currentAdmin ? setCurrentAdmin(null) : setShowLogin(true)}
        onManageAdmins={() => setShowAdminMgmt(true)}
      >
        <Routes>
          <Route path="/" element={<HomePage events={events} currentAdmin={currentAdmin} onDeleteEvents={handleDeleteEvents} onToggleVisibility={id => {
            const e = events.find(x => x.id === id);
            if(e) handleUpdateEvent({...e, isHidden: !e.isHidden});
          }} />} />
          <Route path="/admin/create" element={<AdminEventForm currentAdmin={currentAdmin} onSave={handleAddEvent} />} />
          <Route path="/event/:id" element={<EventDetailPage events={events} currentAdmin={currentAdmin} updateEvent={handleUpdateEvent} />} />
        </Routes>
      </Layout>

      <AdminLoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={handleAdminLogin} />
      <AdminManagementModal 
        isOpen={showAdminMgmt} 
        onClose={() => setShowAdminMgmt(false)} 
        currentAdmins={admins} 
        onAddAdmin={handleAddAdmin} 
        onDeleteAdmin={handleDeleteAdmin} 
      />
    </HashRouter>
  );
};

export default App;