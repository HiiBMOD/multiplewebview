import React, { useState, useEffect } from 'react';
import { Plus, X, Maximize2, ExternalLink, LayoutGrid, AlertCircle, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WebApp {
  id: string;
  url: string;
  title: string;
}

const DEFAULT_APPS: WebApp[] = [
  {
    id: '1',
    url: 'https://en.wikipedia.org/wiki/Main_Page',
    title: 'Wikipedia',
  },
  {
    id: '2',
    url: 'https://example.com',
    title: 'Example Domain',
  }
];

export default function App() {
  const [apps, setApps] = useState<WebApp[]>(() => {
    const saved = localStorage.getItem('multi-app-workspace');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_APPS;
      }
    }
    return DEFAULT_APPS;
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [maximizedId, setMaximizedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('multi-app-workspace', JSON.stringify(apps));
  }, [apps]);

  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    let formattedUrl = newUrl;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const newApp: WebApp = {
      id: Date.now().toString(),
      url: formattedUrl,
      title: newTitle.trim() || formattedUrl.replace(/^https?:\/\//i, '').split('/')[0],
    };

    setApps([...apps, newApp]);
    setIsAdding(false);
    setNewUrl('');
    setNewTitle('');
  };

  const removeApp = (id: string) => {
    setApps(apps.filter(app => app.id !== id));
    if (maximizedId === id) {
      setMaximizedId(null);
    }
  };

  const toggleMaximize = (id: string) => {
    setMaximizedId(maximizedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="bg-neutral-900 text-white p-2 rounded-lg">
            <LayoutGrid size={20} />
          </div>
          <div>
            <h1 className="font-semibold text-lg leading-tight">Workspace</h1>
            <p className="text-xs text-neutral-500">Run multiple apps together</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          <span>Add App</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col">
        {apps.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
            <LayoutGrid size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium text-neutral-500">No apps in your workspace</p>
            <p className="text-sm mt-1">Click "Add App" to get started.</p>
          </div>
        ) : (
          <div className={`grid gap-4 md:gap-6 flex-1 h-full ${maximizedId ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'}`}>
            <AnimatePresence mode="popLayout">
              {apps.map((app) => {
                if (maximizedId && maximizedId !== app.id) return null;
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={app.id}
                    className="flex flex-col bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden h-[500px] md:h-auto"
                  >
                    {/* App Header */}
                    <div className="flex items-center justify-between px-4 py-2 bg-neutral-50 border-b border-neutral-200 group">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <h2 className="text-sm font-medium truncate" title={app.title}>
                          {app.title}
                        </h2>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-md transition-colors"
                          title="Open in new tab"
                        >
                          <ExternalLink size={14} />
                        </a>
                        <button
                          onClick={() => toggleMaximize(app.id)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-md transition-colors"
                          title={maximizedId === app.id ? "Restore" : "Maximize"}
                        >
                          {maximizedId === app.id ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        </button>
                        <button
                          onClick={() => removeApp(app.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Remove app"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    {/* App Iframe */}
                    <div className="flex-1 relative bg-neutral-100">
                      <iframe
                        src={app.url}
                        className="absolute inset-0 w-full h-full border-none"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        title={app.title}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Add App Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Add Web App</h3>
                <button
                  onClick={() => setIsAdding(false)}
                  className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddApp} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="url" className="block text-sm font-medium text-neutral-700 mb-1">
                      Website URL
                    </label>
                    <input
                      id="url"
                      type="text"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="e.g., https://excalidraw.com"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      autoFocus
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
                      Title (Optional)
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g., Whiteboard"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3 text-amber-800 text-sm">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>
                    Some websites (like Google or GitHub) block being embedded in other sites for security reasons. If a site doesn't load, it may not support embedding.
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newUrl}
                    className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add to Workspace
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
