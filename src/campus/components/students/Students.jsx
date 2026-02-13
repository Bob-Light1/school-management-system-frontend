import React from 'react';
import GenericEntityPage from '../../../components/shared/GenericEntityPage';
import StudentForm from './StudentForm';
import StudentDetailDrawer from './StudentDetailDrawer';
import { studentConfig } from './config';


const Students = () => {
  return (
    <GenericEntityPage
      // basic configurations from config.jsx
      entityName={studentConfig.entityName}
      entityNamePlural={studentConfig.entityNamePlural}
      apiEndpoint={studentConfig.apiEndpoint}
      
      // Table configuration
      tableColumns={studentConfig.tableColumns}
      renderTableRow={studentConfig.renderTableRow}
      
      // Filters & Search
      filterConfig={studentConfig.getFilterConfig}
      searchPlaceholder={studentConfig.searchPlaceholder}
      
      // KPIs
      getKPIMetrics={studentConfig.getKPIMetrics}
      
      // Bulk actions disponibles
      bulkActions={studentConfig.bulkActions}
      
      // Bouton d'ajout personnalisé
      addButtonText={studentConfig.addButtonText}
      addButtonIcon={studentConfig.addButtonIcon}
      
      // Composants UI (REQUIS)
      FormComponent={StudentForm}              
      DetailComponent={StudentDetailDrawer}  
      
      enableImport={true}   // Activate inport
      enableExport={true}   // Activate export
    />
  );
};

export default Students;