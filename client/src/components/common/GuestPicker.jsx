import React, { useState, useEffect, useRef } from 'react';
import { Users, Minus, Plus, User, Baby, DoorOpen, X, Check } from 'lucide-react';

const GuestPicker = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [counts, setCounts] = useState({
        adults: 2,
        children: 0,
        rooms: 1
    });
    
    const wrapperRef = useRef(null);

    // Initialize from parent value if possible
    useEffect(() => {
        if (typeof value === 'string' && value.includes('Adult')) {
            const adults = parseInt(value.split('Adult')[0]) || 2;
            let children = 0;
            if (value.includes('Child')) {
                children = parseInt(value.split(', ')[1]?.split(' Child')[0]) || 0;
            }
            const rooms = parseInt(value.split(', ').pop().split(' Room')[0]) || 1;
            setCounts({ adults, children, rooms });
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const updateCount = (type, delta) => {
        const newVal = Math.max(type === 'adults' || type === 'rooms' ? 1 : 0, counts[type] + delta);
        const newCounts = { ...counts, [type]: newVal };
        setCounts(newCounts);
        
        // Format string: "2 Adults, 1 Child, 1 Room"
        let str = `${newCounts.adults} Adult${newCounts.adults > 1 ? 's' : ''}`;
        if (newCounts.children > 0) {
            str += `, ${newCounts.children} Child${newCounts.children > 1 ? 'ren' : ''}`;
        }
        str += `, ${newCounts.rooms} Room${newCounts.rooms > 1 ? 's' : ''}`;
        
        onChange(str);
    };

    return (
        <div className="md:h-full relative w-full" ref={wrapperRef}>
            <div 
                className="text-left group cursor-pointer h-full border-none flex flex-col justify-center min-w-[140px]"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-dark truncate leading-tight">{value}</span>
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 w-80 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-50 p-6 animate-fade-in-up">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                        <h3 className="font-black text-dark tracking-tight">Select Guests & Rooms</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-dark">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Adults */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-dark text-sm">Adults</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ages 13+</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); updateCount('adults', -1); }}
                                    className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30"
                                    disabled={counts.adults <= 1}
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="font-black text-dark text-lg w-4 text-center">{counts.adults}</span>
                                <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); updateCount('adults', 1); }}
                                    className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Children */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-pink-50 text-pink-500 rounded-2xl">
                                    <Baby size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-dark text-sm">Children</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ages 0-12</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); updateCount('children', -1); }}
                                    className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30"
                                    disabled={counts.children <= 0}
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="font-black text-dark text-lg w-4 text-center">{counts.children}</span>
                                <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); updateCount('children', 1); }}
                                    className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Rooms */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl">
                                    <DoorOpen size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-dark text-sm">Rooms</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total units</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); updateCount('rooms', -1); }}
                                    className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30"
                                    disabled={counts.rooms <= 1}
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="font-black text-dark text-lg w-4 text-center">{counts.rooms}</span>
                                <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); updateCount('rooms', 1); }}
                                    className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="w-full mt-8 py-4 bg-dark text-white font-black text-sm rounded-2xl shadow-xl shadow-dark/10 hover:scale-[1.02] transform transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Check size={18} /> Apply Selection
                    </button>
                </div>
            )}
        </div>
    );
};

export default GuestPicker;
