import React, { useState, useMemo } from 'react';
import { ChevronLeft, Image, Type, Mic, Palette, Search, Heart, Share2, Edit, Calendar, User, MapPin, Filter, Download, FileAudio, FileText } from 'lucide-react';
import { useAppState } from '../lib/AppStateContext';

interface Memory {
  id: string;
  title: string;
  date: string;
  type: 'photo' | 'text' | 'audio' | 'ai-generated';
  image?: string;
  description: string;
  tags: string[];
  decade: string;
  people: string[];
  location?: string;
  favorite: boolean;
  comments: number;
  shares: number;
}

interface ScrapbookTimelineProps {
  onBack: () => void;
}

const ScrapbookTimeline: React.FC<ScrapbookTimelineProps> = ({ onBack }) => {
  const { state } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'photo' | 'text' | 'audio' | 'ai-generated'>('all');
  const [filterDecade, setFilterDecade] = useState<'all' | string>('all');
  const [filterPeople, setFilterPeople] = useState<'all' | string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'audio' | null>(null);
  const [visualTheme, setVisualTheme] = useState<'none' | 'sepia' | 'vintage' | 'black-and-white'>('none');

  // Convert app state memories to scrapbook format
  const memories: Memory[] = useMemo(() => {
    return state.memories.map((memory, index) => {
      // Extract decade from date
      const year = new Date(memory.date).getFullYear();
      const decade = `${Math.floor(year / 10) * 10}s`;
      
      // Extract tags from memory
      const tags = memory.tags || [];
      
      // Extract people from tags (simplified logic)
      const people = tags.filter(tag => 
        tag.toLowerCase().includes('family') || 
        tag.toLowerCase().includes('friend') ||
        tag.toLowerCase().includes('mom') ||
        tag.toLowerCase().includes('dad') ||
        tag.toLowerCase().includes('child')
      );
      
      return {
        id: memory.id || `memory-${index}`, // Ensure ID is always a string
        title: memory.prompt || `Memory ${index + 1}`,
        date: memory.date,
        type: memory.type as 'photo' | 'text' | 'audio' | 'ai-generated',
        image: memory.type === 'photo' || memory.type === 'ai-generated' ? 'https://placehold.co/300x200/ee862b/ffffff?text=Memory+Photo' : undefined,
        description: memory.response,
        tags,
        decade,
        people,
        favorite: index % 5 === 0, // Every 5th memory is favorited for demo
        comments: Math.floor(Math.random() * 10),
        shares: Math.floor(Math.random() * 5)
      };
    });
  }, [state.memories]);

  // Get unique decades for filter
  const decades = useMemo(() => {
    const uniqueDecades = [...new Set(memories.map(m => m.decade))];
    return uniqueDecades.sort((a, b) => b.localeCompare(a)); // Newest first
  }, [memories]);

  // Get unique people for filter
  const people = useMemo(() => {
    const allPeople = memories.flatMap(m => m.people);
    const uniquePeople = [...new Set(allPeople)];
    return uniquePeople;
  }, [memories]);

  // Filter and sort memories
  const filteredMemories = useMemo(() => {
    return memories.filter(memory => {
      // Search filter
      if (searchQuery && 
          !memory.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !memory.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      
      // Type filter
      if (filterType !== 'all' && memory.type !== filterType) {
        return false;
      }
      
      // Decade filter
      if (filterDecade !== 'all' && memory.decade !== filterDecade) {
        return false;
      }
      
      // People filter
      if (filterPeople !== 'all' && !memory.people.includes(filterPeople)) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
      if (sortBy === 'newest') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });
  }, [memories, searchQuery, filterType, filterDecade, filterPeople, sortBy]);

  // Group memories by decade
  const groupedMemories = useMemo(() => {
    const groups: Record<string, Memory[]> = {};
    
    filteredMemories.forEach(memory => {
      if (!groups[memory.decade]) {
        groups[memory.decade] = [];
      }
      groups[memory.decade].push(memory);
    });
    
    // Sort decades
    const sortedDecades = Object.keys(groups).sort((a, b) => {
      if (sortBy === 'newest') {
        return b.localeCompare(a);
      } else {
        return a.localeCompare(b);
      }
    });
    
    return sortedDecades.map(decade => ({
      decade,
      memories: groups[decade]
    }));
  }, [filteredMemories, sortBy]);

  // Get media type icon
  const getMediaTypeIcon = (type: Memory['type']) => {
    switch (type) {
      case 'photo': return <Image className="w-4 h-4" />;
      case 'text': return <Type className="w-4 h-4" />;
      case 'audio': return <Mic className="w-4 h-4" />;
      case 'ai-generated': return <Palette className="w-4 h-4" />;
      default: return <Type className="w-4 h-4" />;
    }
  };

  // Get media type label
  const getMediaTypeLabel = (type: Memory['type']) => {
    switch (type) {
      case 'photo': return 'Photo';
      case 'text': return 'Text';
      case 'audio': return 'Audio';
      case 'ai-generated': return 'AI Image';
      default: return 'Text';
    }
  };

  // Get visual theme class
  const getVisualThemeClass = () => {
    switch (visualTheme) {
      case 'sepia': return 'sepia-filter';
      case 'vintage': return 'vintage-filter';
      case 'black-and-white': return 'grayscale-filter';
      default: return '';
    }
  };

  // Export as PDF
  const exportAsPDF = async () => {
    setIsExporting(true);
    setExportType('pdf');

    try {
      // Dynamically import jsPDF and html2canvas
      const [{ jsPDF }, html2canvas] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);

      // Create a new jsPDF instance
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });
      
      // Add title
      doc.setFontSize(22);
      doc.text('MemoryKeeper Scrapbook', 20, 30);
      
      // Add date
      const dateStr = new Date().toLocaleDateString();
      doc.setFontSize(12);
      doc.text(`Exported on: ${dateStr}`, 20, 50);
      
      // Add memories
      let yPosition = 70;
      
      for (const group of groupedMemories) {
        // Add decade header
        doc.setFontSize(16);
        doc.setTextColor(255, 140, 0); // Orange color
        doc.text(group.decade, 20, yPosition);
        yPosition += 20;
        
        for (const memory of group.memories) {
          // Add memory title
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0); // Black color
          doc.text(memory.title, 20, yPosition);
          yPosition += 15;
          
          // Add date
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100); // Gray color
          doc.text(new Date(memory.date).toLocaleDateString(), 20, yPosition);
          yPosition += 15;
          
          // Add description
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0); // Black color
          const descriptionLines = doc.splitTextToSize(memory.description, 400);
          doc.text(descriptionLines, 20, yPosition);
          yPosition += descriptionLines.length * 15;
          
          // Add spacing
          yPosition += 20;
          
          // Check if we need a new page
          if (yPosition > 700) {
            doc.addPage();
            yPosition = 30;
          }
        }
      }
      
      // Save the PDF
      doc.save(`MemoryKeeper_Scrapbook_${dateStr.replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // Export as audio compilation
  const exportAsAudio = async () => {
    setIsExporting(true);
    setExportType('audio');
    
    try {
      // Filter audio memories
      const audioMemories = filteredMemories.filter(memory => memory.type === 'audio');
      
      if (audioMemories.length === 0) {
        alert('No audio memories found to export.');
        return;
      }
      
      // In a real implementation, we would compile the audio files here
      // For this demo, we'll just show a message
      alert(`Audio compilation would include ${audioMemories.length} audio memories. In a full implementation, this would create an audio file with all your voice recordings.`);
    } catch (error) {
      console.error('Error exporting audio:', error);
      alert('Error exporting audio compilation. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // Show export options
  const showExportOptions = () => {
    const exportOptions = [
      { type: 'pdf', label: 'Export as PDF', icon: <FileText className="w-5 h-5" /> },
      { type: 'audio', label: 'Export Audio Compilation', icon: <FileAudio className="w-5 h-5" /> }
    ];
    
    const choice = window.confirm(
      'Choose export format:\n\n' +
      '1. PDF - Export all memories as a printable document\n' +
      '2. Audio Compilation - Export all audio memories as a single file\n\n' +
      'Press OK for PDF, Cancel for Audio Compilation'
    );
    
    if (choice) {
      exportAsPDF();
    } else {
      exportAsAudio();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 font-display">
      <style>{`
        .sepia-filter {
          filter: sepia(80%) contrast(1.2) brightness(0.7);
        }
        .vintage-filter {
          filter: sepia(50%) contrast(1.2) brightness(0.9) saturate(1.5);
          border: 8px solid #8B4513;
          border-radius: 8px;
        }
        .grayscale-filter {
          filter: grayscale(100%);
        }
      `}</style>
      
      <main className="flex-grow p-4">
        <header className="flex items-center mb-6">
          <button
            className="w-10 h-10 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-orange-100"
            onClick={onBack}
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-center flex-1 pr-10 text-gray-800">Scrapbook Timeline</h1>
        </header>
        
        {/* Search and Filter Bar */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-orange-100 p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search memories..."
                className="w-full pl-10 pr-4 py-2 bg-orange-50/50 backdrop-blur-xl border border-orange-200 rounded-xl text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="p-2 bg-orange-100 rounded-xl text-orange-700 hover:bg-orange-200">
              <Filter className="w-5 h-5" />
            </button>
          </div>
          
          {/* Advanced Filters */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Type</label>
              <select
                className="w-full bg-orange-50/50 backdrop-blur-xl border border-orange-200 rounded-xl p-2 text-gray-800 shadow-sm text-sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <option value="all">All Types</option>
                <option value="photo">Photos</option>
                <option value="text">Text</option>
                <option value="audio">Audio</option>
                <option value="ai-generated">AI Images</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Decade</label>
              <select
                className="w-full bg-orange-50/50 backdrop-blur-xl border border-orange-200 rounded-xl p-2 text-gray-800 shadow-sm text-sm"
                value={filterDecade}
                onChange={(e) => setFilterDecade(e.target.value)}
              >
                <option value="all">All Decades</option>
                {decades.map(decade => (
                  <option key={decade} value={decade}>{decade}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">People</label>
              <select
                className="w-full bg-orange-50/50 backdrop-blur-xl border border-orange-200 rounded-xl p-2 text-gray-800 shadow-sm text-sm"
                value={filterPeople}
                onChange={(e) => setFilterPeople(e.target.value)}
              >
                <option value="all">All People</option>
                {people.map(person => (
                  <option key={person} value={person}>{person}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700">Sort by</label>
              <select
                className="w-full bg-orange-50/50 backdrop-blur-xl border border-orange-200 rounded-xl p-2 text-gray-800 shadow-sm text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
          
          {/* Visual Theme Filter */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1 text-gray-700">Visual Theme</label>
            <div className="flex gap-2">
              {(['none', 'sepia', 'vintage', 'black-and-white'] as const).map((theme) => (
                <button
                  key={theme}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    visualTheme === theme
                      ? 'bg-orange-500 text-white'
                      : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                  }`}
                  onClick={() => setVisualTheme(theme)}
                >
                  {theme === 'none' ? 'Default' : theme.charAt(0).toUpperCase() + theme.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Active Filters */}
          {(searchQuery || filterType !== 'all' || filterDecade !== 'all' || filterPeople !== 'all' || visualTheme !== 'none') && (
            <div className="flex flex-wrap gap-2 mb-3">
              {searchQuery && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs flex items-center gap-1">
                  <Search className="w-3 h-3" />
                  {searchQuery}
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-orange-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {filterType !== 'all' && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs flex items-center gap-1">
                  {getMediaTypeIcon(filterType)}
                  {getMediaTypeLabel(filterType)}
                  <button 
                    onClick={() => setFilterType('all')}
                    className="ml-1 hover:text-orange-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {filterDecade !== 'all' && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {filterDecade}
                  <button 
                    onClick={() => setFilterDecade('all')}
                    className="ml-1 hover:text-orange-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {filterPeople !== 'all' && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {filterPeople}
                  <button 
                    onClick={() => setFilterPeople('all')}
                    className="ml-1 hover:text-orange-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {visualTheme !== 'none' && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs flex items-center gap-1">
                  <Palette className="w-3 h-3" />
                  {visualTheme.charAt(0).toUpperCase() + visualTheme.slice(1)}
                  <button 
                    onClick={() => setVisualTheme('none')}
                    className="ml-1 hover:text-orange-900"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Memories Grouped by Decade */}
        <div className="space-y-8">
          {groupedMemories.map(({ decade, memories }) => (
            <div key={decade}>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                {decade}: Memories
              </h2>
              
              <div className="grid grid-cols-1 gap-4">
                {memories.map((memory) => (
                  <div key={memory.id} className="p-4 bg-white/80 backdrop-blur-xl rounded-2xl border border-orange-100 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-gray-800">{memory.title}</h3>
                      <div className="flex items-center gap-2">
                        {memory.favorite && (
                          <Heart className="w-5 h-5 text-red-500 fill-current" />
                        )}
                        <span className="text-sm text-gray-600">{new Date(memory.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {memory.image && (
                      <img
                        alt={memory.title}
                        className={`w-full h-48 object-cover rounded-xl mb-3 shadow-md ${getVisualThemeClass()}`}
                        src={memory.image}
                      />
                    )}
                    
                    <p className="mb-3 text-gray-700 line-clamp-2">{memory.description}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {memory.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* People */}
                    {memory.people.length > 0 && (
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{memory.people.join(', ')}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 rounded-full text-sm font-medium flex items-center gap-1">
                          {getMediaTypeIcon(memory.type)}
                          {getMediaTypeLabel(memory.type)}
                        </span>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {memory.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="w-3 h-3" />
                            {memory.shares}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="p-2 text-orange-600 hover:bg-orange-100 rounded-xl">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-orange-600 hover:bg-orange-100 rounded-xl">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {groupedMemories.length === 0 && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-orange-100 p-8 text-center">
              <div className="text-5xl mb-4">📖</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Memories Found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || filterType !== 'all' || filterDecade !== 'all' || filterPeople !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Start adding memories to your scrapbook!'}
              </p>
              {searchQuery || filterType !== 'all' || filterDecade !== 'all' || filterPeople !== 'all' ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                    setFilterDecade('all');
                    setFilterPeople('all');
                    setVisualTheme('none');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={onBack}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold"
                >
                  Add Your First Memory
                </button>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4">
        <button className="w-14 h-14 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all">
          <span className="text-2xl">+</span>
        </button>
      </div>
      
      {/* Export Button */}
      <div className="fixed top-20 right-4">
        <button 
          className="px-4 py-2 bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-orange-100 text-orange-600 font-bold text-sm hover:bg-orange-50 transition-colors flex items-center gap-1"
          onClick={showExportOptions}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export Book
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ScrapbookTimeline;
