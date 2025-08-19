// Centralised blog posts array with richer data.
const blogPosts = [
  {
    id: 1,
    title: 'Understanding Your Rights as a Tenant in India',
    authorId: 101, // Added for linking to author page
    author: 'LegalBridge Team',
    date: '15 July 2025',
    readTime: '5 min read', // Added for display
    summary: 'Learn about the key provisions of the Rent Control Act and how you can protect your rights as a tenant when dealing with landlords and security deposits.',
    content: `Renting a home in India comes with both rights and responsibilities. The Rent Control Act, enacted to protect tenants from exploitation, outlines specific provisions regarding rent increases, eviction, and security deposits. In this article we explore what constitutes a legal eviction, how to handle a landlord who refuses to return your security deposit, and the steps to take if you receive an illegal rent hike notice.\n\nThe act requires landlords to provide proper notice before asking tenants to vacate and prohibits arbitrary rent hikes. Tenants are entitled to seek legal recourse if their landlord violates these provisions. Always ensure that you have a written rent agreement and keep records of rent payments. If a dispute arises, approach the local rent controller or consider sending a legal notice through a lawyer or legal aid clinic.`,
    image: 'https://placehold.co/600x400/E5E7EB/4F46E5?text=Housing+Law', // Added placeholder image
  },
  {
    id: 2,
    title: 'Filing an RTI: A Step‑by‑Step Guide',
    authorId: 101,
    author: 'LegalBridge Team',
    date: '5 June 2025',
    readTime: '4 min read',
    summary: 'The Right to Information Act empowers Indian citizens to request information from public authorities. This guide walks you through filing an RTI application effectively.',
    content: `The Right to Information (RTI) Act, 2005 is a powerful tool for citizens to hold the government accountable. To file an RTI, identify the public authority from which you seek information. Draft your application clearly stating the information requested, along with your name and contact details.\n\nSubmit the application to the Public Information Officer (PIO) of the concerned department, either in person, by post, or electronically if permitted. Pay the prescribed fee, which is usually Rs.10 for central government departments. The PIO must provide the requested information within 30 days. If you do not receive a response or are dissatisfied, you can file an appeal to the appellate authority.`,
    image: 'https://placehold.co/600x400/E0F2FE/0891B2?text=RTI+Guide',
  },
  {
    id: 3,
    title: 'Navigating Legal Aid in India: What You Need to Know',
    authorId: 101,
    author: 'LegalBridge Team',
    date: '20 May 2025',
    readTime: '6 min read',
    summary: 'Legal aid services are available to ensure that justice is not denied to anyone due to financial constraints. This article explains how to access free legal assistance.',
    content: `India’s legal aid system is designed to provide free legal services to those who cannot afford a lawyer. Each state has a Legal Services Authority that offers assistance through legal aid clinics, Lok Adalats, and mediation services.\n\nTo apply for legal aid, approach the nearest legal services authority or submit an application online (if available). Provide details about your income and the nature of the legal problem. Once your application is accepted, a lawyer will be assigned to your case. Remember that legal aid is your right under Article 39A of the Constitution, and you should not hesitate to seek help if you need it.`,
    image: 'https://placehold.co/600x400/F3E8FF/8B5CF6?text=Legal+Aid',
  },
];

// New authors object to store author details, exported separately
export const authors = {
  101: {
    name: 'LegalBridge Team',
    bio: 'The official account for the LegalBridge India team, providing insights and guides on various legal topics to empower citizens.',
    avatar: 'https://placehold.co/100x100/E5E7EB/4F46E5?text=LB',
  },
};

export default blogPosts;
