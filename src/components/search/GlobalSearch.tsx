import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, Camera, Filter, History, TrendingUp, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SearchResult {
  id: string;
  type: 'tool' | 'item' | 'user' | 'movement' | 'maintenance';
  title: string;
  subtitle: string;
  description?: string;
  category: string;
  relevance: number;
  url: string;
  metadata?: Record<string, any>;
}

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    type: 'tool',
    title: 'Furadeira de Impacto Makita HP333D',
    subtitle: 'FER-08172',
    description: 'Disponível - Último uso: João Silva (2 dias atrás)',
    category: 'Ferramentas Elétricas',
    relevance: 95,
    url: '/tools-qr?search=FER-08172',
    metadata: { status: 'disponivel', location: 'A1-B2' }
  },
  {
    id: '2',
    type: 'item',
    title: 'Parafuso Phillips M6x20',
    subtitle: 'PAR-001234',
    description: 'Estoque: 150 unidades - Mín: 50',
    category: 'Fixadores',
    relevance: 88,
    url: '/stock?search=PAR-001234',
    metadata: { stock: 150, minStock: 50 }
  },
  {
    id: '3',
    type: 'user',
    title: 'João Silva',
    subtitle: 'Técnico de Manutenção',
    description: '12 ferramentas em uso - Última atividade: 2h atrás',
    category: 'Usuários',
    relevance: 82,
    url: '/users?id=joao.silva',
    metadata: { department: 'Manutenção', activeTools: 12 }
  },
  {
    id: '4',
    type: 'movement',
    title: 'Movimentação Recente',
    subtitle: 'Serra Circular - Maria Santos',
    description: 'Retirada hoje às 14:30',
    category: 'Movimentações',
    relevance: 75,
    url: '/tools-qr?tab=movements',
    metadata: { action: 'checkout', time: '14:30' }
  }
];

const recentSearches = [
  'Furadeira Makita',
  'Estoque crítico',
  'João Silva',
  'Manutenção pendente'
];

const trendingSearches = [
  'Serra circular',
  'Inventário dezembro',
  'Aprovações pendentes',
  'Relatório mensal'
];

export const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Simulated search with debounce
  useEffect(() => {
    if (query.length > 2) {
      const timeoutId = setTimeout(() => {
        const filtered = mockSearchResults.filter(result =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          result.description?.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setResults([]);
    }
  }, [query]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const startVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsOpen(true);
      };

      recognition.start();
    } else {
      alert('Reconhecimento de voz não suportado neste navegador');
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      tool: '🔧',
      item: '📦',
      user: '👤',
      movement: '🔄',
      maintenance: '⚙️'
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      tool: 'bg-blue-100 text-blue-800',
      item: 'bg-green-100 text-green-800',
      user: 'bg-purple-100 text-purple-800',
      movement: 'bg-orange-100 text-orange-800',
      maintenance: 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="relative w-full max-w-2xl" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Buscar ferramentas, itens, usuários... (Ctrl+K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-24 h-11"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={startVoiceSearch}
            className={`h-7 w-7 p-0 ${isListening ? 'text-red-500' : ''}`}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Camera className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-7 w-7 p-0"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <Card className="absolute top-12 left-0 right-0 z-50 shadow-lg max-h-96">
          <CardContent className="p-0">
            {showFilters && (
              <div className="p-4 border-b bg-gray-50">
                <div className="flex flex-wrap gap-2">
                  {['tool', 'item', 'user', 'movement', 'maintenance'].map((type) => (
                    <Badge
                      key={type}
                      variant={selectedTypes.includes(type) ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => {
                        setSelectedTypes(prev =>
                          prev.includes(type)
                            ? prev.filter(t => t !== type)
                            : [...prev, type]
                        );
                      }}
                    >
                      {getTypeIcon(type)} {type === 'tool' ? 'Ferramentas' :
                                           type === 'item' ? 'Itens' :
                                           type === 'user' ? 'Usuários' :
                                           type === 'movement' ? 'Movimentações' :
                                           'Manutenção'}
                    </Badge>
                  ))}
                  {selectedTypes.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTypes([])}
                    >
                      <X className="h-3 w-3 mr-1" /> Limpar
                    </Button>
                  )}
                </div>
              </div>
            )}

            <ScrollArea className="max-h-80">
              {query.length === 0 ? (
                <div className="p-4">
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <History className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">Buscas recentes</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setQuery(search);
                            setIsOpen(true);
                          }}
                        >
                          {search}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div>
                    <div className="flex items-center mb-2">
                      <TrendingUp className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">Tendências</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((search, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setQuery(search);
                            setIsOpen(true);
                          }}
                        >
                          {search}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : results.length > 0 ? (
                <div className="divide-y">
                  {results
                    .filter(result => selectedTypes.length === 0 || selectedTypes.includes(result.type))
                    .map((result) => (
                    <div
                      key={result.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        window.location.href = result.url;
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{getTypeIcon(result.type)}</span>
                            <span className="font-medium">{result.title}</span>
                            <Badge className={getTypeColor(result.type)}>
                              {result.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{result.subtitle}</p>
                          {result.description && (
                            <p className="text-sm text-gray-500">{result.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">{result.category}</p>
                        </div>
                        <div className="text-xs text-gray-400">
                          {result.relevance}% relevante
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : query.length > 2 ? (
                <div className="p-8 text-center text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum resultado encontrado para "{query}"</p>
                  <p className="text-sm mt-2">Tente usar termos diferentes ou verificar a ortografia</p>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p className="text-sm">Digite pelo menos 3 caracteres para buscar</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
