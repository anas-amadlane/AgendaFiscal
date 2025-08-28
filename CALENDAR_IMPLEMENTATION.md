# Calendar Implementation - Automatic Obligation Generation

## 🎯 **Overview**

The calendar now automatically generates fiscal obligations for each company based on:
1. **Company characteristics** (categorie_personnes, TVA settings, etc.)
2. **Admin's fiscal calendar** (imported fiscal calendar entries)
3. **Date range** (from company creation to current date + 12 months)

## 🔧 **How It Works**

### **1. Automatic Generation Trigger**
- When a user accesses the calendar tab
- If no obligations exist for their companies
- System automatically generates obligations from fiscal calendar

### **2. Filtering Logic**

#### **By Company Category**
- Filters fiscal calendar entries by `categorie_personnes`
- **Personne Morale** vs **Personne Physique**

#### **TVA Special Handling**
- **If `is_tva_assujetti = true`:**
  - Shows TVA entries matching company's `regime_tva` (Mensuel/Trimestriel)
  - If `prorata_deduction = true`: Also shows annual TVA entries
- **If `is_tva_assujetti = false`:**
  - Excludes all TVA entries

#### **Date Range**
- **Start**: Company creation date
- **End**: Current date + 12 months

### **3. Obligation Generation**

#### **Frequency-Based Generation**
- **Mensuel**: Monthly obligations
- **Trimestriel**: Quarterly obligations  
- **Annuel**: Annual obligations

#### **Due Date Calculation**
- Uses `mois` and `jours` from fiscal calendar
- Adjusts for frequency (monthly, quarterly, annual)
- Calculates proper due dates for each period

#### **Priority Assignment**
- **Urgent**: Overdue obligations
- **High**: Due within 7 days
- **Medium**: Due within 30 days
- **Low**: Due beyond 30 days

## 📊 **Database Structure**

### **Fiscal Calendar Table**
```sql
CREATE TABLE fiscal_calendar (
    id SERIAL PRIMARY KEY,
    categorie_personnes VARCHAR(100) NOT NULL,
    sous_categorie VARCHAR(100),
    type VARCHAR(50) NOT NULL,
    tag VARCHAR(50) NOT NULL,
    frequence_declaration VARCHAR(50) NOT NULL,
    periode_declaration VARCHAR(200),
    mois VARCHAR(10),
    jours INTEGER,
    detail_declaration TEXT,
    formulaire VARCHAR(100),
    lien VARCHAR(500),
    commentaire TEXT
);
```

### **Companies Table**
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    categorie_personnes VARCHAR(100),
    sous_categorie VARCHAR(100),
    is_tva_assujetti BOOLEAN DEFAULT false,
    regime_tva VARCHAR(50),
    prorata_deduction BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Fiscal Obligations Table**
```sql
CREATE TABLE fiscal_obligations (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    obligation_type VARCHAR(50) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    obligation_details JSONB,
    last_edited TIMESTAMP,
    edited_by UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id)
);
```

## 🚀 **API Endpoints**

### **Automatic Generation**
- **GET `/api/v1/obligations`**: Fetches obligations, generates if none exist
- **POST `/api/v1/fiscal/obligations/generate/company/:companyId`**: Manual generation for specific company
- **POST `/api/v1/fiscal/obligations/generate/user`**: Manual generation for all user companies

### **Fiscal Calendar Management**
- **GET `/api/v1/fiscal/calendar`**: Get fiscal calendar entries
- **POST `/api/v1/fiscal/calendar`**: Add fiscal calendar entry (Admin only)
- **PUT `/api/v1/fiscal/calendar/:id`**: Update fiscal calendar entry (Admin only)
- **DELETE `/api/v1/fiscal/calendar/:id`**: Delete fiscal calendar entry (Admin only)

## 📋 **Sample Data**

