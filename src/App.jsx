import React, { useState, useEffect } from 'react';
import DiagramCanvas from './components/DiagramCanvas';
import SidebarEditor from './components/SidebarEditor';
import { exportSchema } from './data/schema-export';
import { useTheme } from './hooks/useTheme';

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [isInactive, setIsInactive] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
    setSelectedNodeId(node ? node.id : null);
  };

  const handleEdgeSelect = (edge) => {
    setSelectedEdge(edge);
    setSelectedEdgeId(edge ? edge.id : null);
  };

  const handleClearSelection = () => {
    handleNodeSelect(null);
    handleEdgeSelect(null);
  };

  // Add keyboard support for closing the sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Close sidebar on Enter or Escape key when a node is selected
      if ((e.key === 'Enter' || e.key === 'Escape') && (selectedNode || selectedEdge)) {
        // Prevent default behavior (like form submission)
        e.preventDefault();
        // Deselect node (this will also close the sidebar)
        handleClearSelection();
      }
    };

    // Add event listener when component mounts
    window.addEventListener('keydown', handleKeyDown);

    // Remove event listener when component unmounts
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, selectedEdge]);

  const handleExport = () => {
    const schema = exportSchema(nodes, edges);
    
    // Create a blob with the JSON data
    const jsonString = JSON.stringify(schema, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `ontology-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show success message
      document.getElementById('successModal').classList.remove('hidden');
    }, 100);
  };

  const closeModal = () => {
    document.getElementById('jsonModal').classList.add('hidden');
    document.getElementById('successModal').classList.add('hidden');
  };

  const handleAddNode = () => {
    const newNode = {
      id: `entity-${Date.now()}`,
      elementType: 'nodeß',
      type: 'entityNode',
      position: { x: 250, y: 100 },
      data: {
        label: 'New Node',
        uri: '',
        description: {
          'pt-br': '',
          'en': ''
        },
        properties: []
      }
    };
    setNodes([...nodes, newNode]);
  };

  const selectedElement = selectedNode || selectedEdge;

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white">
      {/* Left sidebar */}
      <div className="w-64 border-r border-gray-300 dark:border-gray-700 p-4 flex flex-col relative">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">OntoMaker</h2>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
          <button
            className="w-full bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-black dark:text-white font-bold py-2 px-4 rounded mb-4"
            onClick={handleAddNode}
          >
            + Node
          </button>

          <button
            className="w-full bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
            onClick={handleExport}
          >
            Export JSON-LD
          </button>
        </div>
        
        {/* Footer links fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-sm">
          <div className="mb-2">
            <span className="text-gray-600 dark:text-gray-400">Crafted with ☕ by </span>
            <a 
              href="https://www.linkedin.com/in/elias-magalh%C3%A3es/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Elias Magalhães
            </a>
          </div>
          <div>
            <a 
              href="https://github.com/EliasMPJunior" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Source ↗
            </a>
          </div>
        </div>
      </div>

      {/* Main canvas with overlay sidebar */}
      <div className="relative flex-1 overflow-hidden">
        {/* Fixed-width container for the diagram canvas */}
        <div className="absolute inset-0">
          <DiagramCanvas
            nodes={nodes}
            setNodes={setNodes}
            edges={edges}
            setEdges={setEdges}
            selectedNode={selectedNode}
            setSelectedNode={handleNodeSelect}
            selectedNodeId={selectedNodeId}
            selectedEdge={selectedEdge}
            setSelectedEdge={handleEdgeSelect}
            selectedEdgeId={selectedEdgeId}
            theme={theme}
          />
        </div>

        {/* Update sidebar visibility condition */}
        <div className={`
          fixed top-0 right-0 h-full w-[350px] 
          transition-transform duration-300 ease-in-out z-50
          bg-white dark:bg-gray-900 shadow-lg border-l border-gray-300 dark:border-gray-700
          ${selectedNode || selectedEdge ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="p-4 h-full">
            <SidebarEditor
              selectedElement={selectedElement}
              updateElement={(updateElement) => {
                setNodes(nodes.map(element =>
                  element.id === updateElement.id ? updateElement : element
                ));
                setEdges(edges.map(element =>
                  element.id === updateElement.id ? updateElement : element
                ));
              }}
            />
          </div>
        </div>
      </div>

      {/* Modal for displaying exported JSON */}
      <div id="jsonModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-[100]">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-3/4 max-h-3/4 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Exported Schema</h3>
            <button onClick={closeModal} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <pre id="jsonOutput" className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-sm"></pre>
          <button
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              const jsonText = document.getElementById('jsonOutput').textContent;
              navigator.clipboard.writeText(jsonText);
              alert('JSON copied to clipboard!');
            }}
          >
            Copy to Clipboard
          </button>
        </div>
      </div>

      {/* Success Modal */}
      <div id="successModal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-[100]">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Export Successful</h3>
            <button onClick={closeModal} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div className="text-center mb-4">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <p className="text-lg">Your ontology has been exported successfully!</p>
          </div>
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={closeModal}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

