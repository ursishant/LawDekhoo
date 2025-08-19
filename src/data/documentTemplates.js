// This file contains the data for all the pre-defined document templates.

export const documentTemplates = {
  // --- Agreements & Contracts ---
  rentalAgreement: {
    title: 'Rental Agreement',
    description: 'Create a lease for a residential property.',
    icon: 'fa-house-user',
    fields: [
      { id: 'landlordName', label: 'Landlord Name' },
      { id: 'tenantName', label: 'Tenant Name' },
      { id: 'propertyAddress', label: 'Rental Property Address' },
      { id: 'rentAmount', label: 'Monthly Rent Amount (INR)' },
      { id: 'securityDeposit', label: 'Security Deposit Amount (INR)' },
      { id: 'leaseStartDate', label: 'Lease Start Date', type: 'date' },
      { id: 'leaseEndDate', label: 'Lease End Date', type: 'date' },
    ],
    template: `RENTAL AGREEMENT\n\nThis agreement is made on {leaseStartDate} between {landlordName} (Landlord) and {tenantName} (Tenant).\n\nThe Landlord agrees to rent to the Tenant the property at {propertyAddress} for a monthly rent of INR {rentAmount}.\n\nA security deposit of INR {securityDeposit} is to be paid by the Tenant.\n\nThe lease term is from {leaseStartDate} to {leaseEndDate}.\n\nSigned,\nLandlord: __________\nTenant: __________`
  },
  partnershipAgreement: {
    title: 'Partnership Agreement',
    description: 'Define terms for a business partnership.',
    icon: 'fa-handshake',
    fields: [
        { id: 'partner1Name', label: 'Partner 1 Full Name' },
        { id: 'partner2Name', label: 'Partner 2 Full Name' },
        { id: 'partnershipName', label: 'Name of the Partnership' },
        { id: 'businessPurpose', label: 'Purpose of the Business', type: 'textarea' },
        { id: 'capitalContribution1', label: 'Partner 1 Capital Contribution (INR)' },
        { id: 'capitalContribution2', label: 'Partner 2 Capital Contribution (INR)' },
    ],
    template: `PARTNERSHIP AGREEMENT\n\nThis agreement is made between {partner1Name} and {partner2Name}.\n\nThe parties agree to form a partnership under the name {partnershipName} for the purpose of: {businessPurpose}.\n\nCapital contributions are as follows:\n- {partner1Name}: INR {capitalContribution1}\n- {partner2Name}: INR {capitalContribution2}\n\nAll profits and losses will be shared equally.`
  },
  employmentAgreement: {
    title: 'Employment Agreement',
    description: 'Formalize an employment offer.',
    icon: 'fa-briefcase',
    fields: [
        { id: 'companyName', label: 'Company Name' },
        { id: 'employeeName', label: 'Employee Name' },
        { id: 'jobTitle', label: 'Job Title' },
        { id: 'startDate', label: 'Start Date', type: 'date' },
        { id: 'salary', label: 'Annual Salary (INR)' },
    ],
    template: `EMPLOYMENT AGREEMENT\n\nThis agreement is between {companyName} ("Employer") and {employeeName} ("Employee").\n\nThe Employer agrees to employ the Employee in the capacity of {jobTitle}, starting from {startDate}.\n\nThe annual salary for this position will be INR {salary}.\n\nThis agreement is subject to the company's policies and procedures.`
  },
  nda: {
    title: 'Non-Disclosure Agreement',
    description: 'Protect confidential information.',
    icon: 'fa-file-shield',
    fields: [
        { id: 'disclosingParty', label: 'Disclosing Party Name' },
        { id: 'receivingParty', label: 'Receiving Party Name' },
        { id: 'effectiveDate', label: 'Effective Date', type: 'date' },
        { id: 'confidentialInfo', label: 'Description of Confidential Information', type: 'textarea' },
    ],
    template: `NON-DISCLOSURE AGREEMENT\n\nThis NDA is between {disclosingParty} and {receivingParty}, effective {effectiveDate}.\n\nThe Receiving Party agrees not to disclose the following information: {confidentialInfo}.\n\nThis agreement is binding for a period of 5 years from the effective date.`
  },

  // --- Affidavits & Declarations ---
  nameChangeAffidavit: {
    title: 'Name Change Affidavit',
    description: 'Formal declaration for changing your name.',
    icon: 'fa-id-card',
    fields: [
        { id: 'oldName', label: 'Old Name' },
        { id: 'newName', label: 'New Name' },
        { id: 'address', label: 'Full Address' },
        { id: 'date', label: 'Date', type: 'date' },
    ],
    template: `AFFIDAVIT FOR NAME CHANGE\n\nI, {oldName}, residing at {address}, do solemnly affirm that I have changed my name to {newName} on {date}.\n\nAll documents bearing my old name remain valid. I will be known as {newName} for all future purposes.`
  },
  addressProofAffidavit: {
    title: 'Address Proof Affidavit',
    description: 'Declare your current residential address.',
    icon: 'fa-map-marker-alt',
    fields: [
        { id: 'personName', label: 'Full Name' },
        { id: 'currentAddress', label: 'Current Full Address' },
        { id: 'date', label: 'Date', type: 'date' },
    ],
    template: `ADDRESS PROOF AFFIDAVIT\n\nI, {personName}, do hereby solemnly affirm and declare that I am currently residing at the following address: {currentAddress}.\n\nI declare that the information provided is true and correct to the best of my knowledge.\n\nDate: {date}`
  },

  // --- Personal Legal Documents ---
  powerOfAttorney: {
    title: 'Power of Attorney',
    description: 'Authorize someone to act on your behalf.',
    icon: 'fa-user-pen',
    fields: [
        { id: 'principalName', label: 'Your Name (Principal)' },
        { id: 'agentName', label: "Agent's Name" },
        { id: 'agentAddress', label: "Agent's Address" },
        { id: 'powersGranted', label: 'Specific Powers Granted', type: 'textarea' },
        { id: 'effectiveDate', label: 'Effective Date', type: 'date' },
    ],
    template: `POWER OF ATTORNEY\n\nI, {principalName}, hereby appoint {agentName} of {agentAddress} as my attorney-in-fact.\n\nI grant my agent the power to: {powersGranted}.\n\nThis power of attorney is effective from {effectiveDate}.\n\nSigned,\n{principalName}`
  },
  will: {
    title: 'Last Will & Testament',
    description: 'Specify the distribution of your assets.',
    icon: 'fa-scroll',
    fields: [
        { id: 'testatorName', label: 'Your Name (Testator)' },
        { id: 'executorName', label: 'Executor Name' },
        { id: 'beneficiaryDetails', label: 'Beneficiaries and Asset Distribution', type: 'textarea' },
    ],
    template: `LAST WILL AND TESTAMENT\n\nI, {testatorName}, declare this to be my last will.\n\nI appoint {executorName} as the executor of this will.\n\nI give my assets as follows: {beneficiaryDetails}.\n\nSigned,\n{testatorName}`
  },
};
