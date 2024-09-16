import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber } from 'primereact/inputnumber';
import { fetchArtworks } from '../services/apiService';
import { Artwork } from '../types';  // Use this interface for data typing

const DataTableComponent: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtworks, setSelectedArtworks] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [first, setFirst] = useState(0);
  const [rowsToSelect, setRowsToSelect] = useState(1);
  const rows = 10;
  const op = useRef<OverlayPanel>(null); // OverlayPanel reference

  useEffect(() => {
    loadArtworks(1); // Load first page initially
  }, []);

  // Fetch artworks for the given page
  const loadArtworks = async (page: number) => {
    setLoading(true);
    const data = await fetchArtworks(page);
    if (data) {
      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
    }
    setLoading(false);
  };

  // Handle page changes
  const onPageChange = (event: any) => {
    setFirst(event.first);
    const page = event.page + 1;
    loadArtworks(page); // Load artworks for the selected page
  };

  // Handle row selection
  const onRowSelect = (rowData: Artwork) => {
    setSelectedArtworks((prevState: any) => ({
      ...prevState,
      [rowData.id]: !prevState[rowData.id],
    }));
  };

  // Determine if a row is selected
  const isSelected = (rowData: Artwork) => !!selectedArtworks[rowData.id];

  // Handle selecting multiple rows based on user input, including multiple pages
  const selectMultipleRows = async () => {
    let page = 1;
    let rowsSelected = 0;
    let newSelections = { ...selectedArtworks };

    while (rowsSelected < rowsToSelect && page <= Math.ceil(totalRecords / rows)) {
      const data = await fetchArtworks(page);
      const availableRows = data.data;

      // Select rows on the current page
      for (let i = 0; i < availableRows.length && rowsSelected < rowsToSelect; i++) {
        const row = availableRows[i];
        if (!newSelections[row.id]) {
          newSelections[row.id] = true;
          rowsSelected++;
        }
      }

      page++;
    }

    setSelectedArtworks(newSelections);
    op.current?.hide(); // Close the OverlayPanel after submission
  };

  // Template for row selection checkbox
  const selectionTemplate = (rowData: Artwork) => {
    return (
      <Checkbox checked={isSelected(rowData)} onChange={() => onRowSelect(rowData)} />
    );
  };

  // Header template with chevron icon
  const chevronHeaderTemplate = () => {
    return (
      <div className="flex align-items-center">
        <span>Select</span>
        <i
          className="pi pi-chevron-down ml-2"
          style={{ cursor: 'pointer' }}
          onClick={(e) => op.current?.toggle(e)}
        ></i>
      </div>
    );
  };

  return (
    <div className="datatable-container">
      {/* DataTable with checkbox and custom header */}
      <DataTable value={artworks} loading={loading} dataKey="id">
        <Column header={chevronHeaderTemplate()} body={selectionTemplate} style={{ width: '3rem' }} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Date Start" />
        <Column field="date_end" header="Date End" />
      </DataTable>

      {/* Paginator */}
      <Paginator first={first} rows={rows} totalRecords={totalRecords} onPageChange={onPageChange} />

      {/* OverlayPanel for custom row selection */}
      <OverlayPanel ref={op}>
        <div>
          <h4>Select Rows</h4>
          <InputNumber
            value={rowsToSelect}
            onValueChange={(e) => setRowsToSelect(e.value || 1)}
            min={1}
            max={totalRecords}
          />
          <Button label="Select Rows" onClick={selectMultipleRows} />
        </div>
      </OverlayPanel>
    </div>
  );
};

export default DataTableComponent;
