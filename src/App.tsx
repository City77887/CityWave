import React, { useState, useEffect } from 'react';
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
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Clock,
  Edit,
  Map as MapIcon,
  LogOut,
  Settings,
  UserPlus,
  AlertTriangle
} from 'lucide-react';
import { EventData, Table, TableStatus, Reservation, AdminUser } from './types';
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc
} from 'firebase/firestore';

// --- Globalne Komponente ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'success' }> = ({ 
  className, 
  variant = 'primary', 
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20",
    secondary: "bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700",
    danger: "bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/20",
    success: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20",
    outline: "border border-gray-600 text-gray-300 hover:bg-gray-800"
  };
  return <button className={`${baseStyles} ${variants[variant]} ${className || ''}`} {...props} />;
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; icon?: React.ReactNode }> = ({ label, icon, className, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">{label}</label>}
    <div className="relative">
      {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">{icon}</div>}
      <input className={`w-full ${icon ? 'pl-10' : 'px-4'} py-2.5 bg-gray-900 border border-gray-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-gray-600 ${className || ''}`} {...props} />
    </div>
  </div>
);

// --- Admin Modali ---

const AdminManagementModal = ({ isOpen, onClose, currentAdmins, onAddAdmin, onDeleteAdmin }: any) => {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-indigo-600/10">
          <div className="flex items-center gap-3"><Users className="text-indigo-400" /><h2 className="text-xl font-black text-white uppercase tracking-tight">Upravljanje Adminima</h2></div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><XCircle /></button>
        </div>
        <div className="p-8 overflow-y-auto space-y-10">
          <section>
            <h3 className="text-xs font-black text-indigo-500 uppercase mb-4 tracking-widest">Novi Podračun</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <Input placeholder="User" value={u} onChange={e => setU(e.target.value)} />
              <Input placeholder="Pass" value={p} onChange={e => setP(e.target.value)} />
              <Button variant="success" className="mb-4" onClick={() => { if(u && p){ onAddAdmin(u,p); setU(''); setP(''); } }}><UserPlus className="w-4 h-4" /> Kreiraj</Button>
            </div>
          </section>
          <section>
            <h3 className="text-xs font-black text-gray-500 uppercase mb-4 tracking-widest">Aktivni Admini</h3>
            <div className="space-y-3">
              {currentAdmins.filter((a: any) => !a.isMain).map((admin: any) => (
                <div key={admin.id} className="flex items-center justify-between p-4 bg-gray-800/40 rounded-2xl border border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">{admin.username[0].toUpperCase()}</div>
                    <div><p className="font-bold text-white">{admin.username}</p><p className="text-xs text-gray-500 font-mono">Pass: {admin.password}</p></div>
                  </div>
                  <button onClick={() => onDeleteAdmin(admin.id)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5"/></button>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="p-6 bg-gray-900 border-t border-gray-800"><Button variant="secondary" onClick={onClose} className="w-full">Zatvori Panel</Button></div>
      </div>
    </div>
  );
};

// --- Glavni Layout ---

const Layout = ({ currentAdmin, onLoginClick, onLogoutClick, onManageAdmins, children }: any) => (
  <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans selection:bg-indigo-500/30">
    <nav className="bg-gray-900/80 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/40 group-hover:rotate-12 transition-transform">
             <Clock className="text-white w-6 h-6" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-white">CITYWAVE <span className="text-indigo-500">EVENTS</span></span>
        </Link>
        <div className="flex items-center gap-3">
          {currentAdmin?.isMain && (
            <button onClick={onManageAdmins} className="p-3 bg-gray-800 rounded-xl border border-gray-700 hover:bg-gray-700 transition-all text-indigo-400"><Settings className="w-6 h-6"/></button>
          )}
          {currentAdmin ? (
            <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 pl-4 pr-2 py-1.5 rounded-2xl">
               <div className="flex flex-col items-end">
                 <span className="text-[10px] font-black text-indigo-500 uppercase leading-none mb-0.5">{currentAdmin.isMain ? 'Glavni Admin' : 'Admin'}</span>
                 <span className="text-sm font-bold text-white leading-none">{currentAdmin.username}</span>
               </div>
               <button onClick={onLogoutClick} className="p-2 text-gray-400 hover:text-red-400 transition-colors"><LogOut className="w-5 h-5"/></button>
            </div>
          ) : (
            <Button onClick={onLoginClick} variant="secondary" className="rounded-2xl border-indigo-500/20"><ShieldCheck className="w-5 h-5" /> Admin</Button>
          )}
        </div>
      </div>
    </nav>
    <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-10">{children}</main>
    <footer className="border-t border-gray-900 py-10 text-center text-gray-600 text-xs font-bold uppercase tracking-widest">© 2025 CityWave. Your City, Your Wave.</footer>
  </div>
);

// --- Stranice ---

const HomePage = ({ events, currentAdmin, onDeleteEvents, onToggleVisibility }: any) => {
  const navigate = useNavigate();
  const isAdmin = !!currentAdmin;
  const visibleEvents = events.filter((e: any) => isAdmin || !e.isHidden);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2 uppercase">Doživite <span className="text-indigo-600">Više.</span></h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Your City, Your Wave</p>
        </div>
        {isAdmin && (
          <Link to="/admin/create">
            <Button className="h-14 px-8 text-lg rounded-2xl"><Plus className="w-6 h-6" /> Novi Događaj</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {visibleEvents.map((event: any) => {
          const isOwner = currentAdmin?.username === event.ownerId || currentAdmin?.isMain;
          const isHidden = !!event.isHidden;
          return (
            <div key={event.id} onClick={() => navigate(`/event/${event.id}`)} className={`group relative bg-gray-900 rounded-[2.5rem] border border-gray-800 overflow-hidden cursor-pointer transition-all hover:border-indigo-500/50 hover:-translate-y-2 ${isHidden ? 'opacity-50' : ''}`}>
              <div className="aspect-[4/3] overflow-hidden bg-gray-800">
                <img src={event.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={event.title} />
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-black text-white leading-tight pr-4">{event.title}</h3>
                  {isAdmin && isOwner && <span className="shrink-0 bg-indigo-600 text-[10px] font-black px-2 py-1 rounded text-white uppercase">Vlasnik</span>}
                </div>
                <p className="text-gray-500 font-medium line-clamp-2 mb-6">{event.description}</p>
                <div className="flex items-center justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3 text-indigo-500" /> {new Date(event.date).toLocaleDateString('hr-HR')}</div>
                  <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-indigo-500" /> {new Date(event.date).toLocaleTimeString('hr-HR', {hour:'2-digit', minute:'2-digit'})}</div>
                </div>
              </div>
              {isAdmin && isOwner && (
                <div className="absolute top-4 right-4 flex gap-2">
                   <button onClick={(e) => { e.stopPropagation(); onToggleVisibility(event.id); }} className="p-3 bg-black/60 backdrop-blur-md rounded-2xl text-white border border-white/10 hover:bg-indigo-600 transition-all">{isHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                   <button onClick={(e) => { e.stopPropagation(); if(window.confirm('Jeste li sigurni da želite obrisati ovaj događaj?')) onDeleteEvents([event.id]); }} className="p-3 bg-red-600/80 backdrop-blur-md rounded-2xl text-white border border-red-500 hover:bg-red-500 transition-all"><Trash2 className="w-5 h-5" /></button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Admin Modali za Uređivanje ---

const EditEventModal = ({ isOpen, onClose, event, onSave }: any) => {
  const [f, setF] = useState<any>(null);
  useEffect(() => { if(event && isOpen) setF({...event}); }, [event, isOpen]);
  if (!isOpen || !f) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center z-[200] p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-10 shadow-2xl space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">Uredi Događaj</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><XCircle className="w-8 h-8"/></button>
        </div>
        <Input label="Naziv Događaja" value={f.title} onChange={e => setF({...f, title: e.target.value})} />
        <Input label="Datum i Vrijeme" type="datetime-local" value={f.date} onChange={e => setF({...f, date: e.target.value})} />
        <Input label="URL Slike" value={f.imageUrl} onChange={e => setF({...f, imageUrl: e.target.value})} />
        <div className="grid grid-cols-2 gap-4 bg-indigo-500/5 p-6 rounded-2xl border border-indigo-500/10">
          <Input label="Min. Serijski Broj" type="number" value={f.minTicketSerial} onChange={e => setF({...f, minTicketSerial: parseInt(e.target.value)})} />
          <Input label="Max. Serijski Broj" type="number" value={f.maxTicketSerial} onChange={e => setF({...f, maxTicketSerial: parseInt(e.target.value)})} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-500 uppercase">Kratki Opis</label>
          <textarea className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white" rows={2} value={f.description} onChange={e => setF({...f, description: e.target.value})} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-500 uppercase">Detaljni Opis</label>
          <textarea className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white" rows={5} value={f.longDescription} onChange={e => setF({...f, longDescription: e.target.value})} />
        </div>
        <div className="flex gap-4 pt-4">
          <Button variant="secondary" onClick={onClose} className="flex-1 rounded-2xl">Odustani</Button>
          <Button variant="primary" onClick={() => { onSave(f); onClose(); }} className="flex-1 rounded-2xl h-14">Spremi Promjene</Button>
        </div>
      </div>
    </div>
  );
};

const AdminTableDetailModal = ({ isOpen, onClose, table, onRelease }: any) => {
  if (!isOpen || !table || !table.reservation) return null;
  const res = table.reservation;
  const reservedAt = new Date(res.reservedAt).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-md p-10 shadow-2xl space-y-8">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Rezervacija: {table.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><XCircle /></button>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-800">
            <p className="text-[10px] font-black text-indigo-500 uppercase mb-1">Gost</p>
            <p className="text-white font-bold text-lg">{res.firstName} {res.lastName}</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-800">
            <p className="text-[10px] font-black text-indigo-500 uppercase mb-1">Kontakt</p>
            <p className="text-white font-bold">{res.phone}</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-800">
            <p className="text-[10px] font-black text-red-500 uppercase mb-1">Lozinka gosta</p>
            <p className="text-white font-mono font-bold tracking-widest">{res.password}</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-800">
            <p className="text-[10px] font-black text-emerald-500 uppercase mb-1">Status Karata</p>
            <p className="text-white font-bold">
              {res.ticketSerials?.length === 4 ? `✅ Unijeto: ${res.ticketSerials.join(', ')}` : '❌ Čeka unos (4 kom)'}
            </p>
          </div>
          <p className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">Rezervirano: {reservedAt}</p>
        </div>
        <div className="flex flex-col gap-3">
          <Button variant="danger" onClick={() => { if(window.confirm('Jeste li sigurni da želite osloboditi ovaj stol?')) { onRelease(); onClose(); } }} className="w-full h-12 rounded-2xl font-black">OSLOBODI STOL</Button>
          <Button variant="secondary" onClick={onClose} className="w-full rounded-2xl">Zatvori</Button>
        </div>
      </div>
    </div>
  );
};

// --- Detalji Događaja ---

const EventDetailPage = ({ events, currentAdmin, updateEvent }: any) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = events.find((e: any) => e.id === id);
  const [newT, setNewT] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [selectedTableInfo, setSelectedTableInfo] = useState<any>(null);

  useEffect(() => {
    if (!event) return;
    const now = new Date();
    let hasChanges = false;
    const updatedTables = event.tables.map((t: Table) => {
      if (t.status === TableStatus.RESERVED && t.reservation) {
        const reservedDate = new Date(t.reservation.reservedAt);
        const diffDays = (now.getTime() - reservedDate.getTime()) / (1000 * 60 * 60 * 24);
        const serialsCount = t.reservation.ticketSerials?.length || 0;
        if (diffDays > 5 && serialsCount < 4) {
          hasChanges = true;
          return { ...t, status: TableStatus.FREE, reservation: undefined };
        }
      }
      return t;
    });
    if (hasChanges) updateEvent({ ...event, tables: updatedTables });
  }, [event]);

  if (!event) return <div className="text-center py-40">Učitavanje...</div>;

  const isAdmin = !!currentAdmin;
  const isOwner = currentAdmin?.username === event.ownerId || currentAdmin?.isMain;

  const handleTableAction = (t: Table) => {
    const isRes = t.status === TableStatus.RESERVED;
    if (isAdmin && isOwner && isRes) {
      setSelectedTableInfo(t);
    } else if (!isRes && !isAdmin) {
      const f = prompt('Vaše ime:');
      const l = prompt('Vaše prezime:');
      const ph = prompt('Broj telefona:');
      const p = prompt('Postavite lozinku za upravljanje stolom:');
      if (f && l && ph && p) {
        const newReservation: Reservation = {
          firstName: f, lastName: l, phone: ph, password: p,
          reservedAt: new Date().toISOString(), ticketSerials: []
        };
        const updated = event.tables.map((x: any) => x.id === t.id ? { ...x, status: TableStatus.RESERVED, reservation: newReservation } : x);
        updateEvent({ ...event, tables: updated });
        alert('Stol je uspješno rezerviran!');
      }
    } else if (isRes && !isAdmin) {
      const pass = prompt('Unesite svoju lozinku za ovaj stol:');
      if (pass !== t.reservation?.password) { alert('Netočna lozinka!'); return; }
      const action = prompt('Što želite učiniti?\n1 - Unijeti serijske brojeve karata\n2 - Otkazati stol (postat će odmah slobodan)');
      if (action === '1') {
        const serials = prompt('Unesite 4 serijska broja odvojena zarezom:');
        if (serials) {
          const sArr = serials.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
          if (sArr.length !== 4) { alert('Morate unijeti točno 4 broja!'); return; }
          const allValid = sArr.every(n => n >= event.minTicketSerial && n <= event.maxTicketSerial);
          if (!allValid) { alert(`Brojevi moraju biti u adminovom rasponu: ${event.minTicketSerial} - ${event.maxTicketSerial}.`); return; }
          const updated = event.tables.map((x: any) => x.id === t.id ? { ...x, reservation: { ...x.reservation, ticketSerials: sArr } } : x);
          updateEvent({ ...event, tables: updated });
          alert('Serijski brojevi su spremljeni!');
        }
      } else if (action === '2') {
        if (window.confirm('Jeste li sigurni da želite otkazati stol?')) {
          const updated = event.tables.map((x: any) => x.id === t.id ? { ...x, status: TableStatus.FREE, reservation: undefined } : x);
          updateEvent({ ...event, tables: updated });
          alert('Stol je sada slobodan.');
        }
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex justify-between items-center">
        <Button variant="secondary" onClick={() => navigate('/')} className="rounded-xl"><ArrowLeft className="w-4 h-4" /> Natrag</Button>
        {isAdmin && isOwner && (
          <Button variant="primary" onClick={() => setShowEdit(true)} className="bg-indigo-600 rounded-xl px-6 h-12"><Edit className="w-4 h-4" /> Uredi Informacije</Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-8">
           <div className="bg-gray-900 rounded-[3rem] overflow-hidden border border-gray-800 shadow-2xl">
             <img src={event.imageUrl} className="w-full aspect-square object-cover" alt="" />
             <div className="p-10">
                <h1 className="text-4xl font-black text-white mb-6 leading-tight uppercase">{event.title}</h1>
                <div className="space-y-6 text-gray-400">
                  <p className="font-medium text-lg leading-relaxed">{event.longDescription || event.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-800 text-center"><Calendar className="w-5 h-5 text-indigo-500 mx-auto mb-2"/><p className="text-xs font-black text-white uppercase">{new Date(event.date).toLocaleDateString('hr-HR')}</p></div>
                    <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-800 text-center"><Clock className="w-5 h-5 text-indigo-500 mx-auto mb-2"/><p className="text-xs font-black text-white uppercase">{new Date(event.date).toLocaleTimeString('hr-HR', {hour:'2-digit', minute:'2-digit'})}</p></div>
                  </div>
                </div>
                {isAdmin && isOwner && (
                  <div className="mt-8 p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Admin Info (Serial Range)</p>
                    <p className="text-white font-black text-xl">{event.minTicketSerial} — {event.maxTicketSerial}</p>
                  </div>
                )}
             </div>
           </div>
        </div>

        <div className="lg:col-span-7 space-y-8">
          <div className="flex justify-between items-center border-b border-gray-800 pb-8">
             <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Rezervacija Stolova</h2>
          </div>

          <div className="bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/20 flex items-start gap-3">
            <AlertTriangle className="text-yellow-500 shrink-0 w-5 h-5" />
            <p className="text-xs text-yellow-500/80 font-bold leading-tight uppercase uppercase">Važno: Stol se automatski oslobađa nakon 5 dana ako nisu unijeta 4 serijska broja.</p>
          </div>

          {isAdmin && isOwner && (
            <div className="bg-indigo-600/10 p-6 rounded-3xl border border-indigo-500/20 flex gap-3">
               <input className="flex-grow bg-gray-900 border-gray-800 rounded-2xl px-6 font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Naziv novog stola..." value={newT} onChange={e => setNewT(e.target.value)} />
               <Button onClick={() => { if(newT){ updateEvent({...event, tables:[...event.tables, {id:`t-${Date.now()}`, name:newT, status:TableStatus.FREE}]}); setNewT(''); } }} className="rounded-2xl h-12 px-6"><Plus className="w-5 h-5"/> Dodaj</Button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
             {event.tables.map((t: any) => {
               const isRes = t.status === TableStatus.RESERVED;
               const hasTickets = t.reservation?.ticketSerials?.length === 4;
               return (
                 <button 
                  key={t.id} 
                  onClick={() => handleTableAction(t)}
                  className={`aspect-square rounded-[2rem] border transition-all flex flex-col items-center justify-center gap-2 p-4 ${isRes ? 'bg-gray-900 border-gray-800 opacity-60' : 'bg-gray-800 border-indigo-500/20 hover:border-indigo-500 hover:scale-105 shadow-xl shadow-black/40'}`}
                 >
                   <div className={`p-3 rounded-full ${isRes ? 'bg-gray-800 text-gray-600' : 'bg-indigo-500/10 text-indigo-400'}`}>
                     {isRes ? (hasTickets ? <CheckCircle className="w-6 h-6 text-emerald-500"/> : <Lock className="w-6 h-6"/>) : <Users className="w-6 h-6"/>}
                   </div>
                   <span className="font-black text-xs text-white uppercase truncate w-full text-center px-2">{t.name}</span>
                   <span className={`text-[9px] font-black uppercase tracking-widest ${isRes ? (hasTickets ? 'text-emerald-500' : 'text-red-900') : 'text-emerald-500'}`}>
                     {isRes ? (hasTickets ? 'Potvrđeno' : 'Čeka karte') : 'Slobodno'}
                   </span>
                 </button>
               );
             })}
          </div>
        </div>
      </div>
      
      <EditEventModal isOpen={showEdit} onClose={() => setShowEdit(false)} event={event} onSave={updateEvent} />
      <AdminTableDetailModal isOpen={!!selectedTableInfo} onClose={() => setSelectedTableInfo(null)} table={selectedTableInfo} onRelease={() => {
        const updated = event.tables.map((x: any) => x.id === selectedTableInfo.id ? { ...x, status: TableStatus.FREE, reservation: undefined } : x);
        updateEvent({ ...event, tables: updated });
      }} />
    </div>
  );
};

// --- Glavna Aplikacija ---

const App = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showMgmt, setShowMgmt] = useState(false);

  useEffect(() => {
    const unsubEvents = onSnapshot(collection(db, "events"), s => setEvents(s.docs.map(d => d.data() as EventData)));
    const unsubAdmins = onSnapshot(collection(db, "admins"), s => setAdmins(s.docs.map(d => d.data() as AdminUser)));
    return () => { unsubEvents(); unsubAdmins(); };
  }, []);

  const handleLogin = async (u: string, p: string) => {
    if (u === 'admin' && p === '13377331LL') { 
      setCurrentAdmin({id:'root', username:'admin', password:'***', isMain:true}); 
      return true; 
    }
    const found = admins.find(a => a.username === u && a.password === p);
    if (found) { setCurrentAdmin(found); return true; }
    return false;
  };

  const updateEvt = async (e: EventData) => await setDoc(doc(db, "events", e.id), e);
  const deleteEvts = async (ids: string[]) => { for(const id of ids) await deleteDoc(doc(db, "events", id)); };

  return (
    <HashRouter>
      <Layout 
        currentAdmin={currentAdmin} 
        onLoginClick={() => setShowLogin(true)} 
        onLogoutClick={() => setCurrentAdmin(null)}
        onManageAdmins={() => setShowMgmt(true)}
      >
        <Routes>
          <Route path="/" element={<HomePage events={events} currentAdmin={currentAdmin} onDeleteEvents={deleteEvts} onToggleVisibility={(id: string) => { const e = events.find(x => x.id === id); if(e) updateEvt({...e, isHidden: !e.isHidden}); }} />} />
          <Route path="/admin/create" element={currentAdmin ? <AdminCreate currentAdmin={currentAdmin} onSave={async (e: any) => { await setDoc(doc(db, "events", e.id), e); }} /> : <div className="text-center py-20 text-gray-500 font-bold uppercase">Pristup odbijen.</div>} />
          <Route path="/event/:id" element={<EventDetailPage events={events} currentAdmin={currentAdmin} updateEvent={updateEvt} />} />
        </Routes>
      </Layout>
      <AdminLoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={handleLogin} />
      <AdminManagementModal isOpen={showMgmt} onClose={() => setShowMgmt(false)} currentAdmins={admins} onAddAdmin={async (u:any, p:any) => { const id = `adm-${Date.now()}`; await setDoc(doc(db, "admins", id), {id, username:u, password:p, isMain:false}); }} onDeleteAdmin={async (id:any) => await deleteDoc(doc(db, "admins", id))} />
    </HashRouter>
  );
};

const AdminLoginModal = ({ isOpen, onClose, onLogin }: any) => {
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-[200] p-4">
      <div className="bg-gray-900 p-10 rounded-[2.5rem] border border-gray-800 w-full max-w-md shadow-2xl">
        <div className="flex flex-col items-center mb-10"><ShieldCheck className="w-16 h-16 text-indigo-500 mb-4" /><h2 className="text-3xl font-black text-white uppercase tracking-tighter">Admin Panel</h2></div>
        <Input label="Korisnik" value={u} onChange={e => setU(e.target.value)} icon={<User className="w-4 h-4"/>} />
        <Input label="Lozinka" type="password" value={p} onChange={e => setP(e.target.value)} icon={<Lock className="w-4 h-4"/>} />
        {err && <p className="text-red-500 text-xs font-bold uppercase mb-4 text-center">{err}</p>}
        <div className="flex gap-3"><Button variant="secondary" onClick={onClose} className="flex-1 rounded-2xl">Zatvori</Button><Button onClick={async () => { if(await onLogin(u,p)) onClose(); else setErr('Greška!'); }} className="flex-1 rounded-2xl">Prijava</Button></div>
      </div>
    </div>
  );
};

const AdminCreate = ({ currentAdmin, onSave }: any) => {
  const [f, setF] = useState({ title:'', date:'', description:'', longDescription:'', imageUrl:'', minS: 0, maxS: 9999 });
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto bg-gray-900 p-10 rounded-[3rem] border border-gray-800 shadow-2xl space-y-6">
       <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-8">Novi <span className="text-indigo-600">Događaj</span></h2>
       <Input label="Naziv" value={f.title} onChange={e => setF({...f, title:e.target.value})} />
       <Input label="Datum i Vrijeme" type="datetime-local" value={f.date} onChange={e => setF({...f, date:e.target.value})} />
       <Input label="URL Naslovne Slike" value={f.imageUrl} onChange={e => setF({...f, imageUrl:e.target.value})} />
       
       <div className="grid grid-cols-2 gap-4 bg-indigo-500/5 p-6 rounded-3xl border border-indigo-500/10">
          <Input label="Min. Serijski Broj" type="number" value={f.minS} onChange={e => setF({...f, minS: parseInt(e.target.value)})} />
          <Input label="Max. Serijski Broj" type="number" value={f.maxS} onChange={e => setF({...f, maxS: parseInt(e.target.value)})} />
          <p className="col-span-2 text-[10px] text-indigo-400 font-bold uppercase tracking-widest text-center mt-[-10px]">Ovaj raspon služi za validaciju ulaznica gostiju.</p>
       </div>

       <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Kratki Opis</label><textarea className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white font-medium focus:ring-2 focus:ring-indigo-500" rows={2} value={f.description} onChange={e => setF({...f, description:e.target.value})} /></div>
       <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Detaljni Opis</label><textarea className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white font-medium focus:ring-2 focus:ring-indigo-500" rows={4} value={f.longDescription} onChange={e => setF({...f, longDescription:e.target.value})} /></div>
       
       <div className="flex gap-4 pt-4"><Button variant="secondary" onClick={() => navigate('/')} className="flex-1 rounded-2xl">Odustani</Button><Button variant="primary" className="flex-1 rounded-2xl h-14" onClick={async () => { if(f.title && f.date){ await onSave({ ...f, id:`evt-${Date.now()}`, tables:[], ownerId:currentAdmin.username, minTicketSerial: f.minS, maxTicketSerial: f.maxS }); navigate('/'); } }}>Objavi</Button></div>
    </div>
  );
};

export default App;