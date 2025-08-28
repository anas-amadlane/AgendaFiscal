const fiscalObligationService = require('./src/services/fiscalObligationService');

async function testObligationFix() {
  console.log('🧪 Testing Obligation Generation Fix...\n');
  
  try {
    // Test the calculateDueDateDynamic function directly
    console.log('📅 Testing calculateDueDateDynamic function:');
    
    const testEntry = {
      mois: '12',
      jours: '15',
      frequence_declaration: 'Mensuel'
    };
    
    const currentDate = new Date(2024, 0, 1); // January 1, 2024
    console.log(`Test entry: ${testEntry.frequence_declaration} - Month: ${testEntry.mois}, Day: ${testEntry.jours}`);
    console.log(`Current date: ${currentDate.toISOString()}`);
    
    const dueDate = fiscalObligationService.calculateDueDateDynamic(testEntry, currentDate);
    console.log(`Calculated due date: ${dueDate?.toISOString()}`);
    
    // Test quarterly
    const quarterlyEntry = {
      mois: '3',
      jours: '31',
      frequence_declaration: 'Trimestriel'
    };
    
    const quarterlyDueDate = fiscalObligationService.calculateDueDateDynamic(quarterlyEntry, currentDate);
    console.log(`Quarterly due date: ${quarterlyDueDate?.toISOString()}`);
    
    // Test annual
    const annualEntry = {
      mois: '6',
      jours: '30',
      frequence_declaration: 'Annuel'
    };
    
    const annualDueDate = fiscalObligationService.calculateDueDateDynamic(annualEntry, currentDate);
    console.log(`Annual due date: ${annualDueDate?.toISOString()}`);
    
    console.log('\n✅ Date calculation tests completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testObligationFix();
