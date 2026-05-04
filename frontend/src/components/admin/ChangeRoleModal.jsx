import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changeRoleSchema, VALID_ROLES } from '../../schemas/authSchemas';
import FormSelect from '../form/FormSelect';

const ROLE_OPTIONS = VALID_ROLES.map((r) => ({ value: r, label: r.replace('_', ' ') }));

export default function ChangeRoleModal({ show, user, onClose, onSaved }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changeRoleSchema),
    values: { role: user?.role ?? 'VIEWER' },
  });

  const onSubmit = async (data) => {
    await onSaved(data.role);
    reset();
  };

  if (!show) return null;

  return (
    <>
      <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
        <div className="modal-dialog modal-sm">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title">
                <i className="bi bi-person-gear me-2"></i>Change Role
              </h6>
              <button type="button" className="btn-close" onClick={onClose} disabled={isSubmitting} />
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <p className="text-muted small mb-3">
                  Changing role for <strong>{user?.username}</strong>.
                </p>
                <FormSelect
                  id="role"
                  label="New Role"
                  required
                  options={ROLE_OPTIONS}
                  error={errors.role?.message}
                  disabled={isSubmitting}
                  {...register('role')}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><span className="spinner-border spinner-border-sm me-1" role="status"></span>Saving…</>
                  ) : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} />
    </>
  );
}
