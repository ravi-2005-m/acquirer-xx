import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { merchantApi } from '../../api/merchantApi';
import { merchantCreateSchema } from '../../schemas/merchantSchemas';
import ErrorAlert from '../../components/ErrorAlert';
import FormInput from '../../components/form/FormInput';
import FormSelect from '../../components/form/FormSelect';
import FormTextarea from '../../components/form/FormTextarea';

const RISK_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

function MerchantForm() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(merchantCreateSchema),
    defaultValues: {
      legalName: '',
      doingBusinessAs: '',
      mcc: '',
      contactInfo: '',
      riskLevel: 'LOW',
    },
  });

  const onSubmit = async (data) => {
    setSubmitError(null);
    try {
      const payload = {
        legalName: data.legalName,
        contactInfo: data.contactInfo,
        ...(data.doingBusinessAs && { doingBusinessAs: data.doingBusinessAs }),
        ...(data.mcc && { mcc: data.mcc }),
        riskLevel: data.riskLevel,
      };

      const response = await merchantApi.create(payload);
      const newId = response.data?.data?.merchantId;
      navigate(newId ? `/merchants/${newId}` : '/merchants');
    } catch (err) {
      const backendFieldErrors = err.response?.data?.fieldErrors;
      if (backendFieldErrors) {
        Object.entries(backendFieldErrors).forEach(([field, message]) => {
          setError(field, { message });
        });
      } else {
        setSubmitError(err);
      }
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex align-items-center mb-3">
        <Link to="/merchants" className="btn btn-link text-muted text-decoration-none p-0 me-2">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <h3 className="mb-0">
          <i className="bi bi-people me-2"></i>
          Add New Merchant
        </h3>
      </div>

      {submitError && (
        <ErrorAlert
          error={submitError}
          title="Failed to create merchant"
          dismissible
          onDismiss={() => setSubmitError(null)}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title text-muted text-uppercase fw-semibold small mb-3">
              Business Identity
            </h6>

            <FormInput
              id="legalName"
              label="Legal Name"
              required
              disabled={isSubmitting}
              maxLength={150}
              placeholder="Acme Corporation Pvt Ltd"
              hint="The official registered name of the business"
              error={errors.legalName?.message}
              {...register('legalName')}
            />

            <div className="row">
              <div className="col-md-7">
                <FormInput
                  id="doingBusinessAs"
                  label="Doing Business As (DBA)"
                  disabled={isSubmitting}
                  maxLength={150}
                  placeholder="Acme Corp"
                  hint="Optional trading name if different from legal name"
                  error={errors.doingBusinessAs?.message}
                  {...register('doingBusinessAs')}
                />
              </div>
              <div className="col-md-5">
                <FormInput
                  id="mcc"
                  label="MCC"
                  disabled={isSubmitting}
                  maxLength={4}
                  placeholder="5411"
                  hint="Merchant Category Code (4 digits, e.g. 5411 = Grocery)"
                  error={errors.mcc?.message}
                  {...register('mcc')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title text-muted text-uppercase fw-semibold small mb-3">
              Contact Information
            </h6>

            <FormTextarea
              id="contactInfo"
              label="Contact Info"
              required
              disabled={isSubmitting}
              rows={3}
              maxLength={500}
              placeholder={'Email: contact@acme.com\nPhone: +91 9876543210\nAddress: Bangalore, India'}
              hint="Email, phone, and address — free-form text"
              error={errors.contactInfo?.message}
              {...register('contactInfo')}
            />
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title text-muted text-uppercase fw-semibold small mb-3">
              Risk Classification
            </h6>

            <FormSelect
              id="riskLevel"
              label="Risk Level"
              disabled={isSubmitting}
              options={RISK_OPTIONS}
              style={{ maxWidth: '300px' }}
              hint="Initial risk classification. Can be reassessed later."
              error={errors.riskLevel?.message}
              {...register('riskLevel')}
            />
          </div>
        </div>

        <div className="alert alert-info mb-3">
          <i className="bi bi-info-circle me-2"></i>
          <span className="small">
            New merchants start in <strong>PENDING</strong> status and become <strong>ACTIVE</strong>
            automatically once KYC documents are submitted.
          </span>
        </div>

        <div className="d-flex gap-2 mb-4">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Creating...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-1"></i>
                Create Merchant
              </>
            )}
          </button>
          <Link
            to="/merchants"
            className={`btn btn-outline-secondary ${isSubmitting ? 'disabled' : ''}`}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default MerchantForm;
