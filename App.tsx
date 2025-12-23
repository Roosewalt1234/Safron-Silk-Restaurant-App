
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Home, Utensils, Calendar, Star, ShoppingBag, Menu as MenuIcon, X, Plus, Minus, ChefHat, Sparkles, ArrowRight, ChevronLeft, ChevronRight, Users, Clock, CalendarDays, Mic, MicOff, Volume2, Waveform, Loader2, Search, CheckCircle2, Flame, Filter, Truck, Package, MapPin, Navigation, MessageSquareQuote, StickyNote, Info, Phone, Share2, Tag, Eye, Download, Camera, TrendingUp, Bookmark } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { MenuItem, CartItem, Table, Review, Reservation, SpiceLevel } from './types';
import { MENU_ITEMS, INITIAL_TABLES, REVIEWS } from './constants';
import { getFoodRecommendations, encodeBase64, decodeBase64, decodeAudioData, generateGourmetImage } from './geminiService';

// --- Voice Assistant Component ---

const VoiceAssistant = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<'listening' | 'processing' | 'responding' | 'idle'>('idle');
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);

  const stopAssistant = () => {
    setIsActive(false);
    setStatus('idle');
    if (sessionRef.current) {
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    for (const source of sourcesRef.current) {
      try { source.stop(); } catch(e) {}
    }
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const startAssistant = async () => {
    if (isActive) {
      stopAssistant();
      return;
    }

    try {
      setIsConnecting(true);
      const apiKey =
        ((import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined) ||
        process.env.API_KEY ||
        process.env.GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error(
          'Missing Gemini API key. Set `GEMINI_API_KEY` (or `VITE_GEMINI_API_KEY`) in `.env.local` and restart the dev server.',
        );
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Prepare Menu Data for AI Training
      const menuTrainingText = MENU_ITEMS.map(i => `${i.name} (${i.cuisine}): AED ${i.price} - ${i.description}`).join('\n');

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }, // Professional American female voice
          },
          systemInstruction: `You are the FAST & ENERGETIC AI Concierge for 'Saffron & Silk', Dubai. 
          Persona: Bright, upbeat, professional American woman.
          
          OPERATING HOURS:
          - Mon-Fri: 8am - 12am (Midnight)
          - Sat-Sun: 9am - 1am
          - Breakfast: 8am - 11:30am
          - Lunch: 12pm - 4pm
          - Dinner: 4pm - Late
          
          THE MENU (STRICT DATA - DO NOT HALUCINATE):
          ${menuTrainingText}
          
          STRICT RULES:
          1. ONLY offer and discuss items available in the menu provided above. 
          2. DO NOT mention or invent any dishes that are not on this list (e.g., No Pizza, No Burgers, No Pasta).
          3. If a user asks for something not on the menu, politely decline and suggest the closest authentic Indian alternative from the menu.
          4. Be accurate with prices in AED.
          5. Speak at a brisk, fast pace. Keep responses punchy and under 2 sentences.
          6. Inform guests about our DIFC branch location if asked.`,
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            setStatus('listening');

            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(2048, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              
              let hasSignal = false;
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
                if (Math.abs(inputData[i]) > 0.05) hasSignal = true;
              }
              
              if (hasSignal && status !== 'responding') {
                setStatus('listening');
              }

              const pcmData = new Uint8Array(int16.buffer);
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: { data: encodeBase64(pcmData), mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn) {
              setStatus('responding');
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) {
                  setStatus('listening');
                }
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current) {
                try { source.stop(); } catch(e) {}
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setStatus('listening');
            }
          },
          onerror: (e) => {
            console.error('Live API Error:', e);
            stopAssistant();
          },
          onclose: () => stopAssistant()
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (err) {
      console.error('Failed to start assistant:', err);
      setIsConnecting(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
        {isActive && (
          <div className="bg-white rounded-2xl p-4 shadow-2xl border border-stone-100 mb-2 animate-in slide-in-from-bottom-4 duration-300 w-64">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  status === 'listening' ? 'bg-emerald-500 animate-pulse' : 
                  status === 'responding' ? 'bg-orange-500 animate-bounce' : 
                  'bg-blue-500 animate-spin'
                }`}></div>
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                  {status === 'listening' ? 'Listening...' : 
                   status === 'responding' ? 'Assistant Speaking' : 
                   'Processing...'}
                </span>
              </div>
              <button onClick={stopAssistant} className="text-stone-400 hover:text-stone-600 transition-colors">
                <X size={14} />
              </button>
            </div>
            
            <div className="flex items-end gap-1 h-8 px-2 overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-full transition-all duration-200 ${
                    status === 'responding' ? 'bg-orange-500' : 'bg-stone-200'
                  }`}
                  style={{ 
                    height: status === 'responding' 
                      ? `${Math.random() * 80 + 20}%` 
                      : status === 'listening' 
                        ? `${Math.random() * 40 + 10}%` 
                        : '10%',
                    animationDelay: `${i * 0.05}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}
        
        <button
          onClick={startAssistant}
          disabled={isConnecting}
          className={`group relative w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-2xl ${
            isActive ? 'bg-orange-600 text-white' : 'bg-stone-900 text-white hover:bg-orange-600'
          } ${isConnecting ? 'opacity-50 cursor-wait' : ''}`}
        >
          {isConnecting ? (
             <Loader2 className="w-8 h-8 animate-spin" />
          ) : isActive ? (
            <div className="relative">
               <MicOff size={28} />
               <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-orange-600 rounded-full"></div>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 rounded-full bg-orange-600 animate-ping opacity-20 group-hover:opacity-40"></div>
              <Mic size={28} />
            </>
          )}
        </button>
      </div>

      {isActive && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-stone-900/40 backdrop-blur-md pointer-events-none transition-all duration-500">
          <div className="max-w-md w-full p-8 text-center space-y-8 pointer-events-auto">
            <div className="relative inline-block">
              <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-500 ${
                status === 'responding' ? 'bg-orange-500/40 scale-150' : 
                status === 'listening' ? 'bg-emerald-500/20 scale-125' : 
                'bg-blue-500/20 scale-110'
              }`}></div>
              
              <div className={`relative w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
                status === 'responding' ? 'border-orange-500 scale-110' : 
                status === 'listening' ? 'border-emerald-500' : 
                'border-stone-400 border-dashed animate-spin'
              }`}>
                {status === 'responding' ? (
                  <Volume2 size={64} className="text-orange-500 animate-pulse" />
                ) : status === 'listening' ? (
                  <Mic size={64} className="text-emerald-500" />
                ) : (
                  <ChefHat size={64} className="text-stone-400" />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-white text-3xl font-serif font-bold">
                {status === 'listening' ? 'I\'m Listening' : 
                 status === 'responding' ? 'Speaking...' : 
                 'Crafting your response...'}
              </h2>
              <p className="text-stone-300 text-lg italic">
                {status === 'listening' ? 'Ask about our menu, recommendations, or booking a table' : 
                 status === 'responding' ? 'Assistant at your service' : 
                 'Consulting our kitchen experts'}
              </p>
            </div>

            <button 
              onClick={stopAssistant}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/30 text-sm font-bold backdrop-blur-md transition-all mt-8 pointer-events-auto"
            >
              Close Assistant
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// --- Navbar Component ---

interface NavbarProps {
  activeTab: string;
  setActiveTab: (t: string) => void;
  cartCount: number;
  toggleCart: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, cartCount, toggleCart }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCount = useRef(cartCount);

  useEffect(() => {
    // Only animate when count increases (item added)
    if (cartCount > prevCount.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 400);
      return () => clearTimeout(timer);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-stone-200 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white font-serif text-xl">S</div>
          <span className="font-serif text-2xl font-bold tracking-tight hidden md:block">Saffron & Silk</span>
        </div>
        
        <div className="flex items-center gap-1 md:gap-8">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'menu', icon: Utensils, label: 'Menu' },
            { id: 'reserve', icon: Calendar, label: 'Reservations' },
            { id: 'reviews', icon: Star, label: 'Reviews' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-all text-sm font-medium ${
                activeTab === item.id ? 'bg-orange-100 text-orange-700' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <item.icon size={18} />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}

          <a
            href="#contact"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full transition-all text-sm font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100"
          >
            <Phone size={18} />
            <span className="hidden sm:inline">Contact Us</span>
          </a>
          
          <button 
            onClick={toggleCart}
            className={`relative p-2 transition-all duration-300 transform outline-none ${
              isAnimating ? 'scale-125 text-orange-600' : 'scale-100 text-stone-600 hover:text-orange-600'
            }`}
          >
            <ShoppingBag size={24} className={isAnimating ? 'animate-pulse' : ''} />
            {cartCount > 0 && (
              <span className={`absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white transition-all duration-300 ${
                isAnimating ? 'scale-125' : 'scale-100'
              }`}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

const Hero: React.FC<{ onExplore: () => void }> = ({ onExplore }) => (
  <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0">
      <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" className="w-full h-full object-cover" alt="Restaurant Background" />
      <div className="absolute inset-0 bg-black/50" />
    </div>
    
    <div className="relative z-10 text-center text-white px-4 max-w-4xl">
      <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl mb-6 leading-tight">
        A Symphony of <span className="text-orange-400 italic">Spices</span> & <span className="text-emerald-400 italic">Silk</span>
      </h1>
      <p className="text-lg md:text-xl text-stone-200 mb-10 max-w-2xl mx-auto leading-relaxed">
        Experience the refined artistry of North & South Indian cuisine met with the bold, high-heat energy of authentic Chinese fusion in the heart of Dubai.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          onClick={onExplore}
          className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105"
        >
          Explore the Menu
        </button>
        <button className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full font-bold text-lg transition-all">
          Book a Table
        </button>
      </div>
    </div>
  </section>
);

const SpiceIndicator: React.FC<{ level?: SpiceLevel }> = ({ level = 0 }) => {
  return (
    <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${level === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
      {level === 0 ? (
        <span>Mild</span>
      ) : (
        <div className="flex gap-0.5">
          {[...Array(level)].map((_, i) => (
            <Flame key={i} size={14} fill="currentColor" />
          ))}
        </div>
      )}
    </div>
  );
};

const FoodCard: React.FC<{ 
  item: MenuItem; 
  onAddToCart: (i: MenuItem) => void;
  onViewGourmet: (i: MenuItem) => void;
  isPinned?: boolean;
}> = ({ item, onAddToCart, onViewGourmet, isPinned }) => {
  const images = useMemo(() => item.gallery || [item.image], [item]);
  const [activeIdx, setActiveIdx] = useState(0);

  // Calculate rating from REVIEWS constant
  const ratingData = useMemo(() => {
    const dishReviews = REVIEWS.filter(r => r.dishId === item.id);
    if (dishReviews.length === 0) return { avg: 0, count: 0 };
    const sum = dishReviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      avg: parseFloat((sum / dishReviews.length).toFixed(1)),
      count: dishReviews.length
    };
  }, [item.id]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: item.name,
      text: `Check out this delicious dish from Saffron & Silk: ${item.name} for AED ${item.price}!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const mailtoLink = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + " " + shareData.url)}`;
        window.location.href = mailtoLink;
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-stone-100 flex flex-col h-full relative">
      {isPinned && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-2 py-1 bg-orange-600 text-white text-[10px] font-bold rounded-full shadow-lg border border-white/20 animate-in fade-in zoom-in">
          <Sparkles size={10} /> AI GOURMET VIEW
        </div>
      )}
      
      <div className="relative h-56 overflow-hidden">
        {/* Carousel Images */}
        {images.map((img, idx) => (
          <img 
            key={idx}
            src={img} 
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
              idx === activeIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`} 
            alt={`${item.name} - view ${idx + 1}`} 
          />
        ))}

        {/* Navigation Overlay */}
        {images.length > 1 && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between px-2 pointer-events-none">
            <button 
              onClick={prevImage}
              className="p-1.5 rounded-full bg-white/80 backdrop-blur text-stone-900 hover:bg-orange-600 hover:text-white transition-all pointer-events-auto shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextImage}
              className="p-1.5 rounded-full bg-white/80 backdrop-blur text-stone-900 hover:bg-orange-600 hover:text-white transition-all pointer-events-auto shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Top Overlay Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
          <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-stone-900 shadow-sm">
            AED {item.price}
          </div>
          <button 
            onClick={handleShare}
            className="p-2 rounded-full bg-white/90 backdrop-blur text-stone-600 hover:text-orange-600 transition-all shadow-sm group/share"
            title="Share this dish"
          >
            <Share2 size={16} className="group-hover/share:scale-110 transition-transform" />
          </button>
        </div>
        
        {/* Gourmet Visualizer Badge */}
        <button 
          onClick={(e) => { e.stopPropagation(); onViewGourmet(item); }}
          className="absolute bottom-4 right-4 px-3 py-1.5 bg-stone-900/90 backdrop-blur text-white text-[10px] font-bold rounded-full flex items-center gap-1.5 shadow-lg transform hover:scale-105 transition-all z-10"
        >
          <Camera size={12} /> {isPinned ? 'Regenerate' : 'HD AI View'}
        </button>
        
        {/* Gallery Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5 z-10">
            {images.map((_, idx) => (
              <div 
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeIdx ? 'bg-white w-4' : 'bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <div className="text-xs font-bold text-orange-600 uppercase tracking-widest">{item.cuisine}</div>
          <SpiceIndicator level={item.spiceLevel} />
        </div>
        
        {/* Star Rating Section */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex text-orange-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                fill={i < Math.floor(ratingData.avg) ? "currentColor" : "none"} 
                className={i < Math.floor(ratingData.avg) ? "text-orange-400" : "text-stone-300"}
              />
            ))}
          </div>
          {ratingData.count > 0 && (
            <span className="text-[11px] font-bold text-stone-400">
              {ratingData.avg} ({ratingData.count})
            </span>
          )}
        </div>

        <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-orange-600 transition-colors">{item.name}</h3>
        <p className="text-stone-500 text-sm mb-6 line-clamp-2 leading-relaxed flex-1">{item.description}</p>
        
        <div className="flex flex-wrap gap-1 mb-4">
           {item.tags.map(tag => (
              <span key={tag} className="bg-stone-50 text-stone-400 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border border-stone-100">
                {tag}
              </span>
            ))}
        </div>

        <button 
          onClick={() => onAddToCart(item)}
          className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors mt-auto"
        >
          <Plus size={18} /> Add to Order
        </button>
      </div>
    </div>
  );
};

// --- Gourmet Visualizer Modal Component ---

interface GourmetModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onPin: (id: string, image: string) => void;
  isCurrentPinned: boolean;
}

const GourmetModal: React.FC<GourmetModalProps> = ({ item, onClose, onPin, isCurrentPinned }) => {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Chef is preparing the visual studio...");
  const [justPinned, setJustPinned] = useState(false);

  useEffect(() => {
    if (item) {
      handleGenerate();
    } else {
      setGeneratedImage(null);
      setJustPinned(false);
    }
  }, [item]);

  const handleGenerate = async () => {
    if (!item) return;
    setLoading(true);
    setGeneratedImage(null);
    setJustPinned(false);
    
    const messages = [
      "Plating with artisanal precision...",
      "Capturing the perfect steam...",
      "Adjusting soft morning sunlight...",
      "Polishing the final textures...",
      "Finalizing the gourmet presentation..."
    ];
    
    let textIdx = 0;
    const interval = setInterval(() => {
      setLoadingText(messages[textIdx % messages.length]);
      textIdx++;
    }, 1500);

    const result = await generateGourmetImage(item.name, item.description);
    clearInterval(interval);
    
    setGeneratedImage(result);
    setLoading(false);
  };

  const handlePin = () => {
    if (item && generatedImage) {
      onPin(item.id, generatedImage);
      setJustPinned(true);
    }
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose}></div>
      <div className="relative w-full max-w-5xl aspect-video bg-black rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/10">
        
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
            <div className="relative mb-8">
               <div className="w-24 h-24 rounded-full border-4 border-orange-600 border-t-transparent animate-spin"></div>
               <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500" size={32} />
            </div>
            <h3 className="font-serif text-3xl font-bold mb-4">Gourmet AI Rendering</h3>
            <p className="text-stone-400 font-medium italic animate-pulse">{loadingText}</p>
          </div>
        ) : generatedImage ? (
          <img src={generatedImage} className="w-full h-full object-cover animate-in fade-in duration-1000" alt={item.name} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <p className="text-stone-400 mb-4">Failed to capture the masterpiece. Please try again.</p>
            <button onClick={handleGenerate} className="px-6 py-2 bg-orange-600 rounded-full font-bold">Retry Generation</button>
          </div>
        )}

        {/* Info Overlay */}
        <div className="absolute bottom-0 inset-x-0 p-8 md:p-12 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pointer-events-auto">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-orange-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-3">
                <Sparkles size={14} /> AI Photorealistic Presentation
              </div>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4">{item.name}</h2>
              <p className="text-stone-300 text-sm md:text-base leading-relaxed italic line-clamp-2 md:line-clamp-none">
                {item.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full font-bold border border-white/20 transition-all text-sm"
              >
                Close Studio
              </button>
              
              {generatedImage && (
                <>
                  <button 
                    onClick={handlePin}
                    disabled={justPinned}
                    className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg text-sm ${
                      justPinned ? 'bg-emerald-600 text-white cursor-default' : 'bg-white text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    {justPinned ? <CheckCircle2 size={18} /> : <Bookmark size={18} />}
                    {justPinned ? 'Pinned to Menu!' : 'Pin to Menu Card'}
                  </button>
                  <a 
                    href={generatedImage} 
                    download={`${item.name.replace(/\s+/g, '_')}_Masterpiece.png`}
                    className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-bold flex items-center gap-2 transition-all shadow-lg text-sm"
                  >
                    <Download size={18} /> Save Artwork
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-black/50 text-white hover:bg-orange-600 transition-all">
          <X size={24} />
        </button>
      </div>
    </div>
  );
};

const ReservationView = () => {
  const [step, setStep] = useState<'details' | 'tables' | 'success'>('details');
  const [showModal, setShowModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    guests: 2,
    name: '',
    phone: ''
  });
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  const generateAvailability = (date: string, time: string) => {
    const slotString = date + time;
    const hash = slotString.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    return INITIAL_TABLES.map((t, idx) => ({
      ...t,
      status: (Math.abs(hash + idx) % 5 === 0) ? 'occupied' : 'available' as any
    }));
  };

  const handleNextStep = () => {
    if (bookingData.date && bookingData.time) {
      setTables(generateAvailability(bookingData.date, bookingData.time));
      setStep('tables');
    }
  };

  const handleTableClick = (id: number) => {
    const table = tables.find(t => t.id === id);
    if (table?.status === 'available') {
      setSelectedTable(id);
    }
  };

  const handleOpenConfirmation = () => {
    setShowModal(true);
  };

  const handleFinalConfirm = () => {
    setShowModal(false);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-8 text-orange-600">
          <CheckCircle2 size={64} />
        </div>
        <h2 className="font-serif text-4xl font-bold mb-4">Table Reserved!</h2>
        <p className="text-stone-500 mb-8 leading-relaxed text-lg">
          Thank you, <span className="font-bold text-stone-900">{bookingData.name}</span>! Your table <strong>#{selectedTable}</strong> is booked for <strong>{new Date(bookingData.date).toLocaleDateString()}</strong> at <strong>{bookingData.time} PM</strong>.
        </p>
        <div className="bg-stone-50 p-6 rounded-3xl mb-12 text-left space-y-3">
          <div className="flex justify-between text-sm">
             <span className="text-stone-400 uppercase font-bold tracking-widest text-[10px]">Reference</span>
             <span className="font-mono text-stone-900 font-bold">#SNK-{Math.floor(Math.random() * 90000 + 10000)}</span>
          </div>
          <div className="flex justify-between text-sm">
             <span className="text-stone-400 uppercase font-bold tracking-widest text-[10px]">Guest Contact</span>
             <span className="font-bold text-stone-900">+971 {bookingData.phone}</span>
          </div>
          <p className="text-xs text-stone-400 font-medium">A confirmation SMS has been sent to your UAE number. Please arrive 5 minutes early at our DIFC branch.</p>
        </div>
        <button 
          onClick={() => {
            setStep('details');
            setBookingData({ date: '', time: '', guests: 2, name: '', phone: '' });
            setSelectedTable(null);
          }}
          className="px-8 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-orange-600 transition-colors"
        >
          Book Another Table
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-20 min-h-[80vh]">
      <div className="text-center mb-12">
        <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">Book Your Table</h2>
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className={`flex items-center gap-2 ${step === 'details' ? 'text-orange-600' : 'text-stone-400'}`}>
            <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${step === 'details' ? 'border-orange-600 bg-orange-50' : 'border-stone-200'}`}>1</span>
            <span className="font-bold text-sm">Slot Details</span>
          </div>
          <div className="w-12 h-px bg-stone-200"></div>
          <div className={`flex items-center gap-2 ${step === 'tables' ? 'text-orange-600' : 'text-stone-400'}`}>
            <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${step === 'tables' ? 'border-orange-600 bg-orange-50' : 'border-stone-200'}`}>2</span>
            <span className="font-bold text-sm">Table Selection</span>
          </div>
        </div>
      </div>

      {step === 'details' ? (
        <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-stone-100">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase mb-2">
                  <CalendarDays size={14} className="text-orange-600" />
                  Select Date
                </label>
                <input 
                  type="date" 
                  value={bookingData.date}
                  onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-white font-medium bg-stone-900" 
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase mb-2">
                  <Clock size={14} className="text-orange-600" />
                  Select Time
                </label>
                <select 
                  value={bookingData.time}
                  onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-stone-700 font-medium bg-white"
                >
                  <option value="">Choose a time</option>
                  {["11:00", "12:00", "13:00", "14:00", "18:00", "19:00", "20:00", "21:00", "22:00"].map(t => (
                    <option key={t} value={t}>{t} PM</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase mb-2">
                <Users size={14} className="text-orange-600" />
                Number of Guests
              </label>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <button
                    key={num}
                    onClick={() => setBookingData({...bookingData, guests: num})}
                    className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all ${bookingData.guests === num ? 'bg-orange-600 text-white shadow-lg' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <button 
              disabled={!bookingData.date || !bookingData.time}
              onClick={handleNextStep}
              className="w-full py-5 bg-stone-900 text-white rounded-2xl font-bold text-xl hover:bg-orange-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg group"
            >
              Check Availability <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-stone-100 p-8 rounded-3xl border-2 border-stone-200 relative">
              <div className="flex justify-between items-center mb-8">
                <div className="text-sm font-bold text-stone-600 bg-white px-4 py-2 rounded-full shadow-sm">Main Dining Hall (DIFC Branch)</div>
                <button onClick={() => setStep('details')} className="flex items-center gap-1 text-orange-600 font-bold text-sm hover:underline">
                  <ChevronLeft size={16} /> Edit Slot
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {tables.map(table => (
                  <button
                    key={table.id}
                    onClick={() => handleTableClick(table.id)}
                    disabled={table.status === 'occupied'}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all transform hover:scale-105 border-2 ${
                      table.status === 'occupied' 
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed border-transparent' 
                        : selectedTable === table.id 
                          ? 'bg-orange-600 text-white border-orange-500 shadow-xl shadow-orange-200 z-10' 
                          : 'bg-white text-stone-900 border-stone-200 hover:border-orange-500 hover:bg-orange-50'
                    }`}
                  >
                    <div className="text-[10px] opacity-60 mb-1">TABLE</div>
                    <div className="text-2xl font-bold">{table.id}</div>
                    <div className="text-[10px] mt-1 flex items-center gap-1">
                      <Users size={10} /> {table.seats}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-white border border-stone-200 rounded"></div> Available</div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-stone-200 rounded"></div> Taken</div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-600 rounded shadow"></div> Selection</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-stone-100 h-fit sticky top-24">
            <div className="flex items-center gap-3 mb-8 text-stone-500 text-sm">
              <Sparkles className="text-orange-500" size={20} />
              <span className="font-bold uppercase tracking-wider">Final Step</span>
            </div>
            
            <h3 className="font-serif text-2xl font-bold mb-6">UAE Guest Details</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between py-3 border-b border-stone-50">
                <span className="text-stone-400 text-sm">Date</span>
                <span className="font-bold">{new Date(bookingData.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-stone-50">
                <span className="text-stone-400 text-sm">Time</span>
                <span className="font-bold">{bookingData.time} PM</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-stone-50">
                <span className="text-stone-400 text-sm">Guests</span>
                <span className="font-bold">{bookingData.guests} People</span>
              </div>
              {selectedTable && (
                <div className="flex items-center justify-between py-3 border-b border-stone-50 text-orange-600">
                  <span className="text-orange-400 text-sm">Table</span>
                  <span className="font-bold">Table #{selectedTable}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2 tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  value={bookingData.name}
                  onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50/50" 
                  placeholder="e.g. Ahmed Al-Maktoum" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2 tracking-widest flex items-center gap-2">
                  <span>UAE Mobile Number</span>
                  <span className="text-[10px] lowercase font-normal text-stone-400">(9 digits)</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pr-2 border-r border-stone-200">
                    <span className="text-lg" role="img" aria-label="UAE Flag">🇦🇪</span>
                    <span className="text-stone-500 font-bold text-sm">+971</span>
                  </div>
                  <input 
                    type="tel" 
                    value={bookingData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                      setBookingData({...bookingData, phone: val})
                    }}
                    className="w-full px-4 py-3 pl-20 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50/50 transition-all" 
                    placeholder="50 123 4567" 
                  />
                </div>
              </div>
              <button 
                disabled={!selectedTable || !bookingData.name || bookingData.phone.length < 9}
                onClick={handleOpenConfirmation}
                className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold text-lg hover:bg-orange-700 transition-colors disabled:opacity-50 shadow-lg active:scale-95"
              >
                Confirm My Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="animate-pulse">
                  <Sparkles size={32} />
                </div>
              </div>
              <h3 className="font-serif text-3xl font-bold mb-4">Final Review</h3>
              <p className="text-stone-500 mb-8">Please double-check your Dubai DIFC reservation details before we finalize.</p>
              
              <div className="bg-stone-50 rounded-3xl p-6 text-left space-y-4 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 border border-stone-100 shadow-sm"><Users size={20} /></div>
                  <div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Reserved For</div>
                    <div className="font-bold text-stone-900">{bookingData.name} • {bookingData.guests} Guests</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 border border-stone-100 shadow-sm"><Phone size={20} /></div>
                  <div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">UAE Contact</div>
                    <div className="font-bold text-stone-900">+971 {bookingData.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 border border-stone-100 shadow-sm"><CalendarDays size={20} /></div>
                  <div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Date & Time</div>
                    <div className="font-bold text-stone-900">{new Date(bookingData.date).toLocaleDateString()} at {bookingData.time} PM</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleFinalConfirm}
                  className="w-full py-5 bg-stone-900 text-white rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all shadow-xl active:scale-95"
                >
                  Confirm & Finalize
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full py-4 text-stone-400 font-bold hover:text-stone-600 transition-colors"
                >
                  Go Back & Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [filter, setFilter] = useState<{ cuisine: string; meal: string; spice: string; tag: string }>({ cuisine: 'All', meal: 'All', spice: 'All', tag: 'All' });
  const [searchQuery, setSearchQuery] = useState('');
  const [aiRecs, setAiRecs] = useState<{ name: string; reason: string }[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [pinnedImages, setPinnedImages] = useState<Record<string, string>>({});
  
  // Gourmet Modal State
  const [gourmetItem, setGourmetItem] = useState<MenuItem | null>(null);

  // Persistence Logic
  useEffect(() => {
    const saved = localStorage.getItem('saffron_pinned_images');
    if (saved) {
      try {
        setPinnedImages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load pinned images", e);
      }
    }
  }, []);

  const handlePinImage = (id: string, image: string) => {
    const newPinned = { ...pinnedImages, [id]: image };
    setPinnedImages(newPinned);
    localStorage.setItem('saffron_pinned_images', JSON.stringify(newPinned));
  };

  const DELIVERY_FEE = 15; // AED
  const TAKEAWAY_DISCOUNT_PERCENT = 0.10; // 10%

  const displayMenu = useMemo(() => {
    return MENU_ITEMS.map(item => ({
      ...item,
      image: pinnedImages[item.id] || item.image,
      gallery: pinnedImages[item.id] ? [pinnedImages[item.id], ...(item.gallery || [])] : item.gallery
    }));
  }, [pinnedImages]);
  
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  
  const takeawayDiscount = useMemo(() => {
    return orderType === 'takeaway' ? subtotal * TAKEAWAY_DISCOUNT_PERCENT : 0;
  }, [subtotal, orderType]);

  const finalTotal = useMemo(() => {
    return subtotal - takeawayDiscount + (orderType === 'delivery' ? DELIVERY_FEE : 0);
  }, [subtotal, takeawayDiscount, orderType]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setDeliveryAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)} (Dubai Region)`);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location. Please enter it manually.");
        setIsLocating(false);
      }
    );
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    triggerAiRecs([...cart, { ...item, quantity: 1 }]);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const triggerAiRecs = async (currentCart: CartItem[]) => {
    if (currentCart.length === 0) return;
    setLoadingAi(true);
    const names = currentCart.map(i => i.name);
    const recs = await getFoodRecommendations(names, "Suggest perfect pairings from our North/South Indian or Chinese menu.");
    setAiRecs(recs);
    setLoadingAi(false);
  };

  const filteredMenu = useMemo(() => {
    return displayMenu.filter(item => {
      const cuisineMatch = filter.cuisine === 'All' || item.cuisine === filter.cuisine;
      const mealMatch = filter.meal === 'All' || item.meal.includes(filter.meal as any);
      const spiceMatch = filter.spice === 'All' || (item.spiceLevel !== undefined && item.spiceLevel.toString() === filter.spice);
      const tagMatch = filter.tag === 'All' || item.tags.includes(filter.tag);
      const nameMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return cuisineMatch && mealMatch && nameMatch && spiceMatch && tagMatch;
    });
  }, [filter, searchQuery, displayMenu]);

  // Order type info text
  const getOrderTypeInfo = () => {
    switch(orderType) {
      case 'dine-in':
        return {
          title: 'Dine-in Order',
          desc: 'Perfect for joining us in person at DIFC, Dubai. We will prepare your meal for your arrival.',
          badge: 'Table Priority'
        };
      case 'takeaway':
        return {
          title: 'Fresh Takeaway',
          desc: 'Pick up your order directly from our kitchen in DIFC, Dubai. Save 10% on your entire order!',
          badge: '10% OFF'
        };
      case 'delivery':
        return {
          title: 'Direct Delivery',
          desc: `Hot and fresh to your doorstep in Dubai. A flat AED ${DELIVERY_FEE} delivery fee applies.`,
          badge: `AED ${DELIVERY_FEE} Fee`
        };
      default:
        return { title: '', desc: '', badge: '' };
    }
  };

  const orderInfo = getOrderTypeInfo();

  return (
    <div className="min-h-screen">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
        toggleCart={() => setIsCartOpen(true)}
      />

      <VoiceAssistant />
      
      {/* Gourmet AI Studio Modal */}
      <GourmetModal 
        item={gourmetItem} 
        onClose={() => setGourmetItem(null)} 
        onPin={handlePinImage}
        isCurrentPinned={gourmetItem ? !!pinnedImages[gourmetItem.id] : false}
      />

      {/* Cart Sidebar */}
      <div className={`fixed inset-0 z-[60] bg-black/60 transition-opacity ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsCartOpen(false)}>
        <div 
          className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="font-serif text-2xl font-bold">Your Order</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><X /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
              {/* Order Type Selector */}
              <div className="space-y-4">
                 {/* Order Type Information */}
                 <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center justify-between mb-1.5">
                       <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                          <Info size={14} className="text-orange-600" />
                          {orderInfo.title}
                       </h3>
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${orderType === 'takeaway' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                          {orderInfo.badge}
                       </span>
                    </div>
                    <p className="text-xs text-stone-500 leading-relaxed italic">
                       {orderInfo.desc}
                    </p>
                 </div>

                 <div className="flex gap-1 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
                    {[
                      { id: 'dine-in', label: 'Dine-in', icon: Utensils },
                      { id: 'takeaway', label: 'Takeaway', icon: Package },
                      { id: 'delivery', label: 'Delivery', icon: Truck }
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => setOrderType(type.id as any)}
                        className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-xs ${
                          orderType === type.id 
                            ? 'bg-white text-orange-600 shadow-sm' 
                            : 'text-stone-500 hover:text-stone-900'
                        }`}
                      >
                        <type.icon size={14} />
                        {type.label}
                      </button>
                    ))}
                 </div>

                 {orderType === 'delivery' && (
                   <div className="animate-in slide-in-from-top-2 duration-300 space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Delivery Address (Dubai)</label>
                        <div className="relative group">
                           <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-600 transition-colors" />
                           <input 
                             type="text" 
                             value={deliveryAddress}
                             onChange={(e) => setDeliveryAddress(e.target.value)}
                             className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3.5 pl-11 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-medium"
                             placeholder="e.g. Burj Khalifa Street, Downtown Dubai, Flat 12B..."
                           />
                           <button 
                             onClick={handleGetCurrentLocation}
                             disabled={isLocating}
                             className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                             title="Use current location"
                           >
                             {isLocating ? <Loader2 size={16} className="animate-spin text-orange-600" /> : <Navigation size={16} />}
                           </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Delivery Instructions</label>
                        <div className="relative group">
                           <MessageSquareQuote size={16} className="absolute left-4 top-4 text-stone-400 group-focus-within:text-orange-600 transition-colors" />
                           <textarea 
                             value={deliveryNotes}
                             onChange={(e) => setDeliveryNotes(e.target.value)}
                             rows={2}
                             className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-medium resize-none"
                             placeholder="e.g. Leave with security, gate code 1234..."
                           />
                        </div>
                      </div>
                   </div>
                 )}

                 {/* General Order Notes - Visible for all types */}
                 <div className="animate-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Special Order Notes (Optional)</label>
                    <div className="relative group">
                       <StickyNote size={16} className="absolute left-4 top-4 text-stone-400 group-focus-within:text-orange-600 transition-colors" />
                       <textarea 
                         value={orderNotes}
                         onChange={(e) => setOrderNotes(e.target.value)}
                         rows={2}
                         className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-medium resize-none"
                         placeholder="Dietary requirements, extra cutlery, etc..."
                       />
                    </div>
                 </div>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-20 text-stone-400">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="opacity-20" size={40} />
                  </div>
                  <p className="font-medium">Your basket is empty.</p>
                  <p className="text-sm mt-1">Start adding some spice!</p>
                  <button 
                    onClick={() => { setIsCartOpen(false); setActiveTab('menu'); }}
                    className="mt-8 px-6 py-2.5 bg-orange-50 text-orange-600 rounded-full font-bold text-sm hover:bg-orange-100 transition-all"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-4 group">
                        <div className="relative overflow-hidden rounded-2xl">
                          <img src={pinnedImages[item.id] || item.image} className="w-24 h-24 object-cover transition-transform group-hover:scale-105" alt={item.name} />
                          <div className="absolute top-1 right-1">
                            <SpiceIndicator level={item.spiceLevel} />
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col">
                          <h4 className="font-bold text-stone-900">{item.name}</h4>
                          <div className="text-xs text-stone-500 uppercase tracking-widest mt-0.5">{item.cuisine}</div>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-3 bg-stone-100 rounded-full px-2 py-1">
                              <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:text-orange-600 transition-colors"><Minus size={12} /></button>
                              <span className="font-bold text-sm min-w-[12px] text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:text-orange-600 transition-colors"><Plus size={12} /></button>
                            </div>
                            <div className="font-bold text-stone-900">AED {(item.price * item.quantity).toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-orange-800">
                      <ChefHat size={20} className="animate-bounce" />
                      <span className="font-bold uppercase tracking-widest text-xs">Chef's AI Pairings</span>
                    </div>
                    {loadingAi ? (
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-orange-200 rounded w-3/4"></div>
                        <div className="h-4 bg-orange-200 rounded w-1/2"></div>
                      </div>
                    ) : aiRecs.length > 0 ? (
                      <div className="space-y-4">
                        {aiRecs.map((rec, i) => (
                          <div key={i} className="text-sm bg-white/50 p-3 rounded-xl border border-white">
                            <span className="font-bold text-orange-900 block">{rec.name}</span>
                            <span className="text-orange-700/80 italic text-[11px] leading-snug">{rec.reason}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-orange-600/60 leading-relaxed italic">Add items to discover personalized flavor pairings from our experts.</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="p-8 border-t border-stone-100 bg-white space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm text-stone-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-stone-900">AED {subtotal.toFixed(2)}</span>
                </div>
                
                {orderType === 'takeaway' && (
                  <div className="flex justify-between items-center text-sm text-emerald-600 animate-in slide-in-from-right-2 duration-300 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                    <span className="flex items-center gap-1.5 font-medium"><Tag size={14} /> Takeaway Discount (10%)</span>
                    <span className="font-bold">- AED {takeawayDiscount.toFixed(2)}</span>
                  </div>
                )}

                {orderType === 'delivery' && (
                  <div className="flex justify-between items-center text-sm text-stone-500 animate-in slide-in-from-right-2 duration-300">
                    <span className="flex items-center gap-1.5"><Truck size={14} /> Delivery Fee</span>
                    <span className="font-bold text-stone-900">AED {DELIVERY_FEE.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-stone-50">
                  <span className="font-serif text-xl font-bold">Total</span>
                  <span className="font-serif text-3xl font-bold text-orange-600">AED {finalTotal.toFixed(2)}</span>
                </div>
              </div>
              <button 
                disabled={cart.length === 0 || (orderType === 'delivery' && !deliveryAddress.trim())}
                className="w-full py-5 bg-stone-900 text-white rounded-[1.5rem] font-bold text-lg hover:bg-orange-600 transition-all disabled:opacity-50 disabled:bg-stone-200 disabled:cursor-not-allowed shadow-xl active:scale-[0.98]"
              >
                {orderType === 'delivery' && !deliveryAddress.trim() && cart.length > 0 ? 'Enter Address to Proceed' : 'Finalize My Order'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="pt-16">
        {activeTab === 'home' && (
          <>
            <Hero onExplore={() => setActiveTab('menu')} />
            <section className="py-24 max-w-7xl mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div className="relative">
                  <img src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" className="rounded-3xl shadow-2xl relative z-10" alt="Cooking" />
                  <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-orange-100 rounded-3xl -z-0"></div>
                </div>
                <div>
                  <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8 leading-tight">Mastering the Heat of the <span className="text-orange-600">Clay Oven</span> & the <span className="text-emerald-600">Wok</span></h2>
                  <p className="text-stone-600 text-lg leading-relaxed mb-8 italic">
                    "At Saffron & Silk Dubai, we don't just cook fusion; we bridge continents. Every dish is a tribute to the bustling markets of Delhi, the coastal breeze of Chennai, and the neon-lit kitchens of Hong Kong."
                  </p>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-3xl font-serif font-bold text-stone-900">40+</div>
                      <div className="text-stone-500 uppercase tracking-widest text-[10px] font-bold mt-1">Authentic Spices</div>
                    </div>
                    <div>
                      <div className="text-3xl font-serif font-bold text-stone-900">24h</div>
                      <div className="text-stone-500 uppercase tracking-widest text-[10px] font-bold mt-1">Slow Cooking</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'menu' && (
          <section className="py-12 bg-stone-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex flex-col gap-10 mb-16">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 text-orange-600 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">
                    <Utensils size={14} /> Taste the Extraordinary
                  </div>
                  <h2 className="font-serif text-4xl md:text-6xl font-bold mb-4">Our Menu</h2>
                  <p className="text-stone-500 leading-relaxed italic">Explore a curated collection where heritage meets innovation. From the lacy appams of Kerala to the wok-tossed vigor of Indo-Chinese fusion.</p>
                </div>

                {/* --- Integrated Search & Filter Bar --- */}
                <div className="space-y-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100">
                  <div className="flex flex-col xl:flex-row items-center gap-8">
                    {/* Search Field */}
                    <div className="relative w-full xl:max-w-md group">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-600 transition-colors" size={20} />
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for a masterpiece..."
                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-14 pr-12 py-4.5 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-medium"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-stone-200 rounded-full text-stone-400">
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    {/* Filter Groups Container */}
                    <div className="flex flex-wrap items-center gap-x-10 gap-y-6 w-full xl:flex-1">
                      
                      {/* Meal Filter Group */}
                      <div className="space-y-2.5">
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Occasion</label>
                        <div className="bg-stone-50 p-1.5 rounded-full flex border border-stone-200 shadow-inner">
                          {['All', 'Breakfast', 'Lunch', 'Dinner'].map(m => (
                            <button 
                              key={m} 
                              onClick={() => setFilter(f => ({ ...f, meal: m }))}
                              className={`px-5 py-2.5 rounded-full text-[11px] font-bold transition-all ${filter.meal === m ? 'bg-orange-600 text-white shadow-lg scale-105' : 'text-stone-500 hover:text-stone-900'}`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Cuisine Filter Group */}
                      <div className="space-y-2.5">
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Heritage</label>
                        <div className="bg-stone-50 p-1.5 rounded-full flex border border-stone-200 shadow-inner">
                          {['All', 'North Indian', 'South Indian', 'Chinese'].map(c => (
                            <button 
                              key={c} 
                              onClick={() => setFilter(f => ({ ...f, cuisine: c }))}
                              className={`px-5 py-2.5 rounded-full text-[11px] font-bold transition-all ${filter.cuisine === c ? 'bg-orange-600 text-white shadow-lg scale-105' : 'text-stone-500 hover:text-stone-900'}`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Highlights Filter Group */}
                      <div className="space-y-2.5">
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Highlights</label>
                        <div className="bg-stone-50 p-1.5 rounded-full flex border border-stone-200 shadow-inner">
                          {[
                            { val: 'All', label: 'All', icon: null },
                            { val: 'Chef Special', label: 'Specials', icon: Sparkles },
                            { val: 'Most Popular', label: 'Trending', icon: TrendingUp }
                          ].map(t => (
                            <button 
                              key={t.val} 
                              onClick={() => setFilter(f => ({ ...f, tag: t.val }))}
                              className={`px-5 py-2.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 ${filter.tag === t.val ? 'bg-amber-500 text-white shadow-lg scale-105' : 'text-stone-500 hover:text-stone-900'}`}
                            >
                              {t.icon && <t.icon size={12} />}
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Spice Level Filter Group */}
                      <div className="space-y-2.5">
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Heat Intensity</label>
                        <div className="bg-stone-50 p-1.5 rounded-full flex border border-stone-200 shadow-inner">
                          {[
                            { val: 'All', label: 'Any' },
                            { val: '0', label: 'Mild' },
                            { val: '1', label: 'Medium' },
                            { val: '2', label: 'Hot' },
                            { val: '3', label: 'Extra Hot' }
                          ].map(s => (
                            <button 
                              key={s.val} 
                              onClick={() => setFilter(f => ({ ...f, spice: s.val }))}
                              className={`px-4 py-2.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 ${filter.spice === s.val ? 'bg-red-600 text-white shadow-lg scale-105' : 'text-stone-500 hover:text-stone-900'}`}
                            >
                              {s.label}
                              {s.val !== 'All' && s.val !== '0' && (
                                <div className="flex opacity-80">
                                  {[...Array(parseInt(s.val))].map((_, i) => <Flame key={i} size={10} fill="currentColor" />)}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                  
                  {/* Reset Filters Summary */}
                  {(filter.cuisine !== 'All' || filter.meal !== 'All' || filter.spice !== 'All' || filter.tag !== 'All' || searchQuery) && (
                    <div className="pt-4 flex items-center justify-between border-t border-stone-100 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="text-[11px] font-medium text-stone-400">
                        Showing results for <span className="text-stone-900 font-bold">{filter.meal}</span> meals, <span className="text-stone-900 font-bold">{filter.cuisine}</span> cuisine, 
                        {filter.tag !== 'All' && <><span className="text-stone-900 font-bold"> {filter.tag}</span> selections,</>} at <span className="text-stone-900 font-bold">{filter.spice === 'All' ? 'any' : filter.spice}</span> heat level.
                      </div>
                      <button 
                        onClick={() => {setSearchQuery(''); setFilter({cuisine: 'All', meal: 'All', spice: 'All', tag: 'All'})}}
                        className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                      >
                        <X size={12} /> Clear All Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {filteredMenu.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredMenu.map(item => (
                    <FoodCard 
                      key={item.id} 
                      item={item} 
                      onAddToCart={addToCart} 
                      onViewGourmet={setGourmetItem}
                      isPinned={!!pinnedImages[item.id]}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-white rounded-[3rem] border border-stone-100 shadow-sm animate-in fade-in duration-500">
                  <div className="bg-stone-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Search className="text-stone-300" size={40} />
                  </div>
                  <h3 className="font-serif text-3xl font-bold text-stone-900 mb-3">No matching flavors</h3>
                  <p className="text-stone-500 max-w-sm mx-auto leading-relaxed">We couldn't find any dishes matching your current selection. Perhaps try a different heritage or a milder heat level?</p>
                  <button 
                    onClick={() => {setSearchQuery(''); setFilter({cuisine: 'All', meal: 'All', spice: 'All', tag: 'All'})}}
                    className="mt-10 px-8 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-orange-600 transition-all shadow-lg"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'reserve' && <ReservationView />}

        {activeTab === 'reviews' && (
          <section className="py-20 max-w-4xl mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">Guest Testimonials</h2>
              <div className="flex justify-center gap-1 text-orange-400 mb-2">
                {[1,2,3,4,5].map(i => <Star key={i} fill="currentColor" size={24} />)}
              </div>
              <p className="text-stone-500">4.9 average based on over 2,000 global diners.</p>
            </div>

            <div className="space-y-8 mb-16">
              {REVIEWS.map(review => (
                <div key={review.id} className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg">{review.user}</h4>
                      <p className="text-stone-400 text-xs">{new Date(review.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-0.5 text-orange-400">
                      {Array.from({ length: review.rating }).map((_, i) => <Star key={i} fill="currentColor" size={14} />)}
                    </div>
                  </div>
                  <p className="text-stone-600 italic leading-relaxed">"{review.comment}"</p>
                </div>
              ))}
            </div>

            <div className="bg-stone-900 text-white p-10 rounded-3xl">
              <h3 className="font-serif text-2xl font-bold mb-6">Leave a Review</h3>
              <div className="space-y-4">
                 <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Your Rating</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(i => <button key={i} className="text-stone-600 hover:text-orange-400"><Star size={24} /></button>)}
                  </div>
                </div>
                <textarea 
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-orange-500 text-white" 
                  rows={4} 
                  placeholder="Tell us about your experience in Dubai..."
                ></textarea>
                <button className="px-8 py-3 bg-orange-600 rounded-xl font-bold hover:bg-orange-700 transition-colors">Submit Review</button>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer id="contact" className="bg-stone-900 text-white py-20 mt-20 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center text-white font-serif text-lg">S</div>
              <span className="font-serif text-2xl font-bold tracking-tight">Saffron & Silk</span>
            </div>
            <p className="text-stone-400 max-w-sm leading-relaxed mb-8">
              Pushing the boundaries of traditional dining through a curated blend of Indian heritage and Chinese culinary innovation in Dubai.
            </p>
            <div className="flex gap-4">
              {['FB', 'IG', 'TW'].map(s => <button key={s} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors font-bold text-xs">{s}</button>)}
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-xs">Hours</h4>
            <ul className="space-y-2 text-stone-400 text-sm">
              <li>Mon - Fri: 8am - 12am</li>
              <li>Sat - Sun: 9am - 1am</li>
              <li className="pt-4 text-orange-400">Breakfast: 8am - 11:30am</li>
              <li>Lunch: 12pm - 4pm</li>
              <li>Dinner: 4pm - Late</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-xs">Contact (Dubai)</h4>
            <ul className="space-y-2 text-stone-400 text-sm">
              <li>Level 42, Burj Daman</li>
              <li>Al Sa'ada St, DIFC, Dubai</li>
              <li className="pt-4">+971 4 123 4567</li>
              <li>hello@saffronandsilk.ae</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-white/5 text-center text-stone-500 text-xs">
          © 2024 Saffron & Silk Restaurant Group UAE. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
