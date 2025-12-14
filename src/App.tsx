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
  Save
} from 'lucide-react';
import { EventData, Table, TableStatus, Reservation } from './types';
import { INITIAL_EVENTS } from './constants';

// Firebase imports
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';

// --- Utility Components ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'success' }> = ({ 
  className, 
  variant = 'primary', 
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Updated variants for Dark Mode
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

// --- Views & Components ---

// 1. Navigation / Layout
const Layout = ({ isAdmin, onAdminClick, children }: { isAdmin: boolean, onAdminClick: () => void, children?: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans selection:bg-indigo-500/30">
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3">
                <span className="font-bold text-xl text-white tracking-tight">CityWave Events</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
               <button 
                onClick={onAdminClick}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${isAdmin ? 'bg-indigo-900/50 text-indigo-200 border-indigo-500/50' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}`}
                title={isAdmin ? "Odjavi se iz Admina" : "Prijava za Administratora"}
               >
                 {isAdmin ? <LogOut className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                 {isAdmin ? 'Admin (Odjava)' : 'Admin Prijava'}
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
  onLogin: (password: string) => boolean 
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(password);
    if (success) {
      setPassword('');
      setError('');
      onClose();
    } else {
      setError('Netočna lozinka.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-4 text-indigo-500">
           <ShieldCheck className="w-6 h-6" />
           <h3 className="text-xl font-bold text-white">Admin Pristup</h3>
        </div>
        <p className="text-gray-400 mb-6">Unesite administratorsku lozinku za upravljanje događajima.</p>
        
        <form onSubmit={handleSubmit}>
          <Input 
            type="password" 
            placeholder="Lozinka" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            icon={<KeyRound className="w-4 h-4" />}
            autoFocus
          />
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Odustani</Button>
            <Button type="submit" className="flex-1">Prijavi se</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. Home Page
const HomePage = ({ 
  events, 
  isAdmin, 
  onDeleteEvents,
  onToggleVisibility
}: { 
  events: EventData[], 
  isAdmin: boolean, 
  onDeleteEvents: (ids: string[]) => void,
  onToggleVisibility: (id: string) => void
}) => {
  const navigate = useNavigate();
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter events: Regular users see only unhidden events. Admins see all.
  const visibleEvents = useMemo(() => {
    return events.filter(e => isAdmin || !e.isHidden);
  }, [events, isAdmin]);

  // Reset selection when toggling delete mode
  useEffect(() => {
    if (!isDeleteMode) setSelectedIds([]);
  }, [isDeleteMode]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleConfirmDelete = () => {
    if (selectedIds.length === 0) {
      setIsDeleteMode(false);
      return;
    }
    
    if (window.confirm(`Jeste li sigurni da želite obrisati ${selectedIds.length} događaj(a)? Ova radnja se ne može poništiti.`)) {
      onDeleteEvents(selectedIds);
      setIsDeleteMode(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">Nadolazeći Događaji</h1>
          {isDeleteMode && (
            <span className="bg-red-900/30 border border-red-500/30 text-red-400 text-sm px-3 py-1 rounded-full font-medium animate-pulse">
              Odaberite događaje za brisanje
            </span>
          )}
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-3 w-full md:w-auto">
            {isDeleteMode ? (
              <>
                 <Button variant="secondary" onClick={() => setIsDeleteMode(false)} className="flex-1 md:flex-none">
                  Odustani
                </Button>
                <Button 
                  type="button"
                  variant="danger" 
                  onClick={handleConfirmDelete}
                  disabled={selectedIds.length === 0}
                  className={`flex-1 md:flex-none transition-all ${selectedIds.length === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
                >
                  <Trash2 className="w-4 h-4" /> 
                  Potvrdi Brisanje ({selectedIds.length})
                </Button>
              </>
            ) : (
              <>
                 <Button 
                   variant="outline" 
                   onClick={() => setIsDeleteMode(true)} 
                   className="flex-1 md:flex-none text-red-400 border-red-900/50 hover:bg-red-900/20 hover:border-red-500/50"
                  >
                  <Trash2 className="w-4 h-4" /> Obriši Događaje
                </Button>
                <Link to="/admin/create" className="flex-1 md:flex-none">
                  <Button className="w-full bg-green-600 hover:bg-green-500 text-white shadow-green-500/20">
                    <Plus className="w-4 h-4" /> Dodaj Novi Događaj
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
            {isAdmin ? "Nema pronađenih događaja u bazi. Dodajte jedan za početak!" : "Trenutno nema nadolazećih događaja."}
          </div>
        ) : (
          visibleEvents.map(event => {
            const isSelected = selectedIds.includes(event.id);
            const isHidden = !!event.isHidden;
            
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
                    ? (isSelected ? 'ring-2 ring-red-500 border-red-500 transform scale-95 opacity-100' : 'border-gray-800 hover:border-red-500/50 opacity-70 hover:opacity-100') 
                    : 'border-gray-800 hover:border-gray-700 hover:shadow-xl hover:shadow-black/50'
                  }
                  ${isHidden && !isDeleteMode ? 'opacity-60 grayscale-[0.5]' : ''}
                `}
              >
                {/* Admin Visibility Toggle (Only when not deleting) */}
                {isAdmin && !isDeleteMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onToggleVisibility(event.id);
                    }}
                    className="absolute top-2 left-2 z-20 p-2 rounded-full bg-black/50 backdrop-blur-md shadow-sm border border-white/10 hover:bg-black/80 transition-all transform hover:scale-105"
                    title={isHidden ? "Prikaži posjetiteljima" : "Sakrij od posjetitelja"}
                  >
                    {isHidden ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-indigo-400" />
                    )}
                  </button>
                )}

                {/* Hidden Badge for Admin */}
                {isAdmin && isHidden && (
                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                      <span className="bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold shadow-lg border border-white/10">
                        SKRIVENO
                      </span>
                   </div>
                )}

                {/* Selection Overlay Indicator */}
                {isDeleteMode && (
                   <div className={`absolute top-3 right-3 z-30 transition-transform duration-200 ${isSelected ? 'scale-110' : 'scale-100'}`}>
                      {isSelected ? (
                        <div className="bg-red-600 text-white p-1 rounded-full shadow-lg">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                      ) : (
                        <div className="bg-black/50 backdrop-blur text-gray-400 p-1 rounded-full shadow border border-gray-600">
                           <div className="w-6 h-6 rounded-full border-2 border-gray-500" />
                        </div>
                      )}
                   </div>
                )}

                {/* Image Container - Updated to adapt to image size */}
                <div className="w-full overflow-hidden bg-gray-800 relative">
                  <img 
                    src={event.imageUrl} 
                    alt={event.title} 
                    className="w-full h-auto block group-hover:scale-105 transition-transform duration-500" 
                  />
                  {!isDeleteMode && (
                    <div className="absolute top-0 right-0 p-2">
                      <span className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md border border-white/10">
                        {new Date(event.date).toLocaleDateString('hr-HR')}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex-grow">
                  <h3 className={`text-xl font-bold mb-2 transition-colors ${isDeleteMode && isSelected ? 'text-red-400' : 'text-white group-hover:text-indigo-400'}`}>
                    {event.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                    {event.description}
                  </p>
                  <div className="flex items-center text-gray-500 text-sm gap-2 mt-auto">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(event.date).toLocaleTimeString('hr-HR', {hour: '2-digit', minute:'2-digit'})} sati</span>
                  </div>
                </div>
                
                {/* Delete Mode Overlay - Visual only */}
                {isDeleteMode && !isSelected && (
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent pointer-events-none" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// 3. Admin Create/Edit Event
const AdminEventForm = ({ onSave }: { onSave: (evt: EventData) => void }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<EventData>>({
    title: '',
    date: '',
    description: '',
    longDescription: '',
    imageUrl: 'https://picsum.photos/800/400',
  });
  const [floorPlan1, setFloorPlan1] = useState('');
  const [floorPlan2, setFloorPlan2] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;
    setIsSubmitting(true);

    // Filter out empty strings
    const floorPlanImages = [floorPlan1, floorPlan2].filter(url => url.trim() !== '');

    const newEvent: EventData = {
      id: `evt-${Date.now()}`,
      title: formData.title,
      date: formData.date,
      description: formData.description || '',
      longDescription: formData.longDescription || '',
      imageUrl: formData.imageUrl || 'https://picsum.photos/800/400',
      floorPlanImages: floorPlanImages,
      tables: [], // Starts with no tables, add them later
      isHidden: false
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
        <Input 
          label="Naziv Događaja" 
          value={formData.title} 
          onChange={e => setFormData({...formData, title: e.target.value})} 
          required 
        />
        <Input 
          label="Datum i Vrijeme" 
          type="datetime-local"
          value={formData.date} 
          onChange={e => setFormData({...formData, date: e.target.value})} 
          required 
          className="text-gray-900 dark:text-white"
        />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Kratki Opis (Početna stranica)</label>
          <textarea 
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500" 
            rows={2}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Kratki sažetak koji će se vidjeti na kartici događaja..."
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Detaljni Opis (Vidi se na gumb 'VIŠE INFORMACIJA')</label>
          <textarea 
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500" 
            rows={5}
            value={formData.longDescription}
            onChange={e => setFormData({...formData, longDescription: e.target.value})}
            placeholder="Sve detalje o događaju upišite ovdje..."
          />
        </div>
        <Input 
          label="URL Naslovne Slike" 
          value={formData.imageUrl} 
          onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
          placeholder="https://..."
        />
        
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
           <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
             <MapIcon className="w-4 h-4" /> Postavke Plana Stolova
           </h3>
           <Input 
            label="Plan stolova (Slika 1 URL)" 
            value={floorPlan1} 
            onChange={e => setFloorPlan1(e.target.value)} 
            placeholder="https://..."
            icon={<ImageIcon className="w-4 h-4"/>}
          />
          <Input 
            label="Plan stolova (Slika 2 URL - opcionalno)" 
            value={floorPlan2} 
            onChange={e => setFloorPlan2(e.target.value)} 
            placeholder="https://..."
            icon={<ImageIcon className="w-4 h-4"/>}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate('/')} className="flex-1">Odustani</Button>
          <Button type="submit" variant="success" className="flex-1" disabled={isSubmitting}>
             {isSubmitting ? 'Objavljivanje...' : (
               <><UploadCloud className="w-4 h-4" /> Objavi Događaj</>
             )}
          </Button>
        </div>
      </form>
    </div>
  );
};

// 4. Table Component
const TableCard = ({ 
  table, 
  onClick 
}: { 
  table: Table, 
  onClick: (t: Table) => void 
}) => {
  const isReserved = table.status === TableStatus.RESERVED;
  
  return (
    <button
      onClick={() => onClick(table)}
      className={`
        relative flex flex-col items-center justify-center p-6 rounded-xl border transition-all duration-200 w-full aspect-square
        ${isReserved 
          ? 'bg-gray-900/50 border-gray-800 text-gray-500 cursor-pointer hover:bg-gray-900' 
          : 'bg-gray-800 border-green-500/50 text-white shadow-lg shadow-black/20 hover:shadow-green-500/10 hover:border-green-500 hover:scale-105 cursor-pointer'}
      `}
    >
      <div className={`
        mb-3 p-3 rounded-full 
        ${isReserved ? 'bg-gray-800 text-gray-600' : 'bg-green-500/10 text-green-400'}
      `}>
        {isReserved ? <Lock className="w-6 h-6" /> : <Users className="w-6 h-6" />}
      </div>
      <h4 className="font-bold text-lg text-center">{table.name}</h4>
      <span className={`
        text-xs uppercase tracking-wider font-semibold mt-1
        ${isReserved ? 'text-red-900' : 'text-green-500'}
      `}>
        {isReserved ? 'Rezervirano' : 'Slobodno'}
      </span>
    </button>
  );
};

// 5. Modals

// Floor Plan Modal
const FloorPlanModal = ({
  isOpen,
  onClose,
  images
}: {
  isOpen: boolean;
  onClose: () => void;
  images?: string[];
}) => {
  if (!isOpen || !images || images.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 p-2 bg-black/50 rounded-full"
      >
        <XCircle className="w-8 h-8" />
      </button>
      
      <div 
        className="max-w-7xl w-full max-h-[90vh] flex flex-col md:flex-row gap-4 items-center justify-center overflow-auto p-4"
        onClick={e => e.stopPropagation()} 
      >
        {images.map((imgUrl, index) => (
          <div key={index} className="relative flex-1 min-w-0 flex items-center justify-center h-full w-full">
            <img 
              src={imgUrl} 
              alt={`Plan stolova ${index + 1}`} 
              className="max-h-[85vh] w-auto max-w-full object-contain rounded-lg shadow-2xl border border-gray-800"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Edit Event Modal
const EditEventModal = ({ 
  event, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  event: EventData, 
  isOpen: boolean, 
  onClose: () => void, 
  onSave: (updatedEvent: EventData) => void 
}) => {
  const [formData, setFormData] = useState<Partial<EventData>>({});
  const [floorPlan1, setFloorPlan1] = useState('');
  const [floorPlan2, setFloorPlan2] = useState('');

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        date: event.date,
        description: event.description,
        longDescription: event.longDescription,
        imageUrl: event.imageUrl
      });
      // Load existing floor plan images
      setFloorPlan1(event.floorPlanImages?.[0] || '');
      setFloorPlan2(event.floorPlanImages?.[1] || '');
    }
  }, [event, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.date) {
      const floorPlanImages = [floorPlan1, floorPlan2].filter(url => url.trim() !== '');
      onSave({ ...event, ...formData, floorPlanImages } as EventData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Edit className="w-5 h-5" /> Uredi Događaj
            </h3>
            <p className="text-indigo-100 text-sm mt-1">Ažurirajte detalje događaja.</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
          <div className="space-y-4">
            <Input 
              label="Naziv Događaja" 
              value={formData.title || ''} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              required 
            />
            <Input 
              label="Datum i Vrijeme" 
              type="datetime-local"
              value={formData.date || ''} 
              onChange={e => setFormData({...formData, date: e.target.value})} 
              required 
              className="text-gray-900 dark:text-white"
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Kratki Opis (Početna stranica)</label>
              <textarea 
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500" 
                rows={2}
                value={formData.description || ''}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Detaljni Opis</label>
              <textarea 
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500" 
                rows={5}
                value={formData.longDescription || ''}
                onChange={e => setFormData({...formData, longDescription: e.target.value})}
              />
            </div>
            <Input 
              label="URL Naslovne Slike" 
              value={formData.imageUrl || ''} 
              onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
            />

            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4 mt-4">
               <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                 <MapIcon className="w-4 h-4" /> Postavke Plana Stolova
               </h3>
               <Input 
                label="Plan stolova (Slika 1 URL)" 
                value={floorPlan1} 
                onChange={e => setFloorPlan1(e.target.value)} 
                placeholder="https://..."
                icon={<ImageIcon className="w-4 h-4"/>}
              />
              <Input 
                label="Plan stolova (Slika 2 URL - opcionalno)" 
                value={floorPlan2} 
                onChange={e => setFloorPlan2(e.target.value)} 
                placeholder="https://..."
                icon={<ImageIcon className="w-4 h-4"/>}
              />
            </div>
          </div>
          
          <div className="mt-6 flex gap-3 pt-4 border-t border-gray-800">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Odustani</Button>
            <Button type="submit" variant="success" className="flex-1">
              <Save className="w-4 h-4" /> Spremi i Ažuriraj
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Description Info Modal
const EventInfoModal = ({
  isOpen,
  onClose,
  title,
  description
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in-up relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <XCircle className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3 mb-4 text-indigo-400">
          <Info className="w-6 h-6" />
          <h3 className="text-xl font-bold text-white">Informacije o događaju</h3>
        </div>
        <h4 className="text-lg font-semibold text-gray-200 mb-4 border-b border-gray-800 pb-2">{title}</h4>
        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto pr-2">
          {description || "Nema dodatnih informacija za ovaj događaj."}
        </div>
        <div className="mt-6">
          <Button onClick={onClose} variant="secondary" className="w-full">Zatvori</Button>
        </div>
      </div>
    </div>
  );
};

// Reservation Modal (User)
const ReserveModal = ({ 
  table, 
  isOpen, 
  onClose, 
  onConfirm 
}: { 
  table: Table | null, 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: (data: Reservation) => void 
}) => {
  const [data, setData] = useState<Reservation>({ firstName: '', lastName: '', phone: '', password: '' });

  if (!isOpen || !table) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(data);
    setData({ firstName: '', lastName: '', phone: '', password: '' }); // Reset
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="bg-indigo-600 p-6 text-white">
          <h3 className="text-xl font-bold">Rezerviraj {table.name}</h3>
          <p className="text-indigo-100 text-sm mt-1">Molimo unesite svoje podatke za rezervaciju stola.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ime" required value={data.firstName} onChange={e => setData({...data, firstName: e.target.value})} />
            <Input label="Prezime" required value={data.lastName} onChange={e => setData({...data, lastName: e.target.value})} />
          </div>
          <Input label="Broj Telefona" type="tel" required value={data.phone} onChange={e => setData({...data, phone: e.target.value})} icon={<Phone className="w-4 h-4"/>} />
          <Input label="Kreirajte Lozinku za Otkazivanje" type="password" required value={data.password} onChange={e => setData({...data, password: e.target.value})} placeholder="Čuvajte ovo na sigurnom!" />
          
          <div className="mt-6 flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Odustani</Button>
            <Button type="submit" className="flex-1">Potvrdi Rezervaciju</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Cancel Modal (User)
const CancelModal = ({ 
  table, 
  isOpen, 
  onClose, 
  onConfirm 
}: { 
  table: Table | null, 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void 
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !table) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (table.reservation?.password === password) {
      onConfirm();
      setPassword('');
      setError('');
    } else {
      setError('Netočna lozinka.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold text-white mb-2">Otkaži Rezervaciju</h3>
        <p className="text-gray-400 mb-6">Unesite lozinku korištenu prilikom rezervacije za oslobađanje <strong>{table.name}</strong>.</p>
        
        <form onSubmit={handleSubmit}>
          <Input 
            type="password" 
            placeholder="Unesite lozinku" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Zatvori</Button>
            <Button type="submit" variant="danger" className="flex-1">Otkaži Rezervaciju</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Admin Info Modal
const AdminInfoModal = ({ 
  table, 
  isOpen, 
  onClose, 
  onDelete 
}: { 
  table: Table | null, 
  isOpen: boolean, 
  onClose: () => void, 
  onDelete: () => void 
}) => {
  if (!isOpen || !table || !table.reservation) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">Detalji Rezervacije</h3>
          <span className="bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 text-xs px-2 py-1 rounded">{table.name}</span>
        </div>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
            <User className="text-gray-400 w-5 h-5" />
            <div>
              <p className="text-xs text-gray-500">Ime Gosta</p>
              <p className="font-medium text-gray-200">{table.reservation.firstName} {table.reservation.lastName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
            <Phone className="text-gray-400 w-5 h-5" />
            <div>
              <p className="text-xs text-gray-500">Kontakt</p>
              <p className="font-medium text-gray-200">{table.reservation.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-900/20 rounded-lg border border-red-900/30">
            <Lock className="text-red-400 w-5 h-5" />
            <div>
              <p className="text-xs text-red-400">Lozinka Korisnika (Admin Prikaz)</p>
              <p className="font-mono text-red-300">{table.reservation.password}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Zatvori</Button>
          <Button type="button" variant="danger" onClick={onDelete} className="flex-1">
            <Trash2 className="w-4 h-4" /> Poništi Rezervaciju
          </Button>
        </div>
      </div>
    </div>
  );
};

// 6. Event Detail Page (Combined User/Admin Logic)
const EventDetailPage = ({ 
  events, 
  isAdmin, 
  updateEvent 
}: { 
  events: EventData[], 
  isAdmin: boolean, 
  updateEvent: (e: EventData) => void 
}) => {
  const { id } = useParams();
  const event = events.find(e => e.id === id);
  const navigate = useNavigate();

  // Modal States
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);

  // Admin: New Table Input
  const [newTableName, setNewTableName] = useState('');

  if (!event) return <div className="text-center py-20 text-gray-500">Događaj nije pronađen</div>;

  // Sorting Logic
  const sortedTables = useMemo(() => {
    return [...event.tables].sort((a, b) => {
      // 1. Priority: Free vs Reserved
      if (a.status === TableStatus.FREE && b.status === TableStatus.RESERVED) return -1;
      if (a.status === TableStatus.RESERVED && b.status === TableStatus.FREE) return 1;

      // 2. Priority: VIP
      if (a.status === TableStatus.FREE && b.status === TableStatus.FREE) {
        const aIsVip = a.name.trim().toUpperCase().startsWith('VIP');
        const bIsVip = b.name.trim().toUpperCase().startsWith('VIP');

        if (aIsVip && !bIsVip) return -1;
        if (!aIsVip && bIsVip) return 1;
      }

      // 3. Priority: Name (Alphabetical/Natural sort)
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });
  }, [event.tables]);

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    if (table.status === TableStatus.FREE) {
      if (!isAdmin) setShowReserveModal(true);
    } else {
      if (isAdmin) {
        setShowAdminModal(true);
      } else {
        setShowCancelModal(true);
      }
    }
  };

  const handleReserve = (data: Reservation) => {
    if (!selectedTable) return;
    const updatedTables = event.tables.map(t => 
      t.id === selectedTable.id 
        ? { ...t, status: TableStatus.RESERVED, reservation: data } 
        : t
    );
    updateEvent({ ...event, tables: updatedTables });
    setShowReserveModal(false);
  };

  const handleCancelReservation = () => {
    if (!selectedTable) return;
    const updatedTables = event.tables.map(t => 
      t.id === selectedTable.id 
        ? { ...t, status: TableStatus.FREE, reservation: undefined } 
        : t
    );
    updateEvent({ ...event, tables: updatedTables });
    setShowCancelModal(false);
    setShowAdminModal(false);
  };

  const handleAddTable = () => {
    if (!newTableName.trim()) return;
    const newTable: Table = {
      id: `tbl-${Date.now()}`,
      name: newTableName,
      status: TableStatus.FREE
    };
    updateEvent({ ...event, tables: [...event.tables, newTable] });
    setNewTableName('');
  };

  const handleAdminDeleteTable = (tableId: string) => {
    const updatedTables = event.tables.filter(t => t.id !== tableId);
    updateEvent({ ...event, tables: updatedTables });
  };

  const handleUpdateEventDetails = (updatedEvent: EventData) => {
    updateEvent(updatedEvent);
    setShowEditEventModal(false);
  };

  const handleExportReservations = () => {
    if (!event) return;

    // Header for CSV
    const headers = ['Naziv Stola', 'Ime', 'Prezime', 'Telefon', 'Lozinka (Korisnik)'];
    
    // Rows
    const rows = event.tables
      .filter(t => t.status === TableStatus.RESERVED && t.reservation)
      .map(t => [
        `"${t.name.replace(/"/g, '""')}"`, // Escape quotes
        `"${t.reservation!.firstName.replace(/"/g, '""')}"`,
        `"${t.reservation!.lastName.replace(/"/g, '""')}"`,
        `"${t.reservation!.phone.replace(/"/g, '""')}"`,
        `"${t.reservation!.password.replace(/"/g, '""')}"`
      ]);

    // Combine into CSV string with BOM for UTF-8 support (Croatian chars)
    const csvContent = '\uFEFF' + [
      headers.join(','), 
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${event.title.replace(/[\s/]/g, '_')}_rezervacije.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    // Capitalize first letter of the result because toLocaleDateString might return lowercase
    const date = new Date(dateString).toLocaleDateString('hr-HR', options);
    return date.charAt(0).toUpperCase() + date.slice(1);
  };

  return (
    <div>
      <div className="mb-6">
        <Button variant="secondary" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="w-4 h-4" /> Natrag na Događaje
        </Button>
        
        <div className="relative w-full max-w-lg mx-auto rounded-2xl overflow-hidden shadow-2xl border border-gray-800 mb-8">
           <img src={event.imageUrl} alt={event.title} className="w-full h-auto block" />
           <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent flex items-end">
             <div className="p-6 text-white w-full">
                <h1 className="text-2xl font-bold mb-2 text-white drop-shadow-md">{event.title}</h1>
                <div className="flex flex-col gap-1 text-gray-300 text-sm mb-3">
                  <div className="flex items-center gap-2">
                     <Calendar className="w-4 h-4 text-indigo-400" />
                     <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Clock className="w-4 h-4 text-indigo-400" />
                     <span>{new Date(event.date).toLocaleTimeString('hr-HR', {hour: '2-digit', minute:'2-digit'})} sati</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                   <Button 
                    onClick={() => setShowInfoModal(true)}
                    className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold"
                   >
                    <FileText className="w-4 h-4" /> VIŠE INFORMACIJA
                   </Button>
                </div>
             </div>
           </div>
        </div>

        {/* Admin Controls Section */}
        {isAdmin && (
          <div className="bg-gray-900 border border-indigo-500/30 p-6 rounded-xl mb-8 shadow-lg shadow-indigo-900/10">
            <h3 className="text-indigo-400 font-bold flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5" /> Admin Prilagodba Stranice
            </h3>
            
            <div className="mb-6 flex flex-wrap gap-2">
               <Button onClick={() => setShowEditEventModal(true)} variant="secondary" className="w-full md:w-auto">
                 <Edit className="w-4 h-4" /> Uredi Informacije Događaja
               </Button>
               <Button onClick={handleExportReservations} variant="outline" className="w-full md:w-auto text-green-400 border-green-800 hover:bg-green-900/20">
                 <Download className="w-4 h-4" /> Preuzmi Popis Rezervacija
               </Button>
            </div>

            <div className="flex gap-4 items-end">
              <div className="flex-grow">
                <label className="text-sm text-gray-400 font-medium mb-1 block">Dodaj Novi Stol</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    placeholder="npr. 'VIP Loža 3' ili 'Stol 12'"
                    className="flex-grow px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600"
                  />
                  <Button onClick={handleAddTable}>Dodaj</Button>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Kliknite na rezervirane stolove za info o gostu. Kliknite 'X' na slobodne stolove za brisanje.
            </p>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-white">Raspored Stolova</h2>
          {event.floorPlanImages && event.floorPlanImages.length > 0 && (
            <Button 
              onClick={() => setShowFloorPlanModal(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/30 px-6 py-3 rounded-xl font-bold text-lg animate-pulse hover:animate-none transform hover:scale-105 transition-all w-full md:w-auto"
            >
              <MapIcon className="w-6 h-6 mr-2" /> PRIKAŽI PLAN STOLOVA
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedTables.length === 0 ? (
            <div className="col-span-full text-center py-10 bg-gray-900 rounded-lg border-2 border-dashed border-gray-800 text-gray-600">
              Nema dostupnih stolova. {isAdmin && "Dodajte ih iznad!"}
            </div>
          ) : (
            sortedTables.map(table => (
              <div key={table.id} className="relative group">
                <TableCard 
                  table={table} 
                  onClick={handleTableClick} 
                />
                {isAdmin && table.status === TableStatus.FREE && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleAdminDeleteTable(table.id); }}
                    className="absolute -top-2 -right-2 bg-red-900 text-red-200 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-red-500 hover:bg-red-800"
                    title="Obriši Stol"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <ReserveModal 
        isOpen={showReserveModal} 
        table={selectedTable} 
        onClose={() => setShowReserveModal(false)} 
        onConfirm={handleReserve} 
      />
      
      <CancelModal 
        isOpen={showCancelModal} 
        table={selectedTable} 
        onClose={() => setShowCancelModal(false)} 
        onConfirm={handleCancelReservation} 
      />

      <AdminInfoModal 
        isOpen={showAdminModal} 
        table={selectedTable} 
        onClose={() => setShowAdminModal(false)} 
        onDelete={handleCancelReservation} 
      />

      <EventInfoModal 
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title={event.title}
        description={event.longDescription}
      />
      
      <EditEventModal 
        isOpen={showEditEventModal}
        event={event}
        onClose={() => setShowEditEventModal(false)}
        onSave={handleUpdateEventDetails}
      />

      <FloorPlanModal 
        isOpen={showFloorPlanModal}
        onClose={() => setShowFloorPlanModal(false)}
        images={event.floorPlanImages}
      />
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  // Global State using Firebase instead of LocalStorage
  const [events, setEvents] = useState<EventData[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Subscribe to Firebase updates
  useEffect(() => {
    // This creates a real-time listener. Whenever data changes in Firestore, 
    // this callback runs automatically and updates the state.
    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      const loadedEvents = snapshot.docs.map(doc => doc.data() as EventData);
      setEvents(loadedEvents);
    });

    return () => unsubscribe(); // Cleanup listener when component unmounts
  }, []);

  // Actions now write to Firebase
  const handleAddEvent = async (newEvent: EventData) => {
    // Write to Firestore 'events' collection using the event ID as the document ID
    await setDoc(doc(db, "events", newEvent.id), newEvent);
  };

  const handleUpdateEvent = async (updatedEvent: EventData) => {
    await updateDoc(doc(db, "events", updatedEvent.id), updatedEvent as any);
  };

  const handleDeleteEvents = async (eventIds: string[]) => {
    // Delete multiple documents
    for (const id of eventIds) {
      await deleteDoc(doc(db, "events", id));
    }
  };
  
  const handleToggleVisibility = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      await updateDoc(doc(db, "events", eventId), {
        isHidden: !event.isHidden
      });
    }
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setShowAdminLogin(true);
    }
  };

  const handleAdminLogin = (password: string) => {
    if (password === '13377331LL') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  return (
    <HashRouter>
      <Layout isAdmin={isAdmin} onAdminClick={handleAdminClick}>
        <Routes>
          <Route path="/" element={
            <HomePage 
              events={events} 
              isAdmin={isAdmin} 
              onDeleteEvents={handleDeleteEvents} 
              onToggleVisibility={handleToggleVisibility}
            />
          } />
          <Route path="/admin/create" element={isAdmin ? <AdminEventForm onSave={handleAddEvent} /> : <div className="text-center text-red-500 mt-10">Pristup Odbijen. Prijavite se kao Admin.</div>} />
          <Route path="/event/:id" element={
            <EventDetailPage 
              events={events} 
              isAdmin={isAdmin} 
              updateEvent={handleUpdateEvent} 
            />
          } />
        </Routes>
      </Layout>
      
      <AdminLoginModal 
        isOpen={showAdminLogin} 
        onClose={() => setShowAdminLogin(false)} 
        onLogin={handleAdminLogin} 
      />
    </HashRouter>
  );
};

export default App;