### **Fiscal Calendar Entries**
```javascript
// TVA - Mensuel
{
  categorie_personnes: 'Personne Morale',
  tag: 'TVA',
  frequence_declaration: 'Mensuel',
  mois: '20',
  jours: 20,
  detail_declaration: 'Déclaration mensuelle de TVA'
}

// IS - Trimestriel  
{
  categorie_personnes: 'Personne Morale',
  tag: 'IS',
  frequence_declaration: 'Trimestriel',
  mois: '31',
  jours: 31,
  detail_declaration: 'Acompte d\'impôt sur les sociétés'
}

// TVA - Annuel (for prorata)
{
  categorie_personnes: 'Personne Morale',
  tag: 'TVA',
  frequence_declaration: 'Annuel',
  mois: '03',
  jours: 31,
  detail_declaration: 'Déclaration annuelle de TVA'
}
```

### **Generated Obligations**
```javascript
{
  company_id: "company-uuid",
  title: "TVA - Déclaration mensuelle de TVA Mars 2024",
  description: "Déclaration mensuelle de TVA",
  obligation_type: "TVA",
  due_date: "2024-03-20",
  status: "pending",
  priority: "medium",
  obligation_details: {
    calendar_entry_id: 1,
    categorie_personnes: "Personne Morale",
    type: "Fiscal",
    frequence_declaration: "Mensuel",
    formulaire: "TVA-CAD",
    generated_from_calendar: true
  }
}
```

## 🎨 **User Experience**

### **For Regular Users**
1. **Access Calendar Tab**: Automatically generates obligations if none exist
2. **View Obligations**: Organized by company, filtered by date range
3. **Edit Status**: Update obligation status (pending, completed, overdue, cancelled)
4. **Filter & Sort**: By company, status, date, type

### **For Admins**
1. **Manage Fiscal Calendar**: Add/edit/delete fiscal calendar entries
2. **Import Calendar**: Bulk import fiscal calendar data
3. **Generate Obligations**: Manual generation for testing
4. **View All**: Access to all companies and obligations

## 🔄 **Generation Process**

### **Step 1: Company Analysis**
```javascript
// Get company characteristics
const company = await getCompany(companyId);
// - categorie_personnes
// - is_tva_assujetti
// - regime_tva
// - prorata_deduction
// - created_at
```

### **Step 2: Calendar Filtering**
```javascript
// Filter fiscal calendar entries
const entries = await getRelevantCalendarEntries(company);
// - Match categorie_personnes
// - Handle TVA based on company settings
// - Exclude sous_categorie filtering
```

### **Step 3: Obligation Generation**
```javascript
// Generate obligations for each entry
for (const entry of entries) {
  const obligations = generateObligationsFromEntry(entry, company, startDate, endDate);
  // - Calculate due dates
  // - Generate titles
  // - Assign priorities
  // - Set obligation details
}
```

### **Step 4: Database Storage**
```javascript
// Save generated obligations
await saveObligations(obligations);
// - Bulk insert for performance
// - Track generation metadata
```

## 🎯 **Key Features**

### **✅ Automatic Generation**
- No manual intervention required
- Generates on first access
- Based on company characteristics

### **✅ Smart Filtering**
- TVA frequency based on company regime
- Annual TVA for prorata companies
- Category-based filtering

### **✅ Date Range Management**
- From company creation
- To current date + 12 months
- Proper period calculation

### **✅ Priority Assignment**
- Automatic priority based on due date
- Urgent for overdue items
- High/Medium/Low for upcoming

### **✅ Metadata Tracking**
- Links to source calendar entry
- Generation timestamp
- User who triggered generation

## 🚀 **Benefits**

1. **No Manual Work**: Obligations automatically generated
2. **Accurate**: Based on official fiscal calendar
3. **Company-Specific**: Tailored to each company's characteristics
4. **Up-to-Date**: Always current with latest fiscal calendar
5. **Scalable**: Works for any number of companies
6. **Flexible**: Easy to modify generation rules

## 🔧 **Configuration**

### **Fiscal Calendar Management**
- Admin can add/edit/delete calendar entries
- Support for all fiscal declaration types
- Flexible frequency and date settings

### **Company Settings**
- TVA assujetti status
- Regime TVA (Mensuel/Trimestriel)
- Prorata deduction flag
- Category and sub-category

### **Generation Rules**
- Date range calculation
- Priority assignment logic
- Title generation patterns
- Obligation details structure

This implementation ensures that every company gets the appropriate fiscal obligations based on their specific characteristics and the official fiscal calendar, with no manual intervention required.

