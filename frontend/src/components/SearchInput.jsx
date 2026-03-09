import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HiSearch, HiX, HiCheck } from 'react-icons/hi';

export default function SearchInput({ value, onChange, options = [], placeholder = 'Ketik untuk mencari...', className = '' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, direction: 'down' });
  const ref = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selectedOption = options.find(o => o.value === value);

  const filtered = query.length >= 1
    ? options.filter(o => o.value && o.label.toLowerCase().includes(query.toLowerCase()))
    : [];

  const updatePos = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const direction = spaceBelow < 220 ? 'up' : 'down';
    setPos({ top: direction === 'down' ? rect.bottom + 6 : rect.top - 6, left: rect.left, width: rect.width, direction });
  };

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target) && listRef.current && !listRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      updatePos();
      const onScroll = () => updatePos();
      window.addEventListener('scroll', onScroll, true);
      window.addEventListener('resize', onScroll);
      return () => { window.removeEventListener('scroll', onScroll, true); window.removeEventListener('resize', onScroll); };
    }
  }, [open]);

  const handleSelect = (opt) => {
    onChange(opt.value);
    setQuery('');
    setOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setQuery('');
    setOpen(false);
  };

  const handleFocus = () => {
    updatePos();
    setOpen(true);
    if (selectedOption) setQuery('');
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    updatePos();
    setOpen(true);
    if (value) onChange('');
  };

  const dropdownList = open && !selectedOption && createPortal(
    <div
      ref={listRef}
      className="fixed z-[9999] bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300"
      style={{
        top: pos.direction === 'down' ? pos.top : undefined,
        bottom: pos.direction === 'up' ? window.innerHeight - pos.top : undefined,
        left: pos.left,
        width: pos.width,
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e1 transparent',
      }}
    >
      {query.length < 1 ? (
        <div className="px-4 py-3 text-xs text-slate-400 text-center">Ketik minimal 1 karakter...</div>
      ) : filtered.length === 0 ? (
        <div className="px-4 py-3 text-xs text-slate-400 text-center">Tidak ditemukan</div>
      ) : (
        <div className="py-1">
          {filtered.map((opt, idx) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt)}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 ${idx !== filtered.length - 1 ? 'border-b border-slate-50' : ''}`}
            >
              <span className="truncate">{opt.label}</span>
              {value === opt.value && <HiCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="relative">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        {selectedOption ? (
          <div className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm flex items-center">
            <span className="text-slate-700 font-medium truncate">{selectedOption.label}</span>
            <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 cursor-pointer">
              <HiX className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        )}
      </div>
      {dropdownList}
    </div>
  );
}
