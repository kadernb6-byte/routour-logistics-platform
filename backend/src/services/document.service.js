// ============================================
// Document Service (Supabase)
// ============================================
// Business logic for document upload, retrieval, and admin review.

const { supabase } = require('../config/db');

/**
 * Upload a verification document
 */
const uploadDocument = async (userId, companyId, file, documentType) => {
    const { data, error } = await supabase
        .from('documents')
        .insert({
            company_id: companyId,
            uploaded_by: userId,
            document_type: documentType,
            file_name: file.originalname,
            file_path: file.path,
            file_size: file.size,
            mime_type: file.mimetype,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    // Update company verification status to 'pending' if it was 'unverified'
    await supabase
        .from('companies')
        .update({ verification_status: 'pending' })
        .eq('id', companyId)
        .in('verification_status', ['unverified']);

    return data;
};

/**
 * Get all documents for a company
 */
const getCompanyDocuments = async (companyId) => {
    const { data, error } = await supabase
        .from('documents')
        .select('*, users!uploaded_by(email)')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (data || []).map(d => ({
        ...d,
        uploaded_by_email: d.users?.email || '',
        users: undefined,
    }));
};

/**
 * Get company verification status with document summary
 */
const getVerificationStatus = async (companyId) => {
    const { data: company, error: compError } = await supabase
        .from('companies')
        .select('id, name, type, verified, verification_status, verified_at')
        .eq('id', companyId)
        .single();

    if (compError || !company) {
        const error = new Error('Company not found');
        error.statusCode = 404;
        throw error;
    }

    const { data: documents, error: docError } = await supabase
        .from('documents')
        .select('id, document_type, file_name, status, review_note, created_at')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

    if (docError) throw new Error(docError.message);

    const requiredDocs = ['registre_commerce', 'nif'];
    const uploadedTypes = (documents || []).map(d => d.document_type);
    const missingDocs = requiredDocs.filter(t => !uploadedTypes.includes(t));

    return {
        company,
        documents: documents || [],
        requiredDocuments: requiredDocs,
        missingDocuments: missingDocs,
        isComplete: missingDocs.length === 0,
    };
};

/**
 * Admin: Get all pending verifications
 */
const getPendingVerifications = async () => {
    // Get companies with pending verification
    const { data: companies, error: compError } = await supabase
        .from('companies')
        .select('id, name, type, verification_status, created_at')
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: true });

    if (compError) throw new Error(compError.message);

    // For each company, get document counts
    const results = await Promise.all(
        (companies || []).map(async (c) => {
            const { data: docs } = await supabase
                .from('documents')
                .select('id, status')
                .eq('company_id', c.id);

            return {
                ...c,
                document_count: (docs || []).length,
                pending_docs: (docs || []).filter(d => d.status === 'pending').length,
            };
        })
    );

    return results;
};

/**
 * Admin: Review a document (approve/reject)
 */
const reviewDocument = async (documentId, adminId, status, reviewNote) => {
    const { data, error } = await supabase
        .from('documents')
        .update({
            status,
            review_note: reviewNote || null,
            reviewed_by: adminId,
            reviewed_at: new Date().toISOString(),
        })
        .eq('id', documentId)
        .select()
        .single();

    if (error || !data) {
        const err = new Error('Document not found');
        err.statusCode = 404;
        throw err;
    }

    return data;
};

/**
 * Admin: Verify a company
 */
const verifyCompany = async (companyId, adminId) => {
    // Approve all pending documents
    await supabase
        .from('documents')
        .update({
            status: 'approved',
            reviewed_by: adminId,
            reviewed_at: new Date().toISOString(),
        })
        .eq('company_id', companyId)
        .eq('status', 'pending');

    // Update company status
    const { data, error } = await supabase
        .from('companies')
        .update({
            verified: true,
            verification_status: 'verified',
            verified_at: new Date().toISOString(),
        })
        .eq('id', companyId)
        .select('id, name, type, verified, verification_status')
        .single();

    if (error || !data) {
        const err = new Error('Company not found');
        err.statusCode = 404;
        throw err;
    }

    return data;
};

/**
 * Admin: Reject a company verification
 */
const rejectCompany = async (companyId, adminId, reason) => {
    // Reject all pending documents
    await supabase
        .from('documents')
        .update({
            status: 'rejected',
            review_note: reason,
            reviewed_by: adminId,
            reviewed_at: new Date().toISOString(),
        })
        .eq('company_id', companyId)
        .eq('status', 'pending');

    const { data, error } = await supabase
        .from('companies')
        .update({ verification_status: 'rejected' })
        .eq('id', companyId)
        .select('id, name, type, verification_status')
        .single();

    if (error) throw new Error(error.message);
    return data;
};

module.exports = {
    uploadDocument,
    getCompanyDocuments,
    getVerificationStatus,
    getPendingVerifications,
    reviewDocument,
    verifyCompany,
    rejectCompany,
};
