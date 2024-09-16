import React from 'react';
import DataTableComponent from './components/DataTableComponent';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './index.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Paginated Data Table</h1>
      <DataTableComponent />
    </div>
  );
};

export default App;